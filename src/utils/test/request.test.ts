import axios, { AxiosError } from 'axios';
import { Request, RequestConfig } from '../request';

jest.mock('axios');

describe('Request', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  describe('get', () => {
    it('should make a GET request with the correct URL and config', async () => {
      const url = 'https://example.com/api';
      const response = {
        data: 'test-data',
        status: 200,
        statusText: 'OK',
        config: { headers: {} },
      };
      mockedAxios.get.mockResolvedValue(response);

      const result = await new Request().get(url);

      expect(mockedAxios.get).toHaveBeenCalledWith(url, {});
      expect(result).toEqual(response);
    });

    it('should pass config in the GET request', async () => {
      const url = 'https://example.com/api';
      const config: RequestConfig = {
        headers: { Authorization: 'Bearer token' },
      };
      const response = {
        data: 'test-data',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} },
      };
      mockedAxios.get.mockResolvedValue(response);

      const result = await new Request().get(url, config);

      expect(mockedAxios.get).toHaveBeenCalledWith(url, config);
      expect(result).toEqual(response);
    });
  });

  describe('post', () => {
    it('should make a POST request with the correct URL, config, and data', async () => {
      const url = 'https://example.com/api';
      const data = { key: 'value' };
      const config: RequestConfig = {};
      const response = {
        data: 'test-data',
        status: 201,
        statusText: 'Created',
        config: { headers: {} },
      };
      mockedAxios.post.mockResolvedValue(response);

      const result = await new Request().post(url, config, data);

      expect(mockedAxios.post).toHaveBeenCalledWith(url, data, config);
      expect(result).toEqual(response);
    });

    it('should make a POST request with the correct config and without data', async () => {
      const url = 'https://example.com/api';
      const config: RequestConfig = {};
      const response = {
        data: 'test-data',
        status: 201,
        statusText: 'Created',
        config: { headers: {} },
      };
      mockedAxios.post.mockResolvedValue(response);

      const result = await new Request().post(url, config);

      expect(mockedAxios.post).toHaveBeenCalledWith(url, undefined, config);
      expect(result).toEqual(response);
    });
  });

  describe('isRequestError', () => {
    it('should return true if the error is an AxiosError with a response', () => {
      const axiosError = {
        response: { status: 404 },
      } as AxiosError;

      const result = Request.isRequestError(axiosError);
      expect(result).toBe(true);
    });

    it('should return false if the error is not an AxiosError or does not have a response', () => {
      const error = new Error('Test Error');
      const result = Request.isRequestError(error);
      expect(result).toBe(false);
    });
  });

  describe('extractErrorData', () => {
    it('should extract data and status from AxiosError', () => {
      const axiosError = {
        response: {
          data: { message: 'Not Found' },
          status: 404,
        },
      } as AxiosError;

      const result = Request.extractErrorData(axiosError);
      expect(result).toEqual({
        data: { message: 'Not Found' },
        status: 404,
      });
    });

    it('should throw an error if the provided error is not an AxiosError', () => {
      const error = new Error('Test Error');

      expect(() => Request.extractErrorData(error)).toThrow(
        `The error ${error} is not a Request Error`,
      );
    });
  });
});
