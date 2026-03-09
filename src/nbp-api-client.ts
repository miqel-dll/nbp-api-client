import { GetGoldPriceResponse, NBPApiClientConfiguration } from "./types.js";
import { Axios } from "axios";
export class NBPApiClient {

    private config: NBPApiClientConfiguration = null;

    constructor(
        _config: NBPApiClientConfiguration
    ) {
        this.config = _config;
    };

    private get host(): string {
        return Buffer.from("aHR0cHM6Ly9hcGkubmJwLnBsL2FwaQ==", "base64").toString("utf-8");
    };

    public async getRates(): Promise<void> {

    };

    public async getGoldPrice(): Promise<GetGoldPriceResponse> {

        const client = new Axios();

        const url = `${this.host}/cenyzlota`
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


        return data;
    };

};