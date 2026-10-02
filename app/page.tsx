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
  }).format(Math.max(0, value));
}

function getPercentage(value: number, total: number) {
  if (!total || total <= 0) return 0;

  return (value / total) * 100;
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

  function resetBudget() {
    setIncome("");
    setSavingsGoal("");
    setExpenses(initialExpenses);
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
      {/* Header */}
      <nav className="border-b border-[#dfe5df] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
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

          <button
            type="button"
            onClick={resetBudget}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Reset
          </button>
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
            value={formatCurrency(monthlyIncome)}
            icon="↓"
          />

          <SummaryCard
            label="Total expenses"
            value={formatCurrency(totalExpenses)}
            icon="−"
          />

          <SummaryCard
            label="Savings goal"
            value={formatCurrency(savings)}
            icon="↗"
          />

          <SummaryCard
            label="Money remaining"
            value={
              budgetIsOver
                ? `-${formatCurrency(Math.abs(remaining))}`
                : formatCurrency(remaining)
            }
            icon="="
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
                        {field.icon}
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
                    ? `-${formatCurrency(Math.abs(remaining))}`
                    : formatCurrency(remaining)}
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
                  value={formatCurrency(monthlyIncome)}
                />

                <ResultRow
                  label="Expenses"
                  value={formatCurrency(totalExpenses)}
                />

                <ResultRow
                  label="Savings"
                  value={formatCurrency(savings)}
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
                            Math.abs(remaining)
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
                        {formatCurrency(largestExpense.value)}
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
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          budgetStatus === "over"
                            ? "bg-red-100 text-red-600"
                            : budgetStatus === "tight"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-[#dcece4] text-[#397b65]"
                        }`}
                      >
                        {budgetStatus === "over"
                          ? "!"
                          : budgetStatus === "tight"
                            ? "!"
                            : "✓"}
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
              <div className="text-3xl">📊</div>

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
                        {item.icon}
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
                      {formatCurrency(item.value)}
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
  icon,
  danger = false,
}: {
  label: string;
  value: string;
  icon: string;
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
          {icon}
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

function CurrencyInput({
  value,
  onChange,
  placeholder,
  small = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  small?: boolean;
}) {
  return (
    <div className="relative">
      <span
        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-400 ${
          small ? "text-sm" : "text-lg"
        }`}
      >
        ₦
      </span>

      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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