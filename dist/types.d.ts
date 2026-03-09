import { GetGoldPriceEnum, OutputFormatEnum } from "./enums.js";
export type NBPApiClientConfiguration = {
    outputFormat: OutputFormatEnum | `xml` | `json`;
};
export type GetGoldPriceResponse<T extends never | `raw` = never> = GoldPriceRecord<T>[];
export type GoldPriceRecord<T extends never | `raw`> = [T] extends [never] ? FormedGoldPriceRecord : RawGoldPriceRecord;
type FormedGoldPriceRecord = {
    date: Date;
    price: number;
};
type RawGoldPriceRecord = {
    data: string;
    cena: number;
};
export type GetGoldPriceParams = GetCurrentGoldPrice | GetGoldPriceFromToday | GetGoldPriceBetweenDates | GetGoldPriceForRelativeTime;
export type GetCurrentGoldPrice = {
    mode: `today` | `current` | GetGoldPriceEnum.TODAY | GetGoldPriceEnum.CURRENT;
};
export type GetGoldPriceFromToday = {
    mode: `from-date` | GetGoldPriceEnum.FROM_DATE;
    date: Date | string;
};
export type GetGoldPriceBetweenDates = {
    mode: `between-dates` | GetGoldPriceEnum.BETWEEN_DATES;
    startDate: Date | string;
    endDate: Date | string;
};
export type GetGoldPriceForRelativeTime = {
    mode: `days-before` | `days-after` | GetGoldPriceEnum.DAYS_BEFORE | GetGoldPriceEnum.DAYS_AFTER;
    date: Date | string;
    days: number;
};
export type GetRatesParams = {};
export {};
