"use client";

import { BarChart3, type LucideIcon } from "lucide-react";
import {
  formatCurrency,
  formatNumberInput,
  getCurrencySymbol,
  type CurrencyCode,
  type Expenses,
  currencies,
} from "../_lib/budget-model";

export function SummaryCard({
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

export function ResultRow({
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

export function CurrencySelector({
  id = "budget-currency",
  currency,
  onChange,
  disabled,
  isLoading,
  error,
  onRetry,
}: {
  id?: string;
  currency: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  disabled: boolean;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label
        htmlFor={id}
        className="text-xs font-semibold text-gray-500"
      >
        Currency
      </label>
      <select
        id={id}
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

export function CurrencyInput({
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
        onChange={(event) => {
          if (!formatWithCommas) {
            onChange(event.currentTarget.value);
            return;
          }

          const input = event.currentTarget;
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

export function ExpenseBreakdown({
  items,
  currency,
}: {
  items: {
    key: keyof Expenses;
    label: string;
    icon: LucideIcon;
    value: number;
    percentage: number;
  }[];
  currency: CurrencyCode;
}) {
  return (
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

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cfdad4] bg-[#f7faf8] px-6 py-10 text-center">
            <div className="flex justify-center">
              <BarChart3 className="h-10 w-10 text-[#397b65]" />
            </div>
            <h3 className="font-semibold text-[#173c31]">
              Your breakdown will appear here
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Enter your expenses above and Budgetall will show you exactly
              where your money is going.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item) => (
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
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
