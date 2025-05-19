import { ServerResponse } from 'http';
import { getQueryParams, sendJsonResponse } from '../http-utils';

describe('http-utils', () => {
  describe('sendJsonResponse', () => {
    let mockRes: Partial<ServerResponse>;

    beforeEach(() => {
      mockRes = {
        writeHead: jest.fn(),
        end: jest.fn(),
      };
    });

    it('should call writeHead with the correct status code and headers', () => {
      const statusCode = 200;
      const payload = { message: 'Success' };

      sendJsonResponse(mockRes as ServerResponse, statusCode, payload);

      expect(mockRes.writeHead).toHaveBeenCalledTimes(1);
      expect(mockRes.writeHead).toHaveBeenCalledWith(statusCode, {
        'Content-Type': 'application/json',
      });
    });
  });

  describe('getQueryParams', () => {
    it('should return default values when URL has no query parameters', () => {
      const url = '/api/data';
      const result = getQueryParams(url);
      expect(result).toEqual({ page: 1, pageSize: 20 });
    });

    it('should return default values when URL has a question mark but no parameters', () => {
      const url = '/api/data?';
      const result = getQueryParams(url);
      expect(result).toEqual({ page: 1, pageSize: 20 });
    });

    it('should parse page parameter correctly and use default pageSize', () => {
      const url = '/api/data?page=3';
      const result = getQueryParams(url);
      expect(result).toEqual({ page: 3, pageSize: 20 });
    });

    it('should parse pageSize parameter correctly and use default page', () => {
      const url = '/api/data?pageSize=50';
      const result = getQueryParams(url);
      expect(result).toEqual({ page: 1, pageSize: 50 });
    });
  });
});
