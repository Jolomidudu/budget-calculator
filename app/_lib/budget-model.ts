import {
  CarFront,
  CreditCard,
  Film,
  House,
  Lightbulb,
  ShoppingBag,
  Smartphone,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type Expenses = {
  housing: number;
  food: number;
  transportation: number;
  utilities: number;
  phone: number;
  debt: number;
  entertainment: number;
  other: number;
};

export type CurrencyCode = "NGN" | "GBP" | "USD" | "CNY" | "ZAR" | "AED";

export type ExchangeRatesResponse = {
  result: string;
  base_code: string;
  time_last_update_utc: string;
  rates: Record<CurrencyCode, number>;
};

export type ExpenseField = {
  key: keyof Expenses;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type CalculatedExpense = ExpenseField & {
  value: number;
  percentage: number;
};

export const currencies: { code: CurrencyCode; label: string }[] = [
  { code: "NGN", label: "Nigerian naira" },
  { code: "GBP", label: "British pounds" },
  { code: "USD", label: "US dollars" },
  { code: "CNY", label: "Chinese yuan" },
  { code: "ZAR", label: "South African rand" },
  { code: "AED", label: "UAE dirhams" },
];

export const initialExpenses: Expenses = {
  housing: 0,
  food: 0,
  transportation: 0,
  utilities: 0,
  phone: 0,
  debt: 0,
  entertainment: 0,
  other: 0,
};

export const expenseFields: ExpenseField[] = [
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

export function formatCurrency(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(Math.max(0, value));
}

export function isExchangeRatesResponse(
  value: unknown
): value is ExchangeRatesResponse {
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

export function getCurrencySymbol(currency: CurrencyCode) {
  return (
    new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency
  );
}

export function formatNumberInput(value: string) {
  const [integerPart, ...decimalParts] = value.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimalParts.length
    ? `${formattedInteger}.${decimalParts.join("")}`
    : formattedInteger;
}

export function getPercentage(value: number, total: number) {
  if (!total || total <= 0) return 0;

  return (value / total) * 100;
}
