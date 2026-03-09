import { GetGoldPriceParams, GetGoldPriceResponse, GetRatesParams, NBPApiClientConfiguration } from "./types.js";
export declare class NBPApiClient {
    private config;
    constructor(_config?: NBPApiClientConfiguration);
    private get host();
    getRates({}: GetRatesParams): Promise<void>;
    getGoldPrice(params?: GetGoldPriceParams): Promise<GetGoldPriceResponse>;
}
