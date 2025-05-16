import { ServerResponse } from 'http';

export function sendJsonResponse(
  res: ServerResponse,
  statusCode: number,
  payload: object,
) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

export function getQueryParams(url: string): {
  page: number;
  pageSize: number;
} {
  let urlParams: URLSearchParams = new URLSearchParams();
  const params = url.split('?');

  if (params.length > 1) {
    urlParams = new URLSearchParams(params[1]);
  }

  const page = urlParams.get('page');
  const pageSize = urlParams.get('pageSize');

  return {
    page: page ? Number(page) : 1,
    pageSize: pageSize ? Number(pageSize) : 20,
  };
}
