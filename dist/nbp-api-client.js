import { GetGoldPriceEnum, OutputFormatEnum } from "./enums.js";
import { Axios } from "axios";
export class NBPApiClient {
    config = null;
    constructor(_config = {
        outputFormat: OutputFormatEnum.JSON
    }) {
        this.config = _config;
    }
    ;
    get host() {
        return Buffer.from("aHR0cHM6Ly9hcGkubmJwLnBsL2FwaQ==", "base64").toString("utf-8");
    }
    ;
    async getRates({}) {
    }
    ;
    async getGoldPrice(params) {
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
                    url += `/cenyzlota/${ISO8601FormedDate}`;
                    break;
                case GetGoldPriceEnum.BETWEEN_DATES:
                case "between-dates":
                    const startDate = typeof params.startDate === `string` ? new Date() : params.startDate;
                    const endDate = typeof params.endDate === `string` ? new Date() : params.endDate;
                    const ISO8601FormedStartDate = startDate.toISOString().split(`T`).shift();
                    const ISO8601FormedEndDate = endDate.toISOString().split(`T`).shift();
                    url += `/cenyzlota/${ISO8601FormedStartDate}/${ISO8601FormedEndDate}`;
                    break;
                case GetGoldPriceEnum.DAYS_BEFORE:
                case "days-before":
                case GetGoldPriceEnum.DAYS_AFTER:
                case "days-after":
                    const relativeStartDate = new Date(params.date);
                    const relativeEndDate = new Date(params.date);
                    if (params.mode === `days-after`) {
                        relativeEndDate.setDate(relativeEndDate.getDate() + params.days);
                    }
                    else if (params.mode === `days-before`) {
                        relativeStartDate.setDate(relativeStartDate.getDate() - params.days);
                    }
                    const ISO8601FormedRelativeStartDate = relativeStartDate.toISOString().split(`T`).shift();
                    const ISO8601FormedRelativeEndDate = relativeEndDate.toISOString().split(`T`).shift();
                    url += `/cenyzlota/${ISO8601FormedRelativeStartDate}/${ISO8601FormedRelativeEndDate}`;
                    break;
                default:
                    throw new Error(`Unknown retrieving moge for gold price.`);
            }
        }
        ;
        console.log(`----------------`);
        console.log(params.mode);
        console.log(url);
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
        console.log(rawData);
        const data = rawData.map((row => ({
            date: new Date(row.data),
            price: Number(row.cena)
        })));
        console.log(data);
        return data;
    }
    ;
}
;
const client = new NBPApiClient({ outputFormat: OutputFormatEnum.JSON });
const startDate = new Date();
startDate.setDate(startDate.getDate() - 8);
const endDate = new Date();
endDate.setDate(endDate.getDate() - 2);
await client.getGoldPrice({ mode: 'between-dates', startDate, endDate });
await client.getGoldPrice({ mode: `from-date`, date: endDate });
await client.getGoldPrice({ mode: `days-before`, days: 2, date: endDate });
await client.getGoldPrice({ mode: `days-after`, days: 5, date: startDate });
await client.getGoldPrice({ mode: `current` });
await client.getGoldPrice({ mode: `today` });
//# sourceMappingURL=nbp-api-client.js.map