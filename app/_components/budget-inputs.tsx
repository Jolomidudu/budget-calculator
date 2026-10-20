"use client";

import { expenseFields, type CurrencyCode, type Expenses } from "../_lib/budget-model";
import { CurrencyInput } from "./budget-ui";

export function BudgetInputs({
  income,
  onIncomeChange,
  expenses,
  updateExpense,
  savingsGoal,
  onSavingsGoalChange,
  currency,
}: {
  income: string;
  onIncomeChange: (value: string) => void;
  expenses: Expenses;
  updateExpense: (key: keyof Expenses, value: string) => void;
  savingsGoal: string;
  onSavingsGoalChange: (value: string) => void;
  currency: CurrencyCode;
}) {
  return (
    <div className="space-y-6">
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
          onChange={onIncomeChange}
          placeholder="500,000"
          currency={currency}
          formatWithCommas
        />
      </section>

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
                value={expenses[field.key] ? String(expenses[field.key]) : ""}
                onChange={(value) => updateExpense(field.key, value)}
                placeholder="0"
                small
                currency={currency}
                formatWithCommas
              />
            </div>
          ))}
        </div>
      </section>

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
          onChange={onSavingsGoalChange}
          placeholder="100,000"
          currency={currency}
          formatWithCommas
        />
      </section>
    </div>
  );
}

