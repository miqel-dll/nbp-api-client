import { NBPApiClientConfiguration } from "./types.js";

export class NBPApiClient {

    constructor(
        private config: NBPApiClientConfiguration
    ) { }

    private get host(): string {
        return Buffer.from("aHR0cHM6Ly9hcGkubmJwLnBsL2FwaQ==", "base64").toString("utf-8");
    };

    

};