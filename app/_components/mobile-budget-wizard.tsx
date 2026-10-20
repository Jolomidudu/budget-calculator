"use client";

import { useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2 } from "lucide-react";
import {
  expenseFields,
  formatCurrency,
  getCurrencySymbol,
  type CalculatedExpense,
  type CurrencyCode,
  type Expenses,
} from "../_lib/budget-model";
import {
  CurrencyInput,
  CurrencySelector,
  ResultRow,
} from "./budget-ui";

export function MobileBudgetWizard({
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
  expenseRate,
  savingsRate,
  largestExpense,
  hasBudget,
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
  expenseRate: number;
  savingsRate: number;
  largestExpense: { label: string; value: number };
  hasBudget: boolean;
  budgetIsOver: boolean;
  budgetStatus: "empty" | "over" | "tight" | "healthy";
  expenseBreakdown: CalculatedExpense[];
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const formatCompactCurrency = (amount: number) => {
    const sign = amount < 0 ? "-" : "";
    const absoluteAmount = Math.abs(amount);
    const formattedAmount =
      absoluteAmount >= 1000
        ? `${new Intl.NumberFormat("en", {
            maximumFractionDigits: 1,
          }).format(absoluteAmount / 1000)}k`
        : new Intl.NumberFormat("en", {
            maximumFractionDigits: currency === "NGN" ? 0 : 2,
          }).format(absoluteAmount);

    return `${sign}${getCurrencySymbol(currency)}${formattedAmount}`;
  };

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
              <p className="flex items-center gap-1 whitespace-nowrap text-[11px] font-black tracking-wide text-[#397b65]">
                BUDGETALL -
                <span className="inline-flex shrink-0 rounded-full bg-[#e4f0eb] px-2 py-1 text-[9px] font-bold tracking-wide text-[#24634f]">
                  
                </span>
              </p>
              <h2
                id="mobile-wizard-title"
                className="mt-1 text-sm font-bold text-[#173c31]"
              >
                Know where money goes.
              </h2>
            </div>
            <CurrencySelector
              id="mobile-budget-currency"
              currency={currency}
              onChange={onCurrencyChange}
              disabled={currencyDisabled}
              isLoading={isLoadingRates}
              error={rateError}
              onRetry={onRetryRates}
            />
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
          <div className="mt-3">
            <p className="text-xs font-semibold text-gray-500">
              Step {step} of 5
            </p>
            <dl className="mt-2 grid grid-cols-4 gap-2">
              {[
                { label: "MI", value: monthlyIncome },
                { label: "TE", value: totalExpenses },
                { label: "SG", value: savings },
                { label: "ML", value: remaining },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="min-w-0 rounded-lg bg-[#f6f8f5] px-2 py-1.5"
                >
                  <dt className="text-[10px] font-bold text-gray-500">
                    {label}
                  </dt>
                  <dd
                    className={`truncate text-xs font-bold ${
                      label === "ML" && budgetIsOver
                        ? "text-red-600"
                        : "text-[#173c31]"
                    }`}
                    title={formatCurrency(value, currency)}
                  >
                    {formatCompactCurrency(value)}
                  </dd>
                </div>
              ))}
            </dl>
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

              <div className="mt-4 space-y-5 rounded-2xl border border-[#dfe5df] bg-white p-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">Expense ratio</span>
                    <span className="text-sm font-bold text-[#397b65]">
                      {Math.round(expenseRate)}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#397b65]"
                      style={{ width: `${Math.min(expenseRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">Savings rate</span>
                    <span className="text-sm font-bold text-[#397b65]">
                      {Math.round(savingsRate)}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#9db9aa]"
                      style={{ width: `${Math.min(savingsRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`mt-4 rounded-2xl p-4 ${
                  budgetIsOver ? "bg-red-50" : "bg-[#f1f6f3]"
                }`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wide ${
                    budgetIsOver ? "text-red-600" : "text-[#397b65]"
                  }`}
                >
                  Budget insight
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {!hasBudget
                    ? "Enter your monthly income to see your budget insight."
                    : budgetIsOver
                      ? `Your plan is ${formatCurrency(
                          Math.abs(remaining),
                          currency
                        )} over your income. Consider reducing some expenses or adjusting your savings goal.`
                      : savingsRate >= 20
                        ? "Your savings target is at least 20% of your income. You're giving yourself room to build a financial cushion."
                        : savingsRate > 0
                          ? "You have a savings target in place. Consider gradually increasing it as your income allows."
                          : "You haven't set a savings target yet. Try starting with an amount you can comfortably maintain each month."}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-[#dfe5df] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Largest expense
                </p>
                {largestExpense.value > 0 ? (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#173c31]">
                        {largestExpense.label}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {Math.round(
                          (largestExpense.value / (totalExpenses || 1)) * 100
                        )}
                        % of your expenses
                      </p>
                    </div>
                    <p className="shrink-0 font-bold text-[#173c31]">
                      {formatCurrency(largestExpense.value, currency)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">
                    Add expenses to see your largest expense.
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-[#dfe5df] bg-white p-4">
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
                          : budgetStatus === "healthy"
                            ? "Budget is healthy"
                            : "Not enough information"}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-gray-500">
                      {budgetStatus === "over"
                        ? "Your planned expenses and savings exceed your income."
                        : budgetStatus === "tight"
                          ? "Only a small portion of your income remains uncommitted."
                          : budgetStatus === "healthy"
                            ? "Your planned spending leaves room after expenses and savings."
                            : "Enter your monthly income to see your budget health."}
                    </p>
                  </div>
                </div>
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
