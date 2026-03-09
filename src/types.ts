export type NBPApiClientConfiguration = {
    outputFormat: OutputFormat,
};

type OutputFormat = `XML` | `JSON`;

export type GetGoldPriceResponse<T extends never | `raw` = never> = GoldPriceRecord<T>[];

export type GoldPriceRecord<T extends never | `raw`> = [T] extends [never]
    ? FormedGoldPriceRecord
    : RawGoldPriceRecord;

type FormedGoldPriceRecord = {
    date: Date,
    price: number,
};

type RawGoldPriceRecord = {
    data: string,
    cena: number,
};