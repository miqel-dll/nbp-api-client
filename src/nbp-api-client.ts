import {
    GetTableRow, GetTableRowRate, GetTablesParams, NBPApiClientConfiguration, TableCodes,
    GetGoldPriceParams, GetGoldPriceResponse, GetRatesParams, GetTableResponse, GetRatesResponse, RawRateRowRate, RawRateRow, RawGoldPriceRecord,
} from "./types.js";
import {
    GetGoldPriceEnum, GetTableDataEnum, GoldMeasureUnitEnum,
    Iso4217CurrencyCodeEnum, OutputFormatEnum, TableCodeEnum
} from "./enums.js";
import { Axios } from "axios";

export class NBPApiClient<O extends OutputFormatEnum | `xml` | `json`> {

    private config: NBPApiClientConfiguration<O> = {
        outputFormat: null,
        debug: false,
        currency: Iso4217CurrencyCodeEnum.USD,
        unit: GoldMeasureUnitEnum.OUNCES,
    };

    private maxDaysRange = 93;

    constructor(
        _config?: Partial<NBPApiClientConfiguration<O>>
    ) {
        this.config = { ...this.config, ..._config };
    };

    private goldOunceInGrams: number = 31.1034768;
    private get host(): string {
        return Buffer.from("aHR0cHM6Ly9hcGkubmJwLnBsL2FwaQ==", "base64").toString("utf-8");
    };

    private prepareUrlForRelativeDate(
        prefix: string, date: Date | string, days: number, mode: `days-after` | `days-before`
    ): string {

        const startDate = new Date(date);
        const endDate = new Date(date);

        if (mode === `days-after`) {
            endDate.setDate(endDate.getDate() + days);
        } else if (mode === `days-before`) {
            startDate.setDate(startDate.getDate() - days)
        };

        const ISO8601FormedStartDate = startDate.toISOString().split(`T`).shift();
        const ISO8601FormedEndDate = endDate.toISOString().split(`T`).shift();

        return `${prefix}/${ISO8601FormedStartDate}/${ISO8601FormedEndDate}`;
    };

    private prepareUrlForDateRange(
        prefix: string, startDate: Date | string, endDate: Date | string
    ): string {

        startDate = typeof startDate === `string` ? new Date(startDate) : startDate;
        endDate = typeof endDate === `string` ? new Date(endDate) : endDate;

        const ISO8601FormedStartDate = startDate.toISOString().split(`T`).shift();
        const ISO8601FormedEndDate = endDate.toISOString().split(`T`).shift();

        return `${prefix}/${ISO8601FormedStartDate}/${ISO8601FormedEndDate}`;
    };

    private prepareUrlForSpecifiedDate(
        prefix: string, date: Date | string,
    ): string {

        if (typeof date === `string`) {
            date = new Date(date);
        };

        const ISO8601FormedDate = date.toISOString().split(`T`).shift();
        return `${prefix}/${ISO8601FormedDate}`;
    };

    public async getTables<T extends TableCodes | TableCodeEnum>(
        params: GetTablesParams & { table: T }
    ): Promise<GetTableResponse<O, T>> {

        const client = new Axios();
        let url = `${this.host}/exchangerates/tables/${params.table}`;

        if (params.mode !== "current") {
            switch (params.mode) {
                case GetTableDataEnum.TOP_COUNT:
                case "top-count":

                    url += `/last/${params.maxCount}`;
                    break;

                case GetTableDataEnum.TODAY:
                case "today":

                    url += `/today`;
                    break;

                case GetTableDataEnum.SPECIFIED_DATE:
                case "specified-date":

                    url = this.prepareUrlForSpecifiedDate(url, params.date);
                    break;

                case GetTableDataEnum.BETWEEN_DATES:
                case "between-dates":

                    const { startDate, endDate } = params;
                    url = this.prepareUrlForDateRange(url, startDate, endDate);
                    break;

                case GetTableDataEnum.DAYS_BEFORE:
                case "days-before":
                case GetTableDataEnum.DAYS_AFTER:
                case "days-after":

                    const { date, days, mode } = params;
                    url = this.prepareUrlForRelativeDate(url, date, days, mode);
                    break;

                default:
                    throw new Error(`Unknown retrieving mode for tables data for table.`);
            };
        };

        const fomredDate = new Date().toISOString().replace("T", " ");
        if (this.config.debug === true) {
            console.log(`${fomredDate} | NBPApiClient | Sending request to url: ${url}`);
        };

        const currencyFactor: number = this.config.currency === Iso4217CurrencyCodeEnum.PLN ? 1 : 1;
        const response = await client.get<string>(url, { params: { format: this.config.outputFormat } });
        if (!response.data) {
            throw new Error(`Failed to receive rates tables.`);
        };

        if (response.status === 404) {
            throw new Error(`There are no data for ${params.mode}, status: 404.`);
        }

        if (this.config.outputFormat === `xml`) {

            const bidPattern = /<Bid>([\d.]+)<\/Bid>/g;
            const askPattern = /<Ask>([\d.]+)<\/Ask>/g;
            const midPattern = /<Mid>([\d.]+)<\/Mid>/g;

            response.data = response.data
                .replaceAll("Data", "Date")
                .replaceAll("Cena", "Price")
                .replace(bidPattern, (_, value) => (
                    `<Bid>${Number((Number(value) / currencyFactor).toFixed(3))}</Bid>`
                ))
                .replace(askPattern, (_, value) => (
                    `<Ask>${Number((Number(value) / currencyFactor).toFixed(3))}</Ask>`
                ))
                .replace(midPattern, (_, value) => (
                    `<Mid>${Number((Number(value) / currencyFactor).toFixed(3))}</Mid>`
                ));

            return response.data as GetTableResponse<O, T>;
        };

        const rawData: GetTableResponse<O, T, `raw`> = JSON.parse(response.data);
        if (!Array.isArray(rawData) || rawData.length === 0) {
            throw new Error(`Received unknown response format.`);
        };

        if (this.config.debug === true) {
            console.debug(`${fomredDate} | NBPApiClient | Successfully found ${rawData.length} records`);
            console.debug(`${fomredDate} | NBPApiClient | RAW Response:`);
            console.debug(rawData);
        };

        const data = rawData.map(({ rates, effectiveDate, ...row }: GetTableRow<T>) => ({
            ...row,
            effectiveDate,
            rates: rates.map((rate: GetTableRowRate<T>) => (
                `mid` in rate
                    ? ({
                        ...rate,
                        mid: Number(Number(rate.mid / currencyFactor).toFixed(3))
                    })
                    : ({
                        ...rate,
                        bid: Number(Number(rate.bid / currencyFactor).toFixed(3)),
                        ask: Number(Number(rate.ask / currencyFactor).toFixed(3)),
                    })))
        }));

        return data as GetTableResponse<O, T>;
    };

    public async getRates<T extends TableCodes | TableCodeEnum>(
        params: GetRatesParams & { table: T }
    ): Promise<GetRatesResponse<O, T>> {

        const client = new Axios();
        let url = `${this.host}/exchangerates/rates/${params.table}/${params.code}`;

        if (params.mode !== "current") {
            switch (params.mode) {
                case GetTableDataEnum.TOP_COUNT:
                case "top-count":

                    url += `/last/${params.maxCount}`;
                    break;

                case GetTableDataEnum.TODAY:
                case "today":

                    url += `/today`;
                    break;

                case GetTableDataEnum.SPECIFIED_DATE:
                case "date":

                    url = this.prepareUrlForSpecifiedDate(url, params.date);
                    break;

                case GetTableDataEnum.BETWEEN_DATES:
                case "date-range":

                    const { startDate, endDate } = params;
                    url = this.prepareUrlForDateRange(url, startDate, endDate);
                    break;

                case GetTableDataEnum.DAYS_BEFORE:
                case "days-before":
                case GetTableDataEnum.DAYS_AFTER:
                case "days-after":

                    const { date, days, mode } = params;
                    url = this.prepareUrlForRelativeDate(url, date, days, mode);
                    break;

                default:
                    throw new Error(`Unknown retrieving mode for exchange rates.`);
            };
        };

        const fomredDate = new Date().toISOString().replace("T", " ");
        if (this.config.debug === true) {
            console.log(`${fomredDate} | NBPApiClient | Sending request to url: ${url}`);
        };

        const currencyFactor: number = this.config.currency === Iso4217CurrencyCodeEnum.PLN ? 1 : 1;
        const response = await client.get<string>(url, { params: { format: this.config.outputFormat } });
        if (!response.data) {
            throw new Error(`Failed to receive exchange rates.`);
        };

        if (response.status === 404) {
            throw new Error(`There are no data for ${params.mode}, status: 404.`);
        }

        if (this.config.outputFormat === `xml`) {

            const bidPattern = /<Bid>([\d.]+)<\/Bid>/g;
            const askPattern = /<Ask>([\d.]+)<\/Ask>/g;
            const midPattern = /<Mid>([\d.]+)<\/Mid>/g;

            response.data = response.data
                .replaceAll("EffectiveDate", "EffectiveDate")
                .replace(bidPattern, (_, value) => (
                    `<Bid>${Number((Number(value) / currencyFactor).toFixed(3))}</Bid>`
                ))
                .replace(askPattern, (_, value) => (
                    `<Ask>${Number((Number(value) / currencyFactor).toFixed(3))}</Ask>`
                ))
                .replace(midPattern, (_, value) => (
                    `<Mid>${Number((Number(value) / currencyFactor).toFixed(3))}</Mid>`
                ));

            return response.data as GetRatesResponse<O, T>;
        };

        const rawData: RawRateRow<T> = JSON.parse(response.data);
        if (!rawData.rates || !Array.isArray(rawData.rates) || rawData.rates.length === 0) {
            throw new Error(`Received unknown response format.`);
        };

        if (this.config.debug === true) {
            console.debug(`${fomredDate} | NBPApiClient | Successfully found ${rawData.rates.length} records`);
            console.debug(`${fomredDate} | NBPApiClient | RAW Response:`);
            console.debug(rawData);
        };

        return {
            table: rawData.table,
            currency: rawData.currency,
            code: rawData.code,
            rates: rawData.rates.map((rate: RawRateRowRate<T>) => {
                if (`mid` in rate) {
                    return {
                        no: rate.no,
                        effectiveDate: new Date(rate.effectiveDate),
                        mid: Number(Number((rate.mid as number) / currencyFactor).toFixed(3))
                    };
                } else {
                    return {
                        no: rate.no,
                        effectiveDate: new Date(rate.effectiveDate),
                        bid: Number(Number((rate.bid as number) / currencyFactor).toFixed(3)),
                        ask: Number(Number((rate.ask as number) / currencyFactor).toFixed(3)),
                    };
                }
            })
        } as GetRatesResponse<O, T>;
    };

    public async getGoldPrice(
        params?: GetGoldPriceParams
    ): Promise<GetGoldPriceResponse | string> {

        const client = new Axios();
        let url = `${this.host}/cenyzlota`;

        if (params && params.mode !== "current") {
            switch (params.mode) {
                case GetGoldPriceEnum.TODAY:
                case "today":

                    url += `/today`;
                    break;

                case GetGoldPriceEnum.FROM_DATE:
                case "from-date":

                    url = this.prepareUrlForSpecifiedDate(url, params.date);
                    break;

                case GetGoldPriceEnum.BETWEEN_DATES:
                case "between-dates":

                    const { startDate, endDate } = params;
                    url = this.prepareUrlForDateRange(url, startDate, endDate);
                    break;

                case GetGoldPriceEnum.DAYS_BEFORE:
                case "days-before":
                case GetGoldPriceEnum.DAYS_AFTER:
                case "days-after":

                    const { days, mode, date } = params;
                    url = this.prepareUrlForRelativeDate(url, date, days, mode);
                    break;

                default:
                    throw new Error(`Unknown retrieving mode for gold price.`);
            }
        };

        const fomredDate = new Date().toISOString().replace("T", " ");
        if (this.config.debug === true) {
            console.log(`${fomredDate} | NBPApiClient | Sending request to url: ${url}`);
        };

        const priceMultiplier = this.config.unit === GoldMeasureUnitEnum.OUNCES ? this.goldOunceInGrams : 1;
        const currencyFactor: number = this.config.currency === Iso4217CurrencyCodeEnum.PLN ? 1 : 1;
        const response = await client.get<string>(url, { params: { format: this.config.outputFormat } });
        if (!response.data) {
            throw new Error(`Failed to receive gold price.`);
        };

        if (this.config.outputFormat === `xml`) {

            const pattern = /<Price>([\d.]+)<\/Price>/g;
            response.data = response.data
                .replaceAll("Data", "Date")
                .replaceAll("CenaZlota", "GoldPrice")
                .replaceAll("Cena", "Price")
                .replace(pattern, (_, value) => (
                    `<Price>${Number((Number(value) * priceMultiplier / currencyFactor).toFixed(3))}</Price>`
                ));

            return response.data;
        };

        const rawData: GetGoldPriceResponse<`raw`> = JSON.parse(response.data);
        if (!Array.isArray(rawData)) {
            throw new Error(`Received unknown response format.`);
        };

        const data: GetGoldPriceResponse = rawData.map((row: RawGoldPriceRecord) => ({
            date: new Date(row.data),
            price: Number((Number(row.cena) * priceMultiplier / currencyFactor).toFixed(3)),
            currency: this.config.currency,
            unit: this.config.unit,
        }));

        if (this.config.debug === true) {
            console.log(`${fomredDate} | NBPApiClient | Successfully found ${data.length} records`);
        };

        return data;
    };

};