import { NBPApiClient } from '../nbp-api-client';
import { Axios } from 'axios';
import { GetGoldPriceEnum, Iso4217CurrencyCodeEnum } from '../enums';
// Mock axios
jest.mock('axios');
describe('NBPApiClient', () => {
    let client;
    let mockGet;
    beforeEach(() => {
        mockGet = jest.fn();
        Axios.mockImplementation(() => ({
            get: mockGet
        }));
        client = new NBPApiClient();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('constructor', () => {
        it('should initialize with default config', () => {
            const client = new NBPApiClient();
            expect(client).toBeInstanceOf(NBPApiClient);
        });
        it('should merge provided config with defaults', () => {
            const client = new NBPApiClient({ debug: true, currency: Iso4217CurrencyCodeEnum.USD });
            expect(client).toBeInstanceOf(NBPApiClient);
        });
    });
    describe('getGoldPrice', () => {
        const mockResponse = [
            { data: '2023-01-01', cena: 250.0 },
            { data: '2023-01-02', cena: 251.0 }
        ];
        beforeEach(() => {
            mockGet.mockResolvedValue({ data: JSON.stringify(mockResponse) });
        });
        it('should fetch current gold price when no params', async () => {
            const result = await client.getGoldPrice();
            expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota');
            expect(result).toEqual([
                { date: new Date('2023-01-01'), price: 250 },
                { date: new Date('2023-01-02'), price: 251 }
            ]);
        });
        it('should fetch current gold price with mode current', async () => {
            const result = await client.getGoldPrice({ mode: GetGoldPriceEnum.CURRENT, currency: Iso4217CurrencyCodeEnum.PLN });
            expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota');
            expect(result).toHaveLength(2);
        });
        it('should fetch today gold price', async () => {
            const result = await client.getGoldPrice({ mode: GetGoldPriceEnum.TODAY, currency: Iso4217CurrencyCodeEnum.PLN });
            expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota/today');
            expect(result).toHaveLength(2);
        });
        it('should fetch gold price from specific date', async () => {
            const date = new Date('2023-01-01');
            const result = await client.getGoldPrice({ mode: GetGoldPriceEnum.FROM_DATE, date, currency: Iso4217CurrencyCodeEnum.PLN });
            expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota/2023-01-01');
            expect(result).toHaveLength(2);
        });
        it('should fetch gold price between dates', async () => {
            const startDate = new Date('2023-01-01');
            const endDate = new Date('2023-01-02');
            const result = await client.getGoldPrice({ mode: GetGoldPriceEnum.BETWEEN_DATES, startDate, endDate, currency: Iso4217CurrencyCodeEnum.PLN });
            expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota/2023-01-01/2023-01-02');
            expect(result).toHaveLength(2);
        });
        it('should fetch gold price days before', async () => {
            const date = new Date('2023-01-05');
            const result = await client.getGoldPrice({ mode: GetGoldPriceEnum.DAYS_BEFORE, date, days: 2, currency: Iso4217CurrencyCodeEnum.PLN });
            expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota/2023-01-03/2023-01-05');
            expect(result).toHaveLength(2);
        });
        it('should fetch gold price days after', async () => {
            const date = new Date('2023-01-01');
            const result = await client.getGoldPrice({ mode: GetGoldPriceEnum.DAYS_AFTER, date, days: 2, currency: Iso4217CurrencyCodeEnum.PLN });
            expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota/2023-01-01/2023-01-03');
            expect(result).toHaveLength(2);
        });
        it('should throw error for unknown mode', async () => {
            await expect(client.getGoldPrice({ mode: 'unknown', currency: Iso4217CurrencyCodeEnum.PLN })).rejects.toThrow('Unknown retrieving moge for gold price.');
        });
        it('should throw error if no data received', async () => {
            mockGet.mockResolvedValue({ data: '' });
            await expect(client.getGoldPrice()).rejects.toThrow('Failed to receive gold price.');
        });
        it('should throw error if response is not array', async () => {
            mockGet.mockResolvedValue({ data: JSON.stringify({}) });
            await expect(client.getGoldPrice()).rejects.toThrow('Received unknown response format.');
        });
    });
    describe('getRates', () => {
        it('should be defined', () => {
            expect(client.getRates).toBeDefined();
        });
        it('should not throw when called', async () => {
            await expect(client.getRates({})).resolves.not.toThrow();
        });
    });
});
//# sourceMappingURL=nbp-api-client.test.js.map