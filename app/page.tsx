"use client";

import {
  ArrowDownCircle,
  PiggyBank,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BudgetInputs } from "./_components/budget-inputs";
import { BudgetResultsPanel } from "./_components/budget-results-panel";
import {
  CurrencySelector,
  ExpenseBreakdown,
  SummaryCard,
} from "./_components/budget-ui";
import { MobileBudgetWizard } from "./_components/mobile-budget-wizard";
import {
  currencies,
  expenseFields,
  formatCurrency,
  getPercentage,
  initialExpenses,
  isExchangeRatesResponse,
  type CurrencyCode,
  type ExchangeRatesResponse,
  type Expenses,
} from "./_lib/budget-model";

export default function Home() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState<Expenses>(initialExpenses);
  const [savingsGoal, setSavingsGoal] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("NGN");
  const [exchangeRates, setExchangeRates] =
    useState<ExchangeRatesResponse["rates"] | null>(null);
  const [rateError, setRateError] = useState("");
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [rateRetryCount, setRateRetryCount] = useState(0);
  const [shareStatus, setShareStatus] = useState<
    "idle" | "copied" | "shared"
  >("idle");
  const [summaryCopied, setSummaryCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRates() {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/NGN", {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Could not load exchange rates.");

        const data: unknown = await response.json();
        if (!isExchangeRatesResponse(data)) {
          throw new Error("The exchange-rate service returned invalid data.");
        }

        setExchangeRates(data.rates);
        setRateError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          setRateError(
            error instanceof Error
              ? error.message
              : "Could not load exchange rates."
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingRates(false);
      }
    }

    void loadRates();
    return () => controller.abort();
  }, [rateRetryCount]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasSharedBudget =
      expenseFields.some((field) => params.has(field.key)) ||
      params.has("income") ||
      params.has("savings") ||
      params.has("currency");

    if (!hasSharedBudget) return;

    const sharedCurrency = params.get("currency");
    if (currencies.some(({ code }) => code === sharedCurrency)) {
      setCurrency(sharedCurrency as CurrencyCode);
    }

    const readNumber = (key: string) => {
      const value = Number(params.get(key));
      return Number.isFinite(value) && value >= 0 ? value : 0;
    };

    setIncome(params.has("income") ? String(readNumber("income")) : "");
    setSavingsGoal(
      params.has("savings") ? String(readNumber("savings")) : ""
    );

    const sharedExpenses = { ...initialExpenses };
    expenseFields.forEach((field) => {
      if (params.has(field.key)) {
        sharedExpenses[field.key] = readNumber(field.key);
      }
    });
    setExpenses(sharedExpenses);
  }, []);

  const calculations = useMemo(() => {
    const monthlyIncome = Number(income) || 0;
    const totalExpenses = Object.values(expenses).reduce(
      (total, value) => total + (Number(value) || 0),
      0
    );
    const savings = Number(savingsGoal) || 0;
    const committed = totalExpenses + savings;
    const remaining = monthlyIncome - committed;

    let budgetStatus: "empty" | "over" | "tight" | "healthy";
    if (monthlyIncome <= 0) {
      budgetStatus = "empty";
    } else if (remaining < 0) {
      budgetStatus = "over";
    } else if (remaining / monthlyIncome < 0.1) {
      budgetStatus = "tight";
    } else {
      budgetStatus = "healthy";
    }

    const expenseRate = getPercentage(totalExpenses, monthlyIncome);
    const savingsRate = getPercentage(savings, monthlyIncome);
    const committedRate = getPercentage(committed, monthlyIncome);
    const expenseBreakdown = expenseFields
      .map((field) => ({
        ...field,
        value: expenses[field.key],
        percentage:
          totalExpenses > 0
            ? (expenses[field.key] / totalExpenses) * 100
            : 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
    const largestExpense = expenseFields.reduce(
      (largest, field) =>
        expenses[field.key] > largest.value
          ? { label: field.label, value: expenses[field.key] }
          : largest,
      { label: "None", value: 0 }
    );

    return {
      monthlyIncome,
      totalExpenses,
      savings,
      remaining,
      expenseRate,
      savingsRate,
      committedRate,
      largestExpense,
      expenseBreakdown,
      budgetStatus,
    };
  }, [income, expenses, savingsGoal]);

  const {
    monthlyIncome,
    totalExpenses,
    savings,
    remaining,
    expenseRate,
    savingsRate,
    committedRate,
    largestExpense,
    expenseBreakdown,
    budgetStatus,
  } = calculations;
  const budgetIsOver = remaining < 0;
  const hasBudget = monthlyIncome > 0;

  function updateExpense(key: keyof Expenses, value: string) {
    setExpenses((current) => ({
      ...current,
      [key]: Number(value) || 0,
    }));
  }

  function changeCurrency(nextCurrency: CurrencyCode) {
    if (!exchangeRates || nextCurrency === currency) return;

    const conversionFactor =
      exchangeRates[nextCurrency] / exchangeRates[currency];
    const convertAmount = (value: number) =>
      Number((value * conversionFactor).toFixed(2));

    setIncome((current) =>
      current ? String(convertAmount(Number(current))) : ""
    );
    setSavingsGoal((current) =>
      current ? String(convertAmount(Number(current))) : ""
    );
    setExpenses((current) => {
      const convertedExpenses = { ...current };
      expenseFields.forEach(({ key }) => {
        convertedExpenses[key] = convertAmount(current[key]);
      });
      return convertedExpenses;
    });
    setCurrency(nextCurrency);
  }

  function resetBudget() {
    setIncome("");
    setSavingsGoal("");
    setExpenses(initialExpenses);
    setShareStatus("idle");
    setSummaryCopied(false);

    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }

  function createShareUrl() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();
    params.set("currency", currency);

    if (monthlyIncome > 0) params.set("income", String(monthlyIncome));
    if (savings > 0) params.set("savings", String(savings));
    expenseFields.forEach((field) => {
      const value = expenses[field.key];
      if (value > 0) params.set(field.key, String(value));
    });

    url.search = params.toString();
    url.hash = "";
    return url.toString();
  }

  async function copyText(text: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  async function shareBudget() {
    const shareUrl = createShareUrl();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Budgetall Budget",
          text: "Here is my monthly budget from Budgetall.",
          url: shareUrl,
        });
        setShareStatus("shared");
      } else {
        await copyText(shareUrl);
        setShareStatus("copied");
      }
      window.setTimeout(() => setShareStatus("idle"), 2500);
    } catch {
      // Sharing can be cancelled by the user.
    }
  }

  async function copySummary() {
    const breakdown = expenseBreakdown.length
      ? expenseBreakdown
          .map(
            (item) =>
              `- ${item.label}: ${formatCurrency(item.value, currency)} (${item.percentage.toFixed(1)}%)`
          )
          .join("\n")
      : "- No expenses entered";

    const health =
      budgetStatus === "over"
        ? "Over budget"
        : budgetStatus === "tight"
          ? "Budget is tight"
          : budgetStatus === "healthy"
            ? "Budget is healthy"
            : "Not enough information";
    const summary = [
      "BUDGETALL — MONTHLY BUDGET SUMMARY",
      "",
      `Monthly income: ${formatCurrency(monthlyIncome, currency)}`,
      `Total expenses: ${formatCurrency(totalExpenses, currency)}`,
      `Savings goal: ${formatCurrency(savings, currency)}`,
      `Money remaining: ${budgetIsOver ? "-" : ""}${formatCurrency(Math.abs(remaining), currency)}`,
      `Savings rate: ${Math.round(savingsRate)}%`,
      `Budget health: ${health}`,
      "",
      "EXPENSE BREAKDOWN",
      breakdown,
      "",
      "Created with Budgetall — Your money. Your plan. Your clarity.",
    ].join("\n");

    try {
      await copyText(summary);
      setSummaryCopied(true);
      window.setTimeout(() => setSummaryCopied(false), 2500);
    } catch {
      // Clipboard failures do not prevent use of the calculator.
    }
  }

  function retryExchangeRates() {
    setRateError("");
    setIsLoadingRates(true);
    setRateRetryCount((count) => count + 1);
  }

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-[#17251f]">
      <MobileBudgetWizard
        income={income}
        onIncomeChange={setIncome}
        expenses={expenses}
        updateExpense={updateExpense}
        savingsGoal={savingsGoal}
        onSavingsGoalChange={setSavingsGoal}
        currency={currency}
        onCurrencyChange={changeCurrency}
        currencyDisabled={!exchangeRates}
        isLoadingRates={isLoadingRates}
        rateError={rateError}
        onRetryRates={retryExchangeRates}
        monthlyIncome={monthlyIncome}
        totalExpenses={totalExpenses}
        savings={savings}
        remaining={remaining}
        expenseRate={expenseRate}
        savingsRate={savingsRate}
        largestExpense={largestExpense}
        hasBudget={hasBudget}
        budgetIsOver={budgetIsOver}
        budgetStatus={budgetStatus}
        expenseBreakdown={expenseBreakdown}
      />

      <nav className="border-b border-[#dfe5df] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1d7a5a] via-[#2e9f79] to-[#0b3f35] shadow-sm">
              <svg
                viewBox="0 0 64 64"
                className="h-8 w-8"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Budgetall logo"
                role="img"
              >
                <path
                  d="M22 19.5h20c2.8 0 5 2.2 5 5v1.4H17v-1.4c0-2.8 2.2-5 5-5Z"
                  fill="#F8FBF9"
                  opacity="0.96"
                />
                <path
                  d="M18 22c0-3.3 2.7-6 6-6h16c3.3 0 6 2.7 6 6v2.2H18V22Zm0 4.8h28v17.2c0 4.1-3.3 7.4-7.4 7.4H25.4c-4.1 0-7.4-3.3-7.4-7.4V26.8Z"
                  fill="#F8FBF9"
                />
                <path
                  d="M25 32.5h18M25 38.5h12M25 44.5h17"
                  stroke="#173c31"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <circle cx="42" cy="38.5" r="5" fill="#DCEFE5" />
                <path
                  d="M42 33.4v10.2M37 38.5h10"
                  stroke="#173c31"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#173c31]">
                BUDGETALL
              </h1>
              <p className="text-xs text-gray-500">
                Your money. Your plan. Your clarity.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
            <CurrencySelector
              id="header-budget-currency"
              currency={currency}
              onChange={changeCurrency}
              disabled={!exchangeRates}
              isLoading={isLoadingRates}
              error={rateError}
              onRetry={retryExchangeRates}
            />
            <button
              type="button"
              onClick={resetBudget}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-5 pb-8 pt-10 lg:px-8 lg:pt-14">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-[#e4f0eb] px-3 py-1.5 text-xs font-bold tracking-wide text-[#24634f]">
            PERSONAL BUDGET CALCULATOR
          </span>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-[#173c31] sm:text-5xl">
            Know exactly where your money goes.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Enter your income, expenses and savings goal. Budgetall gives you
            an instant picture of your monthly finances.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Monthly income"
            value={formatCurrency(monthlyIncome, currency)}
            icon={ArrowDownCircle}
          />
          <SummaryCard
            label="Total expenses"
            value={formatCurrency(totalExpenses, currency)}
            icon={TrendingDown}
          />
          <SummaryCard
            label="Savings goal"
            value={formatCurrency(savings, currency)}
            icon={PiggyBank}
          />
          <SummaryCard
            label="Money remaining"
            value={
              budgetIsOver
                ? `-${formatCurrency(Math.abs(remaining), currency)}`
                : formatCurrency(remaining, currency)
            }
            icon={Wallet}
            danger={budgetIsOver}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.8fr]">
          <BudgetInputs
            income={income}
            onIncomeChange={setIncome}
            expenses={expenses}
            updateExpense={updateExpense}
            savingsGoal={savingsGoal}
            onSavingsGoalChange={setSavingsGoal}
            currency={currency}
          />
          <BudgetResultsPanel
            currency={currency}
            monthlyIncome={monthlyIncome}
            totalExpenses={totalExpenses}
            savings={savings}
            remaining={remaining}
            budgetIsOver={budgetIsOver}
            budgetStatus={budgetStatus}
            committedRate={committedRate}
            expenseRate={expenseRate}
            savingsRate={savingsRate}
            largestExpense={largestExpense}
            hasBudget={hasBudget}
            shareStatus={shareStatus}
            summaryCopied={summaryCopied}
            onShare={shareBudget}
            onCopySummary={copySummary}
          />
        </div>
      </section>

      <ExpenseBreakdown items={expenseBreakdown} currency={currency} />

      <footer className="border-t border-[#dfe5df] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-7 text-center lg:px-8">
          <p className="text-sm font-bold text-[#173c31]">BUDGETALL</p>
          <p className="mt-1 text-xs text-gray-400">
            A simple tool for understanding your monthly budget.
          </p>
        </div>
      </footer>
    </main>
  );
}
