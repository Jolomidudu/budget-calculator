# Budgetly

Budgetly is a simple personal budget calculator built with Next.js. It helps users estimate monthly income, track common spending categories, set a savings goal, and instantly see how much money remains after expenses.

## Overview

This app is designed for everyday budgeting and quick financial planning. Users can:

- enter their monthly income
- log expenses across key categories such as housing, food, transportation, utilities, debt, and entertainment
- set a monthly savings target
- view total spending, savings rate, expense rate, and remaining balance
- reset the budget and start a new planning session

## Features

- Clean, responsive budgeting dashboard
- Nigerian Naira currency formatting
- Real-time calculations as values change
- Simple category-based expense tracking
- Savings and remaining balance summaries
- Modern UI built with Next.js and Tailwind CSS

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
npm install
```

### Run the app locally

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Project Structure

```bash
.
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── README.md
```

## Usage

1. Enter your monthly income.
2. Add your expected spending in each category.
3. Set a savings goal if you want to plan ahead.
4. Review the summary to see:
   - total expenses
   - total savings
   - remaining balance
   - spending and savings percentages

## License

This project is for personal and educational use.

## Notes

This app is intentionally simple and focused on core budgeting workflow rather than advanced financial analytics. It is ideal as a starting point for a personal finance tool or as a frontend prototype for a larger budgeting product.
