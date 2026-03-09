# nbp-api-client

This library provides a simple way to retrieve data from the open, public API of the National Bank of Poland (NBP).

It is built using modern modular JavaScript and includes full type definitions along with a contemporary approach to JavaScript library development.

## Installation

npm install nbp-api-client

## Usage

```typescript

import { NBPApiClient } from "nbp-api-client";

const client = new NBPApiClient();

// To get ratios for specified currency to PLN
const rates = await client.getRates();
// ...

// To get ratios for specified currency to Gold
const goldRates = await client.getGoldPrice();
// ...

```

```http

GET https://api.nbp.pl/

```
