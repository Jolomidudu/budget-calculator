"use client";

import {
  AlertTriangle,
  ArrowDownCircle,
  BarChart3,
  CarFront,
  CheckCircle2,
  Check,
  Copy,
  CreditCard,
  Film,
  House,
  Lightbulb,
  PiggyBank,
  Share2,
  ShoppingBag,
  Smartphone,
  TrendingDown,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Expenses = {
  housing: number;
  food: number;
  transportation: number;
  utilities: number;
  phone: number;
  debt: number;
  entertainment: number;
  other: number;
};

type CurrencyCode = "NGN" | "GBP" | "USD" | "CNY" | "ZAR" | "AED";

type ExchangeRatesResponse = {
  result: string;
  base_code: string;
  time_last_update_utc: string;
  rates: Record<CurrencyCode, number>;
};

const currencies: { code: CurrencyCode; label: string }[] = [
  { code: "NGN", label: "Nigerian naira" },
  { code: "GBP", label: "British pounds" },
  { code: "USD", label: "US dollars" },
  { code: "CNY", label: "Chinese yuan" },
  { code: "ZAR", label: "South African rand" },
  { code: "AED", label: "UAE dirhams" },
];

const initialExpenses: Expenses = {
  housing: 0,
  food: 0,
  transportation: 0,
  utilities: 0,
  phone: 0,
  debt: 0,
  entertainment: 0,
  other: 0,
};

const expenseFields: {
  key: keyof Expenses;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    key: "housing",
    label: "Housing",
    description: "Rent, mortgage or accommodation",
    icon: House,
  },
  {
    key: "food",
    label: "Food",
    description: "Groceries, meals and dining",
    icon: UtensilsCrossed,
  },
  {
    key: "transportation",
    label: "Transportation",
    description: "Fuel, transport and commuting",
    icon: CarFront,
  },
  {
    key: "utilities",
    label: "Utilities",
    description: "Electricity, water and bills",
    icon: Lightbulb,
  },
  {
    key: "phone",
    label: "Phone & Internet",
    description: "Mobile data, calls and internet",
    icon: Smartphone,
  },
  {
    key: "debt",
    label: "Debt Payments",
    description: "Loans, credit and repayments",
    icon: CreditCard,
  },
  {
    key: "entertainment",
    label: "Entertainment",
    description: "Movies, outings and subscriptions",
    icon: Film,
  },
  {
    key: "other",
    label: "Other",
    description: "Everything else",
    icon: ShoppingBag,
  },
];

function formatCurrency(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(Math.max(0, value));
}

function isExchangeRatesResponse(value: unknown): value is ExchangeRatesResponse {
  if (typeof value !== "object" || value === null) return false;

  const data = value as Partial<ExchangeRatesResponse>;
  return (
    data.result === "success" &&
    data.base_code === "NGN" &&
    typeof data.time_last_update_utc === "string" &&
    typeof data.rates === "object" &&
    data.rates !== null &&
    currencies.every(
      ({ code }) =>
        Number.isFinite(data.rates?.[code]) && (data.rates?.[code] ?? 0) > 0
    )
  );
}

function getCurrencySymbol(currency: CurrencyCode) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency;
}

function formatNumberInput(value: string) {
  const [integerPart, ...decimalParts] = value.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimalParts.length
    ? `${formattedInteger}.${decimalParts.join("")}`
    : formattedInteger;
}

function getPercentage(value: number, total: number) {
  if (!total || total <= 0) return 0;

  return (value / total) * 100;
}

export default function Home() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState<Expenses>(initialExpenses);
  const [savingsGoal, setSavingsGoal] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("NGN");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRatesResponse["rates"] | null>(null);
  const [rateError, setRateError] = useState("");
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [rateRetryCount, setRateRetryCount] = useState(0);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared">("idle");
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
    const hasSharedBudget = expenseFields.some((field) => params.has(field.key)) ||
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
          ? {
              label: field.label,
              value: expenses[field.key],
            }
          : largest,
      {
        label: "None",
        value: 0,
      }
    );

    return {
      monthlyIncome,
      totalExpenses,
      savings,
      committed,
      remaining,
      expenseRate,
      savingsRate,
      committedRate,
      largestExpense,
      expenseBreakdown,
      budgetStatus,
    };
  }, [income, expenses, savingsGoal]);

  function updateExpense(key: keyof Expenses, value: string) {
    setExpenses((current) => ({
      ...current,
      [key]: Number(value) || 0,
    }));
  }

  function changeCurrency(nextCurrency: CurrencyCode) {
    if (!exchangeRates) return;
    if (nextCurrency === currency) return;

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
      if (value > 0) {
        params.set(field.key, String(value));
      }
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
      // Sharing can be cancelled by the user; no error message is needed.
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
      // Ignore clipboard failures; the calculator remains fully usable.
    }
  }

  const {
    monthlyIncome,
    totalExpenses,
    savings,
    committed,
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
        onRetryRates={() => {
          setRateError("");
          setIsLoadingRates(true);
          setRateRetryCount((count) => count + 1);
        }}
        monthlyIncome={monthlyIncome}
        totalExpenses={totalExpenses}
        savings={savings}
        remaining={remaining}
        budgetIsOver={budgetIsOver}
        budgetStatus={budgetStatus}
        expenseBreakdown={expenseBreakdown}
      />

      {/* Header */}
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

                <circle
                  cx="42"
                  cy="38.5"
                  r="5"
                  fill="#DCEFE5"
                />

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
              currency={currency}
              onChange={changeCurrency}
              disabled={!exchangeRates}
              isLoading={isLoadingRates}
              error={rateError}
              onRetry={() => {
                setRateError("");
                setIsLoadingRates(true);
                setRateRetryCount((count) => count + 1);
              }}
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

      {/* Hero */}
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

      {/* Summary Cards */}
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

      {/* Main */}
      <section className="mx-auto max-w-6xl px-5 pb-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.8fr]">
          {/* Inputs */}
          <div className="space-y-6">
            {/* Income */}
            <section className="rounded-3xl border border-[#dfe5df] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-bold tracking-wide text-[#397b65]">
                  STEP 1
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  What is your monthly income?
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Use your take-home income after deductions.
                </p>
              </div>

              <CurrencyInput
                value={income}
                onChange={setIncome}
                placeholder="500,000"
                currency={currency}
                formatWithCommas
              />
            </section>

            {/* Expenses */}
            <section className="rounded-3xl border border-[#dfe5df] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-bold tracking-wide text-[#397b65]">
                  STEP 2
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  What do you spend each month?
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Add your regular monthly expenses.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {expenseFields.map((field) => (
                  <div
                    key={field.key}
                    className="rounded-2xl border border-gray-100 bg-[#fafbfa] p-4 transition hover:border-[#cbdad3]"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                        <field.icon className="h-4 w-4 text-[#397b65]" />
                      </span>

                      <div className="min-w-0">
                        <p className="font-semibold">{field.label}</p>

                        <p className="mt-0.5 text-xs leading-5 text-gray-500">
                          {field.description}
                        </p>
                      </div>
                    </div>

                    <CurrencyInput
                      value={
                        expenses[field.key]
                          ? String(expenses[field.key])
                          : ""
                      }
                      onChange={(value) =>
                        updateExpense(field.key, value)
                      }
                      placeholder="0"
                      small
                      currency={currency}
                      formatWithCommas
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Savings */}
            <section className="rounded-3xl border border-[#dfe5df] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-bold tracking-wide text-[#397b65]">
                  STEP 3
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  How much do you want to save?
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Set a monthly savings target.
                </p>
              </div>

              <CurrencyInput
                value={savingsGoal}
                onChange={setSavingsGoal}
                placeholder="100,000"
                currency={currency}
                formatWithCommas
              />
            </section>
          </div>

          {/* Results */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-[#dfe5df] bg-white shadow-sm">
              {/* Result Header */}
              <div className="bg-[#173c31] p-6 text-white sm:p-7">
                <p className="text-xs font-bold tracking-wide text-[#b9d8cb]">
                  YOUR BUDGET
                </p>

                <p className="mt-5 text-sm text-[#b9d8cb]">
                  Money remaining
                </p>

                <p className="mt-1 break-words text-4xl font-black tracking-tight">
                  {budgetIsOver
                    ? `-${formatCurrency(Math.abs(remaining), currency)}`
                    : formatCurrency(remaining, currency)}
                </p>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-[#b9d8cb] transition-all duration-500"
                    style={{
                      width: `${Math.min(committedRate, 100)}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-[#b9d8cb]">
                  <span>Committed</span>
                  <span>{Math.round(committedRate)}%</span>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-6 p-6 sm:p-7">
                <ResultRow
                  label="Income"
                  value={formatCurrency(monthlyIncome, currency)}
                />

                <ResultRow
                  label="Expenses"
                  value={formatCurrency(totalExpenses, currency)}
                />

                <ResultRow
                  label="Savings"
                  value={formatCurrency(savings, currency)}
                />

                {/* Expense Ratio */}
                <div className="border-t border-gray-100 pt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Expense ratio
                    </span>

                    <span className="text-sm font-bold text-[#397b65]">
                      {Math.round(expenseRate)}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#397b65] transition-all duration-500"
                      style={{
                        width: `${Math.min(expenseRate, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Savings Rate */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Savings rate
                    </span>

                    <span className="text-sm font-bold text-[#397b65]">
                      {Math.round(savingsRate)}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#9db9aa] transition-all duration-500"
                      style={{
                        width: `${Math.min(savingsRate, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Insight */}
                <div
                  className={`rounded-2xl p-4 ${
                    budgetIsOver ? "bg-red-50" : "bg-[#f1f6f3]"
                  }`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-wide ${
                      budgetIsOver
                        ? "text-red-600"
                        : "text-[#397b65]"
                    }`}
                  >
                    Budget insight
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {!hasBudget
                      ? "Enter your monthly income to see your budget insight."
                      : budgetIsOver
                        ? `Your plan is ${formatCurrency(
                            Math.abs(remaining), currency
                          )} over your income. Consider reducing some expenses or adjusting your savings goal.`
                        : savingsRate >= 20
                          ? "Your savings target is at least 20% of your income. You're giving yourself room to build a financial cushion."
                          : savingsRate > 0
                            ? "You have a savings target in place. Consider gradually increasing it as your income allows."
                            : "You haven't set a savings target yet. Try starting with an amount you can comfortably maintain each month."}
                  </p>
                </div>

                {/* Largest Expense */}
                {hasBudget && largestExpense.value > 0 && (
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      Largest expense
                    </p>

                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div>
                        <p className="font-bold">
                          {largestExpense.label}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {Math.round(
                            getPercentage(
                              largestExpense.value,
                              totalExpenses
                            )
                          )}
                          % of your expenses
                        </p>
                      </div>

                      <p className="font-bold text-[#173c31]">
                        {formatCurrency(largestExpense.value, currency)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Budget Health */}
                {hasBudget && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      Budget health
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          budgetStatus === "over"
                            ? "bg-red-100 text-red-600"
                            : budgetStatus === "tight"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-[#dcece4] text-[#397b65]"
                        }`}
                      >
                        {budgetStatus === "over" || budgetStatus === "tight" ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </span>

                      <div>
                        <p className="text-sm font-bold text-[#173c31]">
                          {budgetStatus === "over"
                            ? "Over budget"
                            : budgetStatus === "tight"
                              ? "Budget is tight"
                              : "Budget is healthy"}
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-gray-500">
                          {budgetStatus === "over"
                            ? "Your planned expenses and savings exceed your income."
                            : budgetStatus === "tight"
                              ? "Only a small portion of your income remains uncommitted."
                              : "Your planned spending leaves room after expenses and savings."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sharing */}
                <div className="border-t border-gray-100 pt-5">
                  <div className="mb-3">
                    <p className="text-sm font-bold text-[#173c31]">
                      Share your budget
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Share a link or copy a summary of this budget.
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <button
                      type="button"
                      onClick={shareBudget}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#173c31] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#245345]"
                    >
                      {shareStatus === "shared" ? (
                        <Check className="h-4 w-4" />
                      ) : shareStatus === "copied" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                      {shareStatus === "shared"
                        ? "Budget shared"
                        : shareStatus === "copied"
                          ? "Link copied"
                          : "Share budget"}
                    </button>

                    <button
                      type="button"
                      onClick={copySummary}
                      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#173c31] transition hover:bg-gray-50"
                    >
                      {summaryCopied ? (
                        <Check className="h-4 w-4 text-[#397b65]" />
                      ) : (
                        <Copy className="h-4 w-4 text-[#397b65]" />
                      )}
                      {summaryCopied ? "Summary copied" : "Copy summary"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-gray-400">
              Budgetall is a simple budgeting tool and does not provide
              financial advice.
            </p>
          </aside>
        </div>
      </section>

      {/* Expense Breakdown */}
      <section className="mx-auto max-w-6xl px-5 pb-16 lg:px-8">
        <div className="rounded-3xl border border-[#dfe5df] bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6">
            <p className="text-xs font-bold tracking-[0.18em] text-[#397b65]">
              EXPENSE BREAKDOWN
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#173c31]">
              Where your money goes
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              See which categories take the biggest share of your monthly
              spending.
            </p>
          </div>

          {expenseBreakdown.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cfdad4] bg-[#f7faf8] px-6 py-10 text-center">
              <div className="flex justify-center">
                <BarChart3 className="h-10 w-10 text-[#397b65]" />
              </div>

              <h3 className="mt-3 font-semibold text-[#173c31]">
                Your breakdown will appear here
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Enter your expenses above and Budgetall will show you exactly
                where your money is going.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {expenseBreakdown.map((item) => (
                <div key={item.key}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf5f1] text-lg">
                        <item.icon className="h-4 w-4 text-[#397b65]" />
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#173c31]">
                          {item.label}
                        </p>

                        <p className="text-xs text-gray-500">
                          {item.percentage.toFixed(1)}% of expenses
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-[#173c31]">
                      {formatCurrency(item.value, currency)}
                    </p>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-[#edf1ee]">
                    <div
                      className="h-full rounded-full bg-[#397b65] transition-all duration-500"
                      style={{
                        width: `${Math.min(item.percentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
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

function SummaryCard({
  label,
  value,
  icon: Icon,
  danger = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#dfe5df] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
            danger
              ? "bg-red-50 text-red-500"
              : "bg-[#edf5f1] text-[#397b65]"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <p
        className={`mt-3 break-words text-xl font-black ${
          danger ? "text-red-600" : "text-[#173c31]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ResultRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500">{label}</span>

      <span className="text-sm font-bold text-[#17251f]">{value}</span>
    </div>
  );
}

function MobileBudgetWizard({
  income,
  onIncomeChange,
  expenses,
  updateExpense,
  savingsGoal,
  onSavingsGoalChange,
  currency,
  onCurrencyChange,
  currencyDisabled,
  isLoadingRates,
  rateError,
  onRetryRates,
  monthlyIncome,
  totalExpenses,
  savings,
  remaining,
  budgetIsOver,
  budgetStatus,
  expenseBreakdown,
}: {
  income: string;
  onIncomeChange: (value: string) => void;
  expenses: Expenses;
  updateExpense: (key: keyof Expenses, value: string) => void;
  savingsGoal: string;
  onSavingsGoalChange: (value: string) => void;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  currencyDisabled: boolean;
  isLoadingRates: boolean;
  rateError: string;
  onRetryRates: () => void;
  monthlyIncome: number;
  totalExpenses: number;
  savings: number;
  remaining: number;
  budgetIsOver: boolean;
  budgetStatus: "empty" | "over" | "tight" | "healthy";
  expenseBreakdown: {
    key: keyof Expenses;
    label: string;
    description: string;
    icon: LucideIcon;
    value: number;
    percentage: number;
  }[];
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-[#17251f]/55 sm:hidden">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-wizard-title"
        className="flex h-dvh w-full flex-col bg-[#f6f8f5]"
      >
        <header className="border-b border-[#dfe5df] bg-white px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-wide text-[#397b65]">
                BUDGETALL  - <span className="inline-flex rounded-full bg-[#e4f0eb] px-3 py-1.5 text-xs font-bold tracking-wide text-[#24634f]">
            PERSONAL BUDGET CALCULATOR
          </span>
              </p>
              
              <h2
                id="mobile-wizard-title"
                className="mt-1 text-lg font-bold text-[#173c31]"
              >
               Know exactly where your money goes.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100"
            >
              Skip
            </button>
          </div>

          <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full ${
                  index < step ? "bg-[#397b65]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-gray-500">
              Step {step} of 5
            </p>
            {step <= 3 && (
              <CurrencySelector
                currency={currency}
                onChange={onCurrencyChange}
                disabled={currencyDisabled}
                isLoading={isLoadingRates}
                error={rateError}
                onRetry={onRetryRates}
              />
            )}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          {step === 1 && (
            <div className="rounded-3xl border border-[#dfe5df] bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-wide text-[#397b65]">
                STEP 1
              </p>
              <h3 className="mt-2 text-2xl font-bold text-[#173c31]">
                What is your monthly income?
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Use your take-home income after deductions.
              </p>
              <div className="mt-6">
                <CurrencyInput
                  value={income}
                  onChange={onIncomeChange}
                  placeholder="500,000"
                  currency={currency}
                  formatWithCommas
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-xs font-bold tracking-wide text-[#397b65]">
                STEP 2
              </p>
              <h3 className="mt-2 text-2xl font-bold text-[#173c31]">
                What do you spend each month?
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Add your regular monthly expenses.
              </p>
              <div className="mt-5 space-y-3">
                {expenseFields.map((field) => (
                  <label
                    key={field.key}
                    className="block rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <span className="flex items-center gap-2 font-semibold text-[#173c31]">
                      <field.icon className="h-4 w-4 text-[#397b65]" />
                      {field.label}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {field.description}
                    </span>
                    <span className="mt-3 block">
                      <CurrencyInput
                        value={
                          expenses[field.key]
                            ? String(expenses[field.key])
                            : ""
                        }
                        onChange={(value) => updateExpense(field.key, value)}
                        placeholder="0"
                        small
                        currency={currency}
                        formatWithCommas
                      />
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="rounded-3xl border border-[#dfe5df] bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-wide text-[#397b65]">
                STEP 3
              </p>
              <h3 className="mt-2 text-2xl font-bold text-[#173c31]">
                How much do you want to save?
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Set a monthly savings target.
              </p>
              <div className="mt-6">
                <CurrencyInput
                  value={savingsGoal}
                  onChange={onSavingsGoalChange}
                  placeholder="100,000"
                  currency={currency}
                  formatWithCommas
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-xs font-bold tracking-wide text-[#397b65]">
                STEP 4
              </p>
              <h3 className="mt-2 text-2xl font-bold text-[#173c31]">
                Your budget at a glance
              </h3>
              <div
                className={`mt-5 rounded-3xl p-5 text-white ${
                  budgetIsOver ? "bg-red-700" : "bg-[#173c31]"
                }`}
              >
                <p className="text-sm text-white/75">Money remaining</p>
                <p className="mt-1 break-words text-3xl font-black">
                  {budgetIsOver ? "-" : ""}
                  {formatCurrency(Math.abs(remaining), currency)}
                </p>
                <p className="mt-3 text-sm font-semibold">
                  {budgetStatus === "over"
                    ? "Your plan is over budget."
                    : budgetStatus === "tight"
                      ? "Your budget is tight."
                      : budgetStatus === "healthy"
                        ? "Your budget is healthy."
                        : "Enter your income to see your budget status."}
                </p>
              </div>
              <div className="mt-4 space-y-3 rounded-2xl border border-[#dfe5df] bg-white p-5">
                <ResultRow
                  label="Monthly income"
                  value={formatCurrency(monthlyIncome, currency)}
                />
                <ResultRow
                  label="Total expenses"
                  value={formatCurrency(totalExpenses, currency)}
                />
                <ResultRow
                  label="Savings goal"
                  value={formatCurrency(savings, currency)}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <p className="text-xs font-bold tracking-wide text-[#397b65]">
                STEP 5
              </p>
              <h3 className="mt-2 text-2xl font-bold text-[#173c31]">
                Your expense breakdown
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                See which categories take the biggest share of your spending.
              </p>
              {expenseBreakdown.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[#cfdad4] bg-white px-5 py-10 text-center">
                  <BarChart3 className="mx-auto h-9 w-9 text-[#397b65]" />
                  <p className="mt-3 font-semibold text-[#173c31]">
                    No expenses entered yet
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    You can add expenses by going back to Step 2.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4 rounded-2xl border border-[#dfe5df] bg-white p-5">
                  {expenseBreakdown.map((item) => (
                    <div key={item.key}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <item.icon className="h-4 w-4 shrink-0 text-[#397b65]" />
                          <span className="truncate text-sm font-semibold text-[#173c31]">
                            {item.label}
                          </span>
                          <span className="shrink-0 text-xs text-gray-500">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-[#173c31]">
                          {formatCurrency(item.value, currency)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#edf1ee]">
                        <div
                          className="h-full rounded-full bg-[#397b65]"
                          style={{
                            width: `${Math.min(item.percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="border-t border-[#dfe5df] bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-[#173c31]"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (step === 5) {
                  setIsOpen(false);
                } else {
                  setStep((current) => current + 1);
                }
              }}
              className="flex-1 rounded-xl bg-[#173c31] px-4 py-3 font-semibold text-white transition hover:bg-[#245345]"
            >
              {step === 5 ? "Finish" : step === 3 ? "See my budget" : "Continue"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function CurrencySelector({
  currency,
  onChange,
  disabled,
  isLoading,
  error,
  onRetry,
}: {
  currency: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  disabled: boolean;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="budget-currency" className="text-xs font-semibold text-gray-500">
        Currency
      </label>
      <select
        id="budget-currency"
        value={currency}
        disabled={disabled}
        onChange={(event) => {
          const nextCurrency = currencies.find(
            ({ code }) => code === event.currentTarget.value
          );
          if (nextCurrency) onChange(nextCurrency.code);
        }}
        className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-[#17251f] outline-none transition focus:border-[#397b65] disabled:cursor-wait disabled:opacity-60"
      >
        {currencies.map(({ code, label }) => (
          <option key={code} value={code}>
            {code} — {label}
          </option>
        ))}
      </select>
      {isLoading && (
        <span className="text-xs text-gray-400">Loading rates…</span>
      )}
      {error && (
        <div className="flex items-center gap-2">
          <p role="alert" className="max-w-40 text-xs text-red-600">
            {error}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-semibold text-[#397b65] underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
  small = false,
  formatWithCommas = false,
  currency = "NGN",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  small?: boolean;
  formatWithCommas?: boolean;
  currency?: CurrencyCode;
}) {
  return (
    <div className="relative">
      <span
        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-400 ${
          small ? "text-sm" : "text-lg"
        }`}
      >
        {getCurrencySymbol(currency)}
      </span>

      <input
        type={formatWithCommas ? "text" : "number"}
        inputMode={formatWithCommas ? "decimal" : undefined}
        min={formatWithCommas ? undefined : "0"}
        value={formatWithCommas ? formatNumberInput(value) : value}
        onChange={(e) => {
          if (!formatWithCommas) {
            onChange(e.currentTarget.value);
            return;
          }

          const input = e.currentTarget;
          const cursor = input.selectionStart ?? input.value.length;
          const charactersBeforeCursor = input.value
            .slice(0, cursor)
            .replace(/,/g, "").length;
          const sanitizedValue = input.value
            .replace(/,/g, "")
            .replace(/[^\d.]/g, "");
          const [integerPart, ...decimalParts] = sanitizedValue.split(".");
          const nextValue = decimalParts.length
            ? `${integerPart}.${decimalParts.join("")}`
            : integerPart;
          const formattedValue = formatNumberInput(nextValue);
          let nextCursor = 0;
          let charactersSeen = 0;

          while (
            nextCursor < formattedValue.length &&
            charactersSeen < charactersBeforeCursor
          ) {
            if (formattedValue[nextCursor] !== ",") charactersSeen += 1;
            nextCursor += 1;
          }

          onChange(nextValue);
          requestAnimationFrame(() => {
            input.setSelectionRange(nextCursor, nextCursor);
          });
        }}
        placeholder={placeholder}
        className={`w-full border border-gray-200 bg-[#fafbfa] font-semibold outline-none transition placeholder:text-gray-300 focus:border-[#397b65] focus:ring-4 focus:ring-[#397b65]/10 ${
          small
            ? "rounded-xl py-3 pl-9 pr-3 text-sm"
            : "rounded-2xl py-4 pl-11 pr-4 text-xl"
        }`}
      />
    </div>
  );
}