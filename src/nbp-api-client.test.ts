import { GetGoldPriceEnum, Iso4217CurrencyCodeEnum, OutputFormatEnum } from './enums.js';
import { NBPApiClient } from './nbp-api-client.js';
import { GetRatesResponse } from './types.js';
import { Axios } from 'axios';

jest.mock('axios');

describe('NBPApiClient', () => {
  let client: NBPApiClient<OutputFormatEnum.JSON>;
  let mockGet: jest.Mock;

  beforeEach(() => {
    mockGet = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Axios as any).mockImplementation(() => ({
      get: mockGet
    }));
    client = new NBPApiClient({ outputFormat: OutputFormatEnum.JSON, currency: `PLN` });
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

  describe('getGoldPriceJSON', () => {

    const mockResponse = [
      { data: '2023-01-01', cena: 250.0 },
      { data: '2023-01-02', cena: 251.0 }
    ];

    beforeEach(() => {
      mockGet.mockResolvedValue({ data: JSON.stringify(mockResponse) });
    });

    it('should fetch current gold price when no params', async () => {
      const result = await client.getGoldPrice();

      expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota', { "params": { "format": "json" } });
      expect(result).toEqual([
        { date: new Date('2023-01-01'), price: 7775.869, unit: "ounces", currency: "PLN" },
        { date: new Date('2023-01-02'), price: 7806.973, unit: "ounces", currency: "PLN" }
      ]);
    });

    it('should fetch current gold price with mode current', async () => {
      const result = await client.getGoldPrice({ mode: GetGoldPriceEnum.CURRENT, currency: Iso4217CurrencyCodeEnum.PLN });

      expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota', { "params": { "format": "json" } });
      expect(result).toHaveLength(2);
    });

    it('should fetch today gold price', async () => {
      const result = await client.getGoldPrice({ mode: GetGoldPriceEnum.TODAY, currency: Iso4217CurrencyCodeEnum.PLN });

      expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota/today', { "params": { "format": "json" } });
      expect(result).toHaveLength(2);
    });

    it('should fetch gold price from specific date', async () => {
      const date = new Date('2023-01-01');
      const result = await client.getGoldPrice({ mode: GetGoldPriceEnum.FROM_DATE, date, currency: Iso4217CurrencyCodeEnum.PLN });

      expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota/2023-01-01', { "params": { "format": "json" } });
      expect(result).toHaveLength(2);
    });

    it('should fetch gold price between dates', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-02');
      const result = await client.getGoldPrice({ mode: GetGoldPriceEnum.BETWEEN_DATES, startDate, endDate, currency: Iso4217CurrencyCodeEnum.PLN });

      expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota/2023-01-01/2023-01-02', { "params": { "format": "json" } });
      expect(result).toHaveLength(2);
    });

    it('should fetch gold price days before', async () => {
      const date = new Date('2023-01-05');
      const result = await client.getGoldPrice({ mode: GetGoldPriceEnum.DAYS_BEFORE, date, days: 2, currency: Iso4217CurrencyCodeEnum.PLN });

      expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota/2023-01-03/2023-01-05', { "params": { "format": "json" } });
      expect(result).toHaveLength(2);
    });

    it('should fetch gold price days after', async () => {
      const date = new Date('2023-01-01');
      const result = await client.getGoldPrice({ mode: GetGoldPriceEnum.DAYS_AFTER, date, days: 2, currency: Iso4217CurrencyCodeEnum.PLN });

      expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/cenyzlota/2023-01-01/2023-01-03', { "params": { "format": "json" } });
      expect(result).toHaveLength(2);
    });

    it('should throw error for unknown mode', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(client.getGoldPrice({ mode: 'unknown' as any, currency: Iso4217CurrencyCodeEnum.PLN })).rejects.toThrow('Unknown retrieving mode for gold price.');
    });

    it('should reject when specific date is in the future', async () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      await expect(client.getGoldPrice({ mode: GetGoldPriceEnum.FROM_DATE, date: future })).rejects.toThrow('date cannot be in the future.');
    });

    it('should reject when startDate is after endDate', async () => {
      const start = new Date('2026-03-10');
      const end = new Date('2026-03-05');
      await expect(client.getGoldPrice({ mode: GetGoldPriceEnum.BETWEEN_DATES, startDate: start, endDate: end })).rejects.toThrow('startDate must be earlier than endDate.');
    });

    it('should reject when date range exceeds maximum', async () => {

      const end = new Date();
      end.setDate(end.getDate() - 1);
      const start = new Date(end);
      start.setDate(start.getDate() - 100);
      await expect(client.getGoldPrice({ mode: GetGoldPriceEnum.BETWEEN_DATES, startDate: start, endDate: end })).rejects.toThrow('Date range cannot be greater than');
    });

    it('should reject when days parameter is too large', async () => {
      const today = new Date();
      await expect(client.getGoldPrice({ mode: GetGoldPriceEnum.DAYS_BEFORE, date: today, days: 200 })).rejects.toThrow('Days parameter cannot be greater than');
    });

    it('should reject when days-after produces future end date', async () => {
      const today = new Date();
      await expect(client.getGoldPrice({ mode: GetGoldPriceEnum.DAYS_AFTER, date: today, days: 5 })).rejects.toThrow('Computed end date cannot be in the future.');
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

    describe('Table A (mid rates)', () => {
      const mockResponseTableA = {
        table: 'A',
        currency: 'dolar amerykański',
        code: 'USD',
        rates: [
          { no: '049/A/NBP/2026', effectiveDate: '2026-03-12', mid: 3.6870 },
          { no: '048/A/NBP/2026', effectiveDate: '2026-03-11', mid: 3.6850 }
        ]
      };

      beforeEach(() => {
        mockGet.mockResolvedValue({ data: JSON.stringify(mockResponseTableA), status: 200 });
      });

      it('should fetch current exchange rate', async () => {
        const result = await client.getRates({ table: 'A', code: 'USD', mode: 'current' });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/rates/A/USD', { params: { format: OutputFormatEnum.JSON } });
        expect(result.table).toBe('A');
        expect(result.currency).toBe('dolar amerykański');
        expect(result.code).toBe('USD');
        expect(result.rates).toHaveLength(2);
        expect(result.rates[0]!.effectiveDate).toEqual(new Date('2026-03-12'));
        expect(result.rates[0]!.mid).toBe(3.687);
      });

      it('should fetch top-count exchange rates', async () => {
        const result = await client.getRates({ table: 'A', code: 'USD', mode: 'top-count', maxCount: 5 });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/rates/A/USD/last/5', { params: { format: OutputFormatEnum.JSON } });
        expect(result.rates).toHaveLength(2);
      });

      it('should fetch today exchange rates', async () => {
        const result = await client.getRates({ table: 'A', code: 'USD', mode: 'today' });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/rates/A/USD/today', { params: { format: OutputFormatEnum.JSON } });
        expect(result.rates).toHaveLength(2);
      });

      it('should fetch exchange rates for specific date', async () => {
        const date = new Date('2026-03-12');
        const result = await client.getRates({ table: 'A', code: 'USD', mode: 'date', date });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/rates/A/USD/2026-03-12', { params: { format: OutputFormatEnum.JSON } });
        expect(result.rates).toHaveLength(2);
      });

      it('should fetch exchange rates for date range', async () => {
        const startDate = new Date('2026-03-10');
        const endDate = new Date('2026-03-12');
        const result = await client.getRates({ table: 'A', code: 'USD', mode: 'date-range', startDate, endDate });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/rates/A/USD/2026-03-10/2026-03-12', { params: { format: OutputFormatEnum.JSON } });
        expect(result.rates).toHaveLength(2);
      });

      it('should fetch exchange rates days before', async () => {
        const date = new Date('2026-03-12');
        const result = await client.getRates({ table: 'A', code: 'USD', mode: 'days-before', date, days: 2 });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/rates/A/USD/2026-03-10/2026-03-12', { params: { format: OutputFormatEnum.JSON } });
        expect(result.rates).toHaveLength(2);
      });

      it('should fetch exchange rates days after', async () => {
        const date = new Date('2026-03-10');
        const result = await client.getRates({ table: 'A', code: 'USD', mode: 'days-after', date, days: 2 });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/rates/A/USD/2026-03-10/2026-03-12', { params: { format: OutputFormatEnum.JSON } });
        expect(result.rates).toHaveLength(2);
      });

      it('should reject when specific date is in the future', async () => {
        const future = new Date();
        future.setDate(future.getDate() + 10);
        await expect(client.getRates({ table: 'A', code: 'USD', mode: 'date', date: future })).rejects.toThrow('date cannot be in the future.');
      });

      it('should reject when startDate is after endDate', async () => {
        const start = new Date('2026-03-12');
        const end = new Date('2026-03-10');
        await expect(client.getRates({ table: 'A', code: 'USD', mode: 'date-range', startDate: start, endDate: end })).rejects.toThrow('startDate must be earlier than endDate.');
      });

      it('should reject when date range exceeds maximum', async () => {
        const end = new Date();
        end.setDate(end.getDate() - 1);
        const start = new Date(end);
        start.setDate(start.getDate() - 100);
        await expect(client.getRates({ table: 'A', code: 'USD', mode: 'date-range', startDate: start, endDate: end })).rejects.toThrow('Date range cannot be greater than');
      });

      it('should reject when days parameter is too large', async () => {
        const today = new Date();
        await expect(client.getRates({ table: 'A', code: 'USD', mode: 'days-before', date: today, days: 200 })).rejects.toThrow('Days parameter cannot be greater than');
      });

      it('should reject when days-after produces future end date', async () => {
        const today = new Date();
        await expect(client.getRates({ table: 'A', code: 'USD', mode: 'days-after', date: today, days: 5 })).rejects.toThrow('Computed end date cannot be in the future.');
      });

      it('should throw error for unknown mode', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await expect(client.getRates({ table: 'A', code: 'USD', mode: 'unknown' as any })).rejects.toThrow('Unknown retrieving mode for exchange rates.');
      });
    });

    describe('Table C (bid/ask rates)', () => {
      const mockResponseTableC = {
        table: 'C',
        currency: 'dolar amerykański',
        code: 'USD',
        rates: [
          { no: '023/C/NBP/2024', effectiveDate: '2024-02-01', bid: 3.9439, ask: 4.0235 },
          { no: '024/C/NBP/2024', effectiveDate: '2024-02-02', bid: 3.9450, ask: 4.0250 }
        ]
      };

      beforeEach(() => {
        mockGet.mockResolvedValue({ data: JSON.stringify(mockResponseTableC), status: 200 });
      });

      it('should fetch bid/ask rates from table C', async () => {
        const result = await client.getRates({ table: 'C', code: 'USD', mode: 'current' });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/rates/C/USD', { params: { format: OutputFormatEnum.JSON } });
        expect(result.table).toBe('C');
        expect(result.rates).toHaveLength(2);
        expect(result.rates[0]).toHaveProperty('bid');
        expect(result.rates[0]).toHaveProperty('ask');
        expect(result.rates[0]!.bid).toBe(3.944);
        expect(result.rates[0]!.ask).toBe(4.024);
      });
    });

    describe('Error handling', () => {
      it('should throw error if no data received', async () => {
        mockGet.mockResolvedValue({ data: '' });

        await expect(client.getRates({ table: 'A', code: 'USD', mode: 'current' })).rejects.toThrow('Failed to receive exchange rates.');
      });

      it('should throw error if status is 404', async () => {
        mockGet.mockResolvedValue({ data: JSON.stringify({}), status: 404 });

        await expect(client.getRates({ table: 'A', code: 'USD', mode: 'current' })).rejects.toThrow('There are no data for current, status: 404.');
      });

      it('should throw error if rates array is empty', async () => {
        const mockResponseEmpty: GetRatesResponse<'json', 'A'> = {
          table: 'A',
          currency: 'dolar amerykański',
          code: 'USD',
          rates: []
        };
        mockGet.mockResolvedValue({ data: JSON.stringify(mockResponseEmpty), status: 200 });

        await expect(client.getRates({ table: 'A', code: 'USD', mode: 'current' })).rejects.toThrow('Received unknown response format.');
      });

      it('should throw error if response format is invalid', async () => {
        mockGet.mockResolvedValue({ data: JSON.stringify({ invalid: 'response' }), status: 200 });

        await expect(client.getRates({ table: 'A', code: 'USD', mode: 'current' })).rejects.toThrow('Received unknown response format.');
      });
    });

  });

  describe('getTables', () => {

    describe('Table A (mid rates)', () => {
      const mockResponseTableA = [
        {
          table: 'A',
          no: '049/A/NBP/2026',
          effectiveDate: '2026-03-12',
          rates: [
            { currency: 'dolar amerykański', code: 'USD', mid: 3.6870 },
            { currency: 'euro', code: 'EUR', mid: 3.9850 }
          ]
        },
        {
          table: 'A',
          no: '048/A/NBP/2026',
          effectiveDate: '2026-03-11',
          rates: [
            { currency: 'dolar amerykański', code: 'USD', mid: 3.6850 },
            { currency: 'euro', code: 'EUR', mid: 3.9830 }
          ]
        }
      ];

      beforeEach(() => {
        mockGet.mockResolvedValue({ data: JSON.stringify(mockResponseTableA), status: 200 });
      });

      it('should fetch current table', async () => {
        const result = await client.getTables({ table: 'A', mode: 'current' });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/tables/A', { params: { format: OutputFormatEnum.JSON } });
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
        expect(result[0]!.table).toBe('A');
        expect(result[0]!.rates).toHaveLength(2);
        expect(result[0]!.rates[0]!.mid).toBe(3.687);
      });

      it('should fetch top-count tables', async () => {
        const result = await client.getTables({ table: 'A', mode: 'top-count', maxCount: 5 });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/tables/A/last/5', { params: { format: OutputFormatEnum.JSON } });
        expect(result).toHaveLength(2);
      });

      it('should fetch table from today', async () => {
        const result = await client.getTables({ table: 'A', mode: 'today' });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/tables/A/today', { params: { format: OutputFormatEnum.JSON } });
        expect(result).toHaveLength(2);
      });

      it('should fetch table for specific date', async () => {
        const date = new Date('2026-03-12');
        const result = await client.getTables({ table: 'A', mode: 'specified-date', date });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/tables/A/2026-03-12', { params: { format: OutputFormatEnum.JSON } });
        expect(result).toHaveLength(2);
      });

      it('should fetch tables for date range', async () => {
        const startDate = new Date('2026-03-10');
        const endDate = new Date('2026-03-12');
        const result = await client.getTables({ table: 'A', mode: 'between-dates', startDate, endDate });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/tables/A/2026-03-10/2026-03-12', { params: { format: OutputFormatEnum.JSON } });
        expect(result).toHaveLength(2);
      });

      it('should fetch tables days before', async () => {
        const date = new Date('2026-03-12');
        const result = await client.getTables({ table: 'A', mode: 'days-before', date, days: 2 });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/tables/A/2026-03-10/2026-03-12', { params: { format: OutputFormatEnum.JSON } });
        expect(result).toHaveLength(2);
      });

      it('should fetch tables days after', async () => {
        const date = new Date('2026-03-10');
        const result = await client.getTables({ table: 'A', mode: 'days-after', date, days: 2 });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/tables/A/2026-03-10/2026-03-12', { params: { format: OutputFormatEnum.JSON } });
        expect(result).toHaveLength(2);
      });

      it('should reject when specific date is in the future', async () => {
        const future = new Date();
        future.setDate(future.getDate() + 10);
        await expect(client.getTables({ table: 'A', mode: 'specified-date', date: future })).rejects.toThrow('date cannot be in the future.');
      });

      it('should reject when startDate is after endDate', async () => {
        const start = new Date('2026-03-12');
        const end = new Date('2026-03-10');
        await expect(client.getTables({ table: 'A', mode: 'between-dates', startDate: start, endDate: end })).rejects.toThrow('startDate must be earlier than endDate.');
      });

      it('should reject when date range exceeds maximum', async () => {
        const end = new Date();
        end.setDate(end.getDate() - 1);
        const start = new Date(end);
        start.setDate(start.getDate() - 100);
        await expect(client.getTables({ table: 'A', mode: 'between-dates', startDate: start, endDate: end })).rejects.toThrow('Date range cannot be greater than');
      });

      it('should reject when days parameter is too large', async () => {
        const today = new Date();
        await expect(client.getTables({ table: 'A', mode: 'days-before', date: today, days: 200 })).rejects.toThrow('Days parameter cannot be greater than');
      });

      it('should reject when days-after produces future end date', async () => {
        const today = new Date();
        await expect(client.getTables({ table: 'A', mode: 'days-after', date: today, days: 5 })).rejects.toThrow('Computed end date cannot be in the future.');
      });

      it('should throw error for unknown mode', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await expect(client.getTables({ table: 'A', mode: 'unknown' as any })).rejects.toThrow('Unknown retrieving mode for tables data for table.');
      });
    });

    describe('Table C (bid/ask rates)', () => {
      const mockResponseTableC = [
        {
          table: 'C',
          no: '023/C/NBP/2024',
          effectiveDate: '2024-02-01',
          rates: [
            { currency: 'dolar amerykański', code: 'USD', bid: 3.9439, ask: 4.0235 }
          ]
        }
      ];

      beforeEach(() => {
        mockGet.mockResolvedValue({ data: JSON.stringify(mockResponseTableC), status: 200 });
      });

      it('should fetch bid/ask rates from table C', async () => {
        const result = await client.getTables({ table: 'C', mode: 'current' });

        expect(mockGet).toHaveBeenCalledWith('https://api.nbp.pl/api/exchangerates/tables/C', { params: { format: OutputFormatEnum.JSON } });
        expect(result).toHaveLength(1);
        expect(result[0]!.table).toBe('C');
        expect(result[0]!.rates[0]).toHaveProperty('bid');
        expect(result[0]!.rates[0]).toHaveProperty('ask');
        expect(result[0]!.rates[0]!.bid).toBe(3.944);
        expect(result[0]!.rates[0]!.ask).toBe(4.024);
      });
    });

    describe('Error handling', () => {
      it('should throw error if no data received', async () => {
        mockGet.mockResolvedValue({ data: '' });

        await expect(client.getTables({ table: 'A', mode: 'current' })).rejects.toThrow('Failed to receive rates tables.');
      });

      it('should throw error if status is 404', async () => {
        mockGet.mockResolvedValue({ data: JSON.stringify([]), status: 404 });

        await expect(client.getTables({ table: 'A', mode: 'current' })).rejects.toThrow('There are no data for current, status: 404.');
      });

      it('should throw error if response is not array', async () => {
        mockGet.mockResolvedValue({ data: JSON.stringify({}), status: 200 });

        await expect(client.getTables({ table: 'A', mode: 'current' })).rejects.toThrow('Received unknown response format.');
      });

      it('should throw error if response array is empty', async () => {
        mockGet.mockResolvedValue({ data: JSON.stringify([]), status: 200 });

        await expect(client.getTables({ table: 'A', mode: 'current' })).rejects.toThrow('Received unknown response format.');
      });
    });

  });
});