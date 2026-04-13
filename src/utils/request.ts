import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

/* eslint-disable-next-line  */
export interface RequestConfig extends AxiosRequestConfig {}

/* eslint-disable-next-line */
export interface Response<T = any> extends AxiosResponse<T> {
  data: T;
}

export class Request {
  constructor(private request = axios) {}

  public get<T>(url: string, config: RequestConfig = {}): Promise<Response<T>> {
    return this.request.get<T, Response<T>>(url, config);
  }

  public post<T>(
    url: string,
    /* istanbul ignore next */

    config: RequestConfig = {},
    /* eslint-disable-next-line  */
    data?: any,
  ): Promise<Response<T>> {
    return this.request.post<T, Response<T>>(url, data, config);
  }

  public static isRequestError(error: Error): boolean {
    return !!(
      (error as AxiosError).response && (error as AxiosError).response?.status
    );
  }

  public static extractErrorData(
    error: unknown,
  ): Pick<AxiosResponse, 'data' | 'status'> {
    const axiosError = error as AxiosError;
    if (axiosError.response && axiosError.response.status) {
      return {
        data: axiosError.response.data,
        status: axiosError.response.status,
      };
    }
    throw Error(`The error ${error} is not a Request Error`);
  }
}
