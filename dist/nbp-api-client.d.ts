import { NBPApiClientConfiguration } from "./types.js";
export declare class NBPApiClient {
    private config;
    constructor(config: NBPApiClientConfiguration);
    private get host();
}
