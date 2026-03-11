import { GetGoldPriceEnum, GetTableDataEnum, GoldMeasureUnitEnum, Iso4217CurrencyCodeEnum, OutputFormatEnum, TableCodeEnum } from "./enums.js";

export type NBPApiClientConfiguration = {
    outputFormat: OutputFormatEnum | `xml` | `json`,
    debug: boolean,
    currency: CurrencyCode | Iso4217CurrencyCodeEnum,
    unit: GoldMeasureUnitEnum,
};

export type GetGoldPriceResponse<T extends never | `raw` = never> = GoldPriceRecord<T>[];

export type GoldPriceRecord<T extends never | `raw`>
    = [T] extends [never]
    ? FormedGoldPriceRecord
    : RawGoldPriceRecord;

type FormedGoldPriceRecord = {
    date: Date,
    price: number,
};

type RawGoldPriceRecord = {
    data: string,
    cena: number,
    currency: Iso4217CurrencyCodeEnum,
    unit: GoldMeasureUnitEnum,
};

export type GetGoldPriceParams =
    | GetCurrentGoldPrice
    | GetGoldPriceFromToday
    | GetGoldPriceBetweenDates
    | GetGoldPriceForRelativeTime;

type GettingGoldParamsEssentials = {
    currency?: Iso4217CurrencyCodeEnum
};

export type GetCurrentGoldPrice =
    GettingGoldParamsEssentials & {
        mode:
        | `today`
        | `current`
        | GetGoldPriceEnum.TODAY
        | GetGoldPriceEnum.CURRENT;
    };

export type GetGoldPriceFromToday =
    GettingGoldParamsEssentials & {
        mode:
        | `from-date`
        | GetGoldPriceEnum.FROM_DATE,
        date: Date | string,
    };

export type GetGoldPriceBetweenDates =
    GettingGoldParamsEssentials & {
        mode:
        | `between-dates`
        | GetGoldPriceEnum.BETWEEN_DATES,
        startDate: Date | string,
        endDate: Date | string,
    };

export type GetGoldPriceForRelativeTime =
    GettingGoldParamsEssentials & {
        mode:
        | `days-before`
        | `days-after`
        | GetGoldPriceEnum.DAYS_BEFORE
        | GetGoldPriceEnum.DAYS_AFTER,
        date: Date | string,
        days: number,
    }

type GettingTableParamsEssentials = {
    currency?: Iso4217CurrencyCodeEnum,
    table: TableCodes | TableCodeEnum,
};

export type TableCodes = `A` | `B` | `C`;

export type GetTablesParams =
    | GetCurrentDataFromTableParams
    | GetTopCountFromSpecifiedTableParams
    | GetTablesFromTodayParams
    | GetTableDataFromSpecifiedDateParams
    | GetTableDataFromBetweenSpecifiedDatesParams
    | GetTableDataForRelativeTime;

export type GetCurrentDataFromTableParams =
    GettingTableParamsEssentials & {
        mode:
        | 'current'
        | GetTableDataEnum.CURRENT,
    }

export type GetTopCountFromSpecifiedTableParams =
    GettingTableParamsEssentials & {
        mode:
        | `top-count`
        | GetTableDataEnum.TOP_COUNT,
        maxCount: number,
    };

export type GetTablesFromTodayParams =
    GettingTableParamsEssentials & {
        mode:
        | `today`
        | GetTableDataEnum.TODAY,
    };

export type GetTableDataFromSpecifiedDateParams =
    GettingTableParamsEssentials & {
        mode:
        | `specified-date`
        | GetTableDataEnum.SPECIFIED_DATE,
        date: Date | string,
    };

export type GetTableDataFromBetweenSpecifiedDatesParams =
    GettingTableParamsEssentials & {
        mode:
        | `between-dates`
        | GetTableDataEnum.BETWEEN_DATES,
        startDate: Date | string,
        endDate: Date | string,
    };

export type GetTableDataForRelativeTime =
    GettingTableParamsEssentials & {
        mode:
        | `days-before`
        | `days-after`
        | GetTableDataEnum.DAYS_BEFORE
        | GetTableDataEnum.DAYS_AFTER,
        date: Date | string,
        days: number,
    }

export type GetTableResponse<T extends TableCodes | TableCodeEnum> = GetTableRow<T>[];

export type GetTableRow<T extends TableCodes | TableCodeEnum> = {
    table: TableCodeEnum | TableCodes,
    no: string,
    effectiveDate: string,
    rates: GetTableRowRate<T>[],
}

export type GetTableRowRate<T extends TableCodes | TableCodeEnum> =
    [T] extends ["C"]
    ? {
        currency: string,
        code: CurrencyCode | Iso4217CurrencyCodeEnum,
        bid: number,
        ask: number,
    } :
    {
        currency: string,
        code: CurrencyCode | Iso4217CurrencyCodeEnum,
        mid: number,
    }

export type GetRatesParams = {
};

export type CurrencyCode =
    | "AED"
    | "AFN"
    | "ALL"
    | "AMD"
    | "AOA"
    | "ARS"
    | "AUD"
    | "AWG"
    | "AZN"
    | "BAM"
    | "BBD"
    | "BDT"
    | "BHD"
    | "BIF"
    | "BMD"
    | "BND"
    | "BOB"
    | "BOV"
    | "BRL"
    | "BSD"
    | "BTN"
    | "BWP"
    | "BYN"
    | "BZD"
    | "CAD"
    | "CDF"
    | "CHE"
    | "CHF"
    | "CHW"
    | "CLF"
    | "CLP"
    | "CNY"
    | "COP"
    | "COU"
    | "CRC"
    | "CUP"
    | "CVE"
    | "CZK"
    | "DJF"
    | "DKK"
    | "DOP"
    | "DZD"
    | "EGP"
    | "ERN"
    | "ETB"
    | "EUR"
    | "FJD"
    | "FKP"
    | "GBP"
    | "GEL"
    | "GHS"
    | "GIP"
    | "GMD"
    | "GNF"
    | "GTQ"
    | "GYD"
    | "HKD"
    | "HNL"
    | "HTG"
    | "HUF"
    | "IRD"
    | "ILS"
    | "INR"
    | "IQD"
    | "IRR"
    | "ISK"
    | "JMD"
    | "JOD"
    | "JPY"
    | "KES"
    | "KGS"
    | "KHR"
    | "KMF"
    | "KPW"
    | "KRW"
    | "KWD"
    | "KYD"
    | "KZT"
    | "LAK"
    | "LBP"
    | "LKR"
    | "LRD"
    | "LSL"
    | "LYD"
    | "MAD"
    | "MDL"
    | "MGA"
    | "MKD"
    | "MMK"
    | "MNT"
    | "MOP"
    | "MRU"
    | "MUR"
    | "MVR"
    | "MWK"
    | "MXN"
    | "MXV"
    | "MYR"
    | "MZN"
    | "NAD"
    | "NGN"
    | "NIO"
    | "NOK"
    | "NPR"
    | "NZD"
    | "OMR"
    | "PAB"
    | "PEN"
    | "PGK"
    | "PHP"
    | "PKR"
    | "PLN"
    | "PYG"
    | "QAR"
    | "RON"
    | "RSD"
    | "RUB"
    | "RWF"
    | "SAR"
    | "SBD"
    | "SCR"
    | "SDG"
    | "SEK"
    | "SGD"
    | "SHP"
    | "SLE"
    | "SOS"
    | "SRD"
    | "SSP"
    | "STN"
    | "SVC"
    | "SYP"
    | "SZL"
    | "THB"
    | "TJS"
    | "TMT"
    | "TND"
    | "TOP"
    | "TRY"
    | "TTD"
    | "TWD"
    | "TZS"
    | "UAH"
    | "UGX"
    | "USD"
    | "USN"
    | "UYI"
    | "UYU"
    | "UYW"
    | "UZS"
    | "VED"
    | "VES"
    | "VND"
    | "VUV"
    | "WST"
    | "XAD"
    | "XAF"
    | "XAG"
    | "XAU"
    | "XBA"
    | "XBB"
    | "XBC"
    | "XBD"
    | "XCD"
    | "XCG"
    | "XDR"
    | "XOF"
    | "XPD"
    | "XPF"
    | "XPT"
    | "XSU"
    | "XTS"
    | "XUA"
    | "XXX"
    | "YER"
    | "ZAR"
    | "ZMW"
    | "ZWG";