import { GetGoldPriceEnum, GoldMeasureUnitEnum, Iso4217CurrencyCodeEnum, OutputFormatEnum } from "./enums.js";
export type NBPApiClientConfiguration = {
    outputFormat: OutputFormatEnum | `xml` | `json`;
    debug: boolean;
    currency: Iso4217CurrencyCodeEnum;
    unit: GoldMeasureUnitEnum;
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
    currency: Iso4217CurrencyCodeEnum;
    unit: GoldMeasureUnitEnum;
};
export type GetGoldPriceParams = GetCurrentGoldPrice | GetGoldPriceFromToday | GetGoldPriceBetweenDates | GetGoldPriceForRelativeTime;
type GettingGoldParamsEssentials = {
    currency: Iso4217CurrencyCodeEnum;
};
export type GetCurrentGoldPrice = GettingGoldParamsEssentials & {
    mode: `today` | `current` | GetGoldPriceEnum.TODAY | GetGoldPriceEnum.CURRENT;
};
export type GetGoldPriceFromToday = GettingGoldParamsEssentials & {
    mode: `from-date` | GetGoldPriceEnum.FROM_DATE;
    date: Date | string;
};
export type GetGoldPriceBetweenDates = GettingGoldParamsEssentials & {
    mode: `between-dates` | GetGoldPriceEnum.BETWEEN_DATES;
    startDate: Date | string;
    endDate: Date | string;
};
export type GetGoldPriceForRelativeTime = GettingGoldParamsEssentials & {
    mode: `days-before` | `days-after` | GetGoldPriceEnum.DAYS_BEFORE | GetGoldPriceEnum.DAYS_AFTER;
    date: Date | string;
    days: number;
};
export type GetRatesParams = {};
export {};
