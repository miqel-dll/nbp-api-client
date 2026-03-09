import {
    GetGoldPriceParams, GetGoldPriceResponse, GetRatesParams, NBPApiClientConfiguration
} from "./types.js";
import { GetGoldPriceEnum, Iso4217CurrencyCodeEnum, OutputFormatEnum } from "./enums.js";
import { Axios } from "axios";
export class NBPApiClient {

    private config: NBPApiClientConfiguration = {
        outputFormat: OutputFormatEnum.JSON,
        debug: false,
        currency: Iso4217CurrencyCodeEnum.PLN,
    };

    constructor(
        _config?: Partial<NBPApiClientConfiguration>
    ) {
        this.config = { ...this.config, ..._config };
    };

    private get host(): string {
        return Buffer.from("aHR0cHM6Ly9hcGkubmJwLnBsL2FwaQ==", "base64").toString("utf-8");
    };

    public async getRates(
        { }: GetRatesParams
    ): Promise<void> {

    };

    public async getGoldPrice(params?: GetGoldPriceParams): Promise<GetGoldPriceResponse> {

        const client = new Axios();
        let url = this.host;
        if (params) {
            switch (params.mode) {
                case GetGoldPriceEnum.CURRENT:
                case "current":

                    url += `/cenyzlota`;
                    break;

                case GetGoldPriceEnum.TODAY:
                case "today":

                    url += `/cenyzlota/today`;
                    break;

                case GetGoldPriceEnum.FROM_DATE:
                case "from-date":

                    const date = new Date();
                    const ISO8601FormedDate = date.toISOString().split(`T`).shift();
                    url += `/cenyzlota/${ISO8601FormedDate}`
                    break;

                case GetGoldPriceEnum.BETWEEN_DATES:
                case "between-dates":

                    const startDate = typeof params.startDate === `string` ? new Date() : params.startDate;
                    const endDate = typeof params.endDate === `string` ? new Date() : params.endDate;
                    const ISO8601FormedStartDate = startDate.toISOString().split(`T`).shift();
                    const ISO8601FormedEndDate = endDate.toISOString().split(`T`).shift();

                    url += `/cenyzlota/${ISO8601FormedStartDate}/${ISO8601FormedEndDate}`
                    break;

                case GetGoldPriceEnum.DAYS_BEFORE:
                case "days-before":
                case GetGoldPriceEnum.DAYS_AFTER:
                case "days-after":

                    const relativeStartDate = new Date(params.date);
                    const relativeEndDate = new Date(params.date);

                    if (params.mode === `days-after`) {
                        relativeEndDate.setDate(relativeEndDate.getDate() + params.days);
                    } else if (params.mode === `days-before`) {
                        relativeStartDate.setDate(relativeStartDate.getDate() - params.days)
                    }

                    const ISO8601FormedRelativeStartDate = relativeStartDate.toISOString().split(`T`).shift();
                    const ISO8601FormedRelativeEndDate = relativeEndDate.toISOString().split(`T`).shift();

                    url += `/cenyzlota/${ISO8601FormedRelativeStartDate}/${ISO8601FormedRelativeEndDate}`
                    break;

                default:
                    throw new Error(`Unknown retrieving moge for gold price.`);
            }
        };

        const fomredDate = new Date().toISOString().split(`T`).shift();
        if (this.config.debug === true) {
            console.log(`${fomredDate} | NBPApiClient | Sending request to url: ${url}`);
        };

        const response = await client.get<string>(url);
        if (!response.data) {
            throw new Error(`Failed to receive gold price.`);
        };

        const rawData: GetGoldPriceResponse<`raw`> = JSON.parse(response.data);
        if (!Array.isArray(rawData)) {
            throw new Error(`Received unknown response format.`);
        };

        const data: GetGoldPriceResponse = rawData.map((row => ({
            date: new Date(row.data),
            price: Number(row.cena)
        })));

        if (this.config.debug === true) {
            console.log(`${fomredDate} | NBPApiClient | Successfully found ${data.length} records`);
        };

        return data;
    };

};