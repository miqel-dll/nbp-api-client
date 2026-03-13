# nbp-api-client

A modern TypeScript/JavaScript library for retrieving data from the public API of the National Bank of Poland (NBP). It provides a simple-to-use interface for managing currency exchange rates, historical data, and gold prices.

The library is fully typed, written in modern JavaScript (ES Modules), and production-ready with complete tree-shaking support.

## 📦 Installation

```bash
npm install nbp-api-client
```

```bash
yarn add nbp-api-client
```

```bash
pnpm add nbp-api-client
```

## 🚀 Quick Start

```typescript
import { NBPApiClient } from "nbp-api-client";

const client = new NBPApiClient();

// Get current exchange rates
const currentRates = await client.getRates({ mode: 'current' });

// Get current gold price
const goldPrice = await client.getGoldPrice();

// Get exchange rate tables
const tables = await client.getTables({ table: 'A', mode: 'current' });
```

### 🛠️ Development

To run the full quality suite locally:

```bash
npm install
npm run build       # compile TypeScript to dist/
npm run lint        # static analysis
npm run test        # run unit tests
npm run coverage    # generate coverage report
```

The package also includes a `prepare` script so that if you install directly
directly from the Git repository (e.g. `npm install username/nbp-api-client`),
it will compile automatically.

### 🤝 Contributing

Please open issues for bugs or feature requests and send pull requests with
clear descriptions. The library follows semantic versioning; bump the
version in `package.json` and update the changelog when adding features or
fixes.

## ⚙️ Configuration

```typescript
import { 
  NBPApiClient, 
  OutputFormatEnum, 
  GoldMeasureUnitEnum,
  Iso4217CurrencyCodeEnum 
} from "nbp-api-client";

const client = new NBPApiClient({
  // Response format: 'json' or 'xml'
  outputFormat: OutputFormatEnum.JSON,
  
  // Enable debug logging to console
  debug: true,
  
  // Reference currency (default: USD)
  currency: Iso4217CurrencyCodeEnum.USD,
  
  // Unit of measure for gold prices: 'ounces' or 'grams'
  unit: GoldMeasureUnitEnum.OUNCES,
});
```

## 📊 Getting Exchange Rates (getRates)

The `getRates()` method allows you to retrieve currency exchange rates from NBP in various time-based variants. You need to specify the table (`A`, `B` or `C`) and currency code.

### Current rates

```typescript
// Get current exchange rate for USD from table A
const rates = await client.getRates({ 
  table: 'A',
  code: 'USD',
  mode: 'current' 
});
```

### Top N rates

```typescript
// Get the last 10 rate quotes for USD from table A
const topRates = await client.getRates({ 
  table: 'A',
  code: 'USD',
  mode: 'top-count',
  maxCount: 10 
});
```

### Today's rates

```typescript
// Get rates for today
const todayRates = await client.getRates({ 
  table: 'A',
  code: 'USD',
  mode: 'today' 
});
```

### Rates for a specific date

```typescript
// Get rates for a specific day
const dateRates = await client.getRates({ 
  table: 'A',
  code: 'USD',
  table: 'A',
  code: 'USD',
  mode: 'date',
  date: '2024-01-15'
  // or
  date: new Date('2024-01-15')
});
```

### Rates for a date range

```typescript
// Get rates for a time period
const rangeRates = await client.getRates({ 
  table: 'A',
  code: 'USD',
  mode: 'date-range',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### Rates from N days ago

```typescript
// Get rates from the last 7 days before a date
const pastRates = await client.getRates({ 
  table: 'A',
  code: 'USD',
  mode: 'days-before',
  days: 7,
  date: '2024-01-15'
});
```

### Rates for the next N days

```typescript
// Get rates for the next 5 days from a date
const futureRates = await client.getRates({ 
  table: 'A',
  code: 'USD',
  mode: 'days-after',
  days: 5,
  date: '2024-01-15'
});
```

## 💰 Getting Gold Price Data (getGoldPrice)

The `getGoldPrice()` method provides access to current and historical gold prices in various currencies and units of measure.

### Current gold price

```typescript
// Get the current gold price
const currentGold = await client.getGoldPrice();

// Equivalent to:
const currentGold = await client.getGoldPrice({ 
  mode: 'current' 
});

const todayGold = await client.getGoldPrice({ 
  mode: 'today' 
});
```

### Gold price from a specific date

```typescript
// Get the gold price from a specific day onwards
const fromDateGold = await client.getGoldPrice({ 
  mode: 'from-date',
  date: '2024-01-01'
});
```

### Gold price for a time range

```typescript
// Get gold prices for a time period
const rangeGold = await client.getGoldPrice({ 
  mode: 'between-dates',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### Gold price from N days ago

```typescript
// Get gold prices from the last 30 days
const pastGold = await client.getGoldPrice({ 
  mode: 'days-before',
  days: 30,
  date: '2024-01-31'
});
```

### Gold price for the next N days

```typescript
// Get gold prices for the next 10 days
const futureGold = await client.getGoldPrice({ 
  mode: 'days-after',
  days: 10,
  date: '2024-01-01'
});
```

### Changing currency and unit of measure

```typescript
const goldPrice = await client.getGoldPrice({
  mode: 'current',
  // Get in EUR instead of USD
  currency: Iso4217CurrencyCodeEnum.EUR,
});

// Change unit to grams
const goldInGrams = await client.getGoldPrice({
  mode: 'current',
  // The global configuration won't change
  // Set the unit in the constructor
});
```

## 📈 Getting Exchange Rate Tables (getTables)

The `getTables()` method allows you to retrieve complete exchange rate tables published by NBP.

NBP publishes three main tables: **A**, **B**, and **C**, containing rates for various currencies.

### Current table

```typescript
// Get current Table A
const tableA = await client.getTables({ 
  table: 'A',
  mode: 'current' 
});

// Available tables: 'A', 'B', 'C'
const tableB = await client.getTables({ table: 'B', mode: 'current' });
const tableC = await client.getTables({ table: 'C', mode: 'current' });
```

### Last N tables

```typescript
// Get the last 5 Table A publications
const lastTables = await client.getTables({ 
  table: 'A',
  mode: 'top-count',
  maxCount: 5 
});
```

### Table from today

```typescript
const todayTable = await client.getTables({ 
  table: 'A',
  mode: 'today' 
});
```

### Table for a specific date

```typescript
const specificTable = await client.getTables({ 
  table: 'A',
  mode: 'specified-date',
  date: '2024-01-15' 
});
```

### Tables for a date range

```typescript
const rangeTable = await client.getTables({ 
  table: 'A',
  mode: 'between-dates',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### Tables from the last N days

```typescript
// Get tables from the last 7 days
const pastTables = await client.getTables({ 
  table: 'A',
  mode: 'days-before',
  days: 7,
  date: '2024-01-31'
});
```

### Tables for the next N days

```typescript
// Get tables for the next 5 days
const futureTables = await client.getTables({ 
  table: 'A',
  mode: 'days-after',
  days: 5,
  date: '2024-01-01'
});
```

## 🔧 Advanced Configuration

### Debugging

```typescript
const client = new NBPApiClient({
  debug: true
});

// Logs with sent requests will appear in the console
// 2024-03-12 14:30:45 | NBPApiClient | Sending request to url: ...
```

### Output Format

The library supports both JSON (default) and XML:

```typescript
import { OutputFormatEnum } from "nbp-api-client";

// JSON (default)
const jsonClient = new NBPApiClient({
  outputFormat: OutputFormatEnum.JSON
});

// XML
const xmlClient = new NBPApiClient({
  outputFormat: OutputFormatEnum.XML
});
```

## 📋 Supported Currencies

The library supports all currencies according to the ISO 4217 standard, including:

- USD - US Dollar
- EUR - Euro
- GBP - British Pound
- JPY - Japanese Yen
- CHF - Swiss Franc
- CAD - Canadian Dollar
- AUD - Australian Dollar
- CNY - Chinese Yuan
- INR - Indian Rupee
- And many more...

```typescript
import { Iso4217CurrencyCodeEnum } from "nbp-api-client";

const client = new NBPApiClient({
  currency: Iso4217CurrencyCodeEnum.EUR
});
```

## 📝 Types and Enums

### Enums

```typescript
import {
  OutputFormatEnum,
  GoldMeasureUnitEnum,
  TableCodeEnum,
  GetGoldPriceEnum,
  GetTableDataEnum,
  Iso4217CurrencyCodeEnum
} from "nbp-api-client";

// Output format
OutputFormatEnum.JSON | OutputFormatEnum.XML

// Unit of measure for gold
GoldMeasureUnitEnum.OUNCES | GoldMeasureUnitEnum.GRAMS

// Table codes
TableCodeEnum.A | TableCodeEnum.B | TableCodeEnum.C

// Modes for retrieving gold data
GetGoldPriceEnum.CURRENT | GetGoldPriceEnum.TODAY | GetGoldPriceEnum.FROM_DATE | GetGoldPriceEnum.BETWEEN_DATES | GetGoldPriceEnum.DAYS_BEFORE | GetGoldPriceEnum.DAYS_AFTER

// Modes for retrieving table data
GetTableDataEnum.CURRENT | GetTableDataEnum.TOP_COUNT | GetTableDataEnum.TODAY | GetTableDataEnum.SPECIFIED_DATE | GetTableDataEnum.BETWEEN_DATES | GetTableDataEnum.DAYS_BEFORE | GetTableDataEnum.DAYS_AFTER
```

### Types

```typescript
import type {
  GetRatesParams,
  GetGoldPriceParams,
  GetTablesParams,
  GetRatesResponse,
  GetGoldPriceResponse,
  GetTableResponse
} from "nbp-api-client";
```

## 🧪 Testing

```bash
npm run test
```

## 🔍 Linting

```bash
npm run lint
```

## 🏗️ Building

```bash
npm run build
```

The compiled code is located in the `dist/` directory.

## 📚 Resources

- [Official NBP API](https://api.nbp.pl/)
- [NBP API Documentation](https://api.nbp.pl/) - Details about endpoints, formats, and limitations
- [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) - Currency codes standard

## 📄 License

MIT © 2026 [miqel-dll](https://github.com/miqel-dll)

## 🤝 Support

If you encounter a problem or have a suggestion, please open an issue on [GitHub](https://github.com/miqel-dll/nbp-api-client/issues).

---

**Author:** [miqel-dll](https://github.com/miqel-dll)  
**Version:** 1.1.1
