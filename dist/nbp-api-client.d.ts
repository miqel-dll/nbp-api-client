import { GetTablesParams, NBPApiClientConfiguration, TableCodes, GetGoldPriceParams, GetGoldPriceResponse, GetRatesParams, GetTableResponse, GetRatesResponse } from "./types.js";
import { OutputFormatEnum, TableCodeEnum } from "./enums.js";
export declare class NBPApiClient<O extends OutputFormatEnum | `xml` | `json`> {
    private config;
    private maxDaysRange;
    constructor(_config?: Partial<NBPApiClientConfiguration<O>>);
    private goldOunceInGrams;
    private get host();
    private prepareUrlForRelativeDate;
    private prepareUrlForDateRange;
    private prepareUrlForSpecifiedDate;
    getTables<T extends TableCodes | TableCodeEnum>(params: GetTablesParams & {
        table: T;
    }): Promise<GetTableResponse<O, T>>;
    getRates<T extends TableCodes | TableCodeEnum>(params: GetRatesParams & {
        table: T;
    }): Promise<GetRatesResponse<O, T>>;
    getGoldPrice(params?: GetGoldPriceParams): Promise<GetGoldPriceResponse | string>;
}
