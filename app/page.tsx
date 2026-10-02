"use client";

import { useMemo, useState } from "react";

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
  icon: string;
}[] = [
  {
    key: "housing",
    label: "Housing",
    description: "Rent, mortgage or accommodation",
    icon: "🏠",
  },
  {
    key: "food",
    label: "Food",
    description: "Groceries, meals and dining",
    icon: "🍽️",
  },
  {
    key: "transportation",
    label: "Transportation",
    description: "Fuel, transport and commuting",
    icon: "🚗",
  },
  {
    key: "utilities",
    label: "Utilities",
    description: "Electricity, water and bills",
    icon: "💡",
  },
  {
    key: "phone",
    label: "Phone & Internet",
    description: "Mobile data, calls and internet",
    icon: "📱",
  },
  {
    key: "debt",
    label: "Debt Payments",
    description: "Loans, credit and repayments",
    icon: "💳",
  },
  {
    key: "entertainment",
    label: "Entertainment",
    description: "Movies, outings and subscriptions",
    icon: "🎬",
  },
  {
    key: "other",
    label: "Other",
    description: "Everything else",
    icon: "🛍️",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState<Expenses>(initialExpenses);
  const [savingsGoal, setSavingsGoal] = useState("");

  const calculations = useMemo(() => {
    const monthlyIncome = Number(income) || 0;
    const totalExpenses = Object.values(expenses).reduce(
      (total, value) => total + (Number(value) || 0),
      0
    );

    const savings = Number(savingsGoal) || 0;
    const remaining = monthlyIncome - totalExpenses - savings;

    const savingsRate =
      monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

    const expenseRate =
      monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0;

    return {
      monthlyIncome,
      totalExpenses,
      savings,
      remaining,
      savingsRate,
      expenseRate,
    };
  }, [income, expenses, savingsGoal]);

  function updateExpense(key: keyof Expenses, value: string) {
    setExpenses((current) => ({
      ...current,
      [key]: Number(value) || 0,
    }));
  }

  function resetBudget() {
    setIncome("");
    setSavingsGoal("");
    setExpenses(initialExpenses);
  }

  const {
    monthlyIncome,
    totalExpenses,
    savings,
    remaining,
    savingsRate,
    expenseRate,
  } = calculations;

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#17251f]">
      <nav className="border-b border-[#dfe5df] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#173c31]">
              Budgetly
            </h1>
            <p className="text-xs text-gray-500">
              Simple budgeting for everyday life
            </p>
          </div>

          <button
            onClick={resetBudget}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="mb-4 inline-flex rounded-full bg-[#e4f0eb] px-3 py-1 text-xs font-semibold text-[#24634f]">
            PERSONAL BUDGET CALCULATOR
          </span>

          <h2 className="text-4xl font-bold tracking-tight text-[#173c31] sm:text-5xl">
            Know where your money goes.
          </h2>

          <p className="mt-4 max-w-xl text-base leading-7 text-gray-600">
            Enter your monthly income and expenses. Budgetly instantly shows
            what you spend, what you save and what you have left.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-[#dfe5df] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <p className="text-sm font-semibold text-[#24634f]">
                  STEP 1
                </p>
                <h3 className="mt-1 text-xl font-bold">Your monthly income</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your total take-home income.
                </p>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-500">
                  ₦
                </span>

                <input
                  type="number"
                  min="0"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="500,000"
                  className="w-full rounded-2xl border border-gray-200 bg-[#fafbfa] py-4 pl-10 pr-4 text-xl font-semibold outline-none transition focus:border-[#397b65] focus:ring-4 focus:ring-[#397b65]/10"
                />
              </div>
            </section>

            <section className="rounded-3xl border border-[#dfe5df] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <p className="text-sm font-semibold text-[#24634f]">
                  STEP 2
                </p>
                <h3 className="mt-1 text-xl font-bold">Monthly expenses</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add the amount you normally spend each month.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {expenseFields.map((field) => (
                  <div
                    key={field.key}
                    className="rounded-2xl border border-gray-100 bg-[#fafbfa] p-4"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <span className="text-xl">{field.icon}</span>

                      <div className="min-w-0">
                        <p className="font-semibold">{field.label}</p>
                        <p className="text-xs leading-5 text-gray-500">
                          {field.description}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                        ₦
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={expenses[field.key] || ""}
                        onChange={(e) =>
                          updateExpense(field.key, e.target.value)
                        }
                        placeholder="0"
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-8 pr-3 text-sm font-medium outline-none transition focus:border-[#397b65] focus:ring-4 focus:ring-[#397b65]/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-[#dfe5df] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <p className="text-sm font-semibold text-[#24634f]">
                  STEP 3
                </p>
                <h3 className="mt-1 text-xl font-bold">Savings goal</h3>
                <p className="mt-1 text-sm text-gray-500">
                  How much would you like to save every month?
                </p>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-500">
                  ₦
                </span>

                <input
                  type="number"
                  min="0"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  placeholder="100,000"
                  className="w-full rounded-2xl border border-gray-200 bg-[#fafbfa] py-4 pl-10 pr-4 text-lg font-semibold outline-none transition focus:border-[#397b65] focus:ring-4 focus:ring-[#397b65]/10"
                />
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-3xl bg-[#173c31] text-white shadow-lg">
              <div className="p-6 sm:p-7">
                <p className="text-sm font-medium text-[#b9d8cb]">
                  YOUR MONTHLY BUDGET
                </p>

                <div className="mt-4">
                  <p className="text-sm text-[#b9d8cb]">Money left after</p>
                  <p className="mt-1 text-4xl font-bold tracking-tight">
                    {formatCurrency(Math.max(remaining, 0))}
                  </p>
                </div>

                {remaining < 0 && (
                  <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-[#f5d5d5]">
                    Your planned expenses and savings are higher than your
                    income by{" "}
                    <strong>{formatCurrency(Math.abs(remaining))}</strong>.
                  </div>
                )}
              </div>

              <div className="space-y-5 bg-white p-6 text-[#17251f] sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Income</span>
                  <span className="font-bold">
                    {formatCurrency(monthlyIncome)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Expenses</span>
                  <span className="font-bold">
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Savings goal</span>
                  <span className="font-bold">{formatCurrency(savings)}</span>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">Expenses used</span>
                    <span>{Math.round(expenseRate)}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#397b65] transition-all"
                      style={{
                        width: `${Math.min(expenseRate, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">Savings rate</span>
                    <span>{Math.round(savingsRate)}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#b9cdbf] transition-all"
                      style={{
                        width: `${Math.min(savingsRate, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f2f6f3] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#397b65]">
                    Budget insight
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {monthlyIncome === 0
                      ? "Enter your income to start building your budget."
                      : remaining < 0
                        ? "Your current plan is above your income. Consider reducing some expenses or your savings target."
                        : savingsRate >= 20
                          ? "You're setting aside at least 20% of your income. Keep building that financial cushion."
                          : savingsRate > 0
                            ? "You have started saving. Consider gradually increasing your savings target."
                            : "You haven't set a savings goal yet. Even a small monthly amount can help you build a cushion."}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-gray-400">
              Budgetly is a simple planning tool and does not provide financial
              advice.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}