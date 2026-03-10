import { GetGoldPriceParams, GetGoldPriceResponse, GetRatesParams, GetTablesParams, NBPApiClientConfiguration } from "./types.js";
export declare class NBPApiClient {
    private config;
    private maxDaysRange;
    constructor(_config?: Partial<NBPApiClientConfiguration>);
    private goldOunceInGrams;
    private get host();
    private prepareUrlForRelativeDate;
    private prepareUrlForDateRange;
    private prepareUrlForSpecifiedDate;
    getTables(params: GetTablesParams): Promise<string>;
    getRates({}: GetRatesParams): Promise<string>;
    getGoldPrice(params?: GetGoldPriceParams): Promise<GetGoldPriceResponse | string>;
}
