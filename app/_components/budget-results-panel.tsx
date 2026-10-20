"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Share2,
} from "lucide-react";
import {
  formatCurrency,
  getPercentage,
  type CurrencyCode,
} from "../_lib/budget-model";
import { ResultRow } from "./budget-ui";

export function BudgetResultsPanel({
  currency,
  monthlyIncome,
  totalExpenses,
  savings,
  remaining,
  budgetIsOver,
  budgetStatus,
  committedRate,
  expenseRate,
  savingsRate,
  largestExpense,
  hasBudget,
  shareStatus,
  summaryCopied,
  onShare,
  onCopySummary,
}: {
  currency: CurrencyCode;
  monthlyIncome: number;
  totalExpenses: number;
  savings: number;
  remaining: number;
  budgetIsOver: boolean;
  budgetStatus: "empty" | "over" | "tight" | "healthy";
  committedRate: number;
  expenseRate: number;
  savingsRate: number;
  largestExpense: { label: string; value: number };
  hasBudget: boolean;
  shareStatus: "idle" | "copied" | "shared";
  summaryCopied: boolean;
  onShare: () => void;
  onCopySummary: () => void;
}) {
  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="overflow-hidden rounded-3xl border border-[#dfe5df] bg-white shadow-sm">
        <div className="bg-[#173c31] p-6 text-white sm:p-7">
          <p className="text-xs font-bold tracking-wide text-[#b9d8cb]">
            YOUR BUDGET
          </p>

          <p className="mt-5 text-sm text-[#b9d8cb]">Money remaining</p>

          <p className="mt-1 break-words text-4xl font-black tracking-tight">
            {budgetIsOver
              ? `-${formatCurrency(Math.abs(remaining), currency)}`
              : formatCurrency(remaining, currency)}
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[#b9d8cb] transition-all duration-500"
              style={{ width: `${Math.min(committedRate, 100)}%` }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-[#b9d8cb]">
            <span>Committed</span>
            <span>{Math.round(committedRate)}%</span>
          </div>
        </div>

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

          <div className="border-t border-gray-100 pt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Expense ratio</span>
              <span className="text-sm font-bold text-[#397b65]">
                {Math.round(expenseRate)}%
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#397b65] transition-all duration-500"
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
                className="h-full rounded-full bg-[#9db9aa] transition-all duration-500"
                style={{ width: `${Math.min(savingsRate, 100)}%` }}
              />
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 ${
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

          {hasBudget && largestExpense.value > 0 && (
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Largest expense
              </p>

              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <p className="font-bold">{largestExpense.label}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {Math.round(
                      getPercentage(largestExpense.value, totalExpenses)
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
                onClick={onShare}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#173c31] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#245345]"
              >
                {shareStatus !== "idle" ? (
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
                onClick={onCopySummary}
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
        Budgetall is a simple budgeting tool and does not provide financial
        advice.
      </p>
    </aside>
  );
}

