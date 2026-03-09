import { Axios } from "axios";
export class NBPApiClient {
    config = null;
    constructor(_config) {
        this.config = _config;
    }
    ;
    get host() {
        return Buffer.from("aHR0cHM6Ly9hcGkubmJwLnBsL2FwaQ==", "base64").toString("utf-8");
    }
    ;
    async getRates() {
    }
    ;
    async getGoldPrice() {
        const client = new Axios();
        const url = `${this.host}/cenyzlota`;
        const response = await client.get(url);
        if (!response.data) {
            throw new Error(`Failed to receive gold price.`);
        }
        ;
        const rawData = JSON.parse(response.data);
        if (!Array.isArray(rawData)) {
            throw new Error(`Received unknown response format.`);
        }
        ;
        const data = rawData.map((row => ({
            date: new Date(row.data),
            price: Number(row.cena)
        })));
        console.debug(data);
        console.log(`here i was`);
        return [];
    }
    ;
}
;
const client = new NBPApiClient({ outputFormat: `JSON` });
client.getGoldPrice();
//# sourceMappingURL=nbp-api-client.js.map