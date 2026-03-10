import { GetGoldPriceParams, GetGoldPriceResponse, GetRatesParams, GetTablesParams, NBPApiClientConfiguration } from "./types.js";
import { GetGoldPriceEnum, GoldMeasureUnitEnum, Iso4217CurrencyCodeEnum, OutputFormatEnum } from "./enums.js";
import { Axios } from "axios";
export class NBPApiClient {

    private config: NBPApiClientConfiguration = {
        outputFormat: OutputFormatEnum.JSON,
        debug: false,
        currency: Iso4217CurrencyCodeEnum.USD,
        unit: GoldMeasureUnitEnum.OUNCES,
    };

    private maxDaysRange = 93;

    constructor(
        _config?: Partial<NBPApiClientConfiguration>
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

    public async getTables(
        params: GetTablesParams
    ): Promise<string> {

        const client = new Axios();
        let url = `${this.host}/exchangerates/tables/${params.table}`;

        return ``;
    };

    public async getRates(
        { }: GetRatesParams
    ): Promise<string> {
        return ``;
    };

    public async getGoldPrice(
        params?: GetGoldPriceParams
    ): Promise<GetGoldPriceResponse | string> {

        const client = new Axios();
        let url = `${this.host}/cenyzlota`;
        if (params) {
            switch (params.mode) {
                case GetGoldPriceEnum.CURRENT:
                case "current":

                    break;

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

                    const { days, mode } = params;
                    url = this.prepareUrlForRelativeDate(url, params.date, days, mode);
                    break;

                default:
                    throw new Error(`Unknown retrieving moge for gold price.`);
            }
        };

        const fomredDate = new Date().toISOString().split(`T`).shift();
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

        const data: GetGoldPriceResponse = rawData.map((row => ({
            date: new Date(row?.data),
            price: Number((Number(row?.cena) * priceMultiplier / currencyFactor).toFixed(3)),
            currency: this.config.currency,
            unit: this.config.unit,
        })));

        if (this.config.debug === true) {
            console.log(`${fomredDate} | NBPApiClient | Successfully found ${data.length} records`);
        };

        return data;
    };

};