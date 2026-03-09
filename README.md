# nbp-api-client

This library provides a simple way to retrieve data from the open, public API of the National Bank of Poland (NBP).

It is built using modern modular JavaScript and includes full type definitions along with a contemporary approach to JavaScript library development.

## Installation

npm install nbp-api-client

## Getting currencies ratios

```ts

import { NBPApiClient } from "nbp-api-client";

const client = new NBPApiClient();

// To get ratios for specified currency to PLN
const rates = await client.getRates();
// ...

```

## Getting Gold Details

```ts

import { NBPApiClient } from "nbp-api-client";

const client = new NBPApiClient();

// To get current gold price 
await client.getGoldPrice();
// ...

// To get current gold price 
await client.getGoldPrice({ mode: `current` });
// ...

// To get current gold price 
await client.getGoldPrice({ mode: `today` });
// ...

// To get gold prices from between two specified dates.
await client.getGoldPrice({ mode: 'between-dates', startDate, endDate });
// ...

// To get gold prices from the specified date
await client.getGoldPrice({ mode: `from-date`, date: endDate });
// ...

// To get gold prices relative to specified date
await client.getGoldPrice({ mode: `days-before`, days: 2, date: endDate });
// ...

// To get gold prices relative to specified date
await client.getGoldPrice({ mode: `days-after`, days: 5, date: startDate });
// ...

```

All information about API you can find under link below:

```http

GET https://api.nbp.pl/

```
