import { GetGoldPriceResponse, NBPApiClientConfiguration } from "./types.js";
export declare class NBPApiClient {
    private config;
    constructor(_config: NBPApiClientConfiguration);
    private get host();
    getRates(): Promise<void>;
    getGoldPrice(): Promise<GetGoldPriceResponse>;
}
