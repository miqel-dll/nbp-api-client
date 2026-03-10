import { GetGoldPriceParams, GetGoldPriceResponse, GetRatesParams, GetTableResponse, GetTablesParams, NBPApiClientConfiguration, TableCodes } from "./types.js";
import { TableCodeEnum } from "./enums.js";
export declare class NBPApiClient {
    private config;
    private maxDaysRange;
    constructor(_config?: Partial<NBPApiClientConfiguration>);
    private goldOunceInGrams;
    private get host();
    private prepareUrlForRelativeDate;
    private prepareUrlForDateRange;
    private prepareUrlForSpecifiedDate;
    getTables<T extends TableCodes | TableCodeEnum>(params: GetTablesParams & {
        table: T;
    }): Promise<GetTableResponse<T> | string>;
    getRates({}: GetRatesParams): Promise<string>;
    getGoldPrice(params?: GetGoldPriceParams): Promise<GetGoldPriceResponse | string>;
}
