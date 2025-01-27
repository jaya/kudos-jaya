import * as HTTPUtil from '@/utils/request';
import { Giphy } from '../giphy';
import { giphySuccessResponse } from './samples';

// const { token, baseUrl } = config.get<{ token: string; baseUrl: string }>(
//   'externalClients.giphy'
// );
jest.mock('@/utils/request');

describe('Giphy', () => {
  let giphy: Giphy;
  let requestMock: jest.Mocked<HTTPUtil.Request>;

  beforeEach(() => {
    requestMock = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;
    giphy = new Giphy(requestMock);
  });

  describe('fetchGif()', () => {
    describe('When giphy response is success', () => {
      it('Should return a random gif based on keyword passed', async () => {
        requestMock.get.mockResolvedValue({
          data: giphySuccessResponse,
        } as HTTPUtil.Response);

        const res = await giphy.fetchGif();
        expect(res).toEqual(giphySuccessResponse.data.images.original.webp);
      });
    });
    describe('When giphy response is an error', () => {
      it('Should return a fallback local gif from assets', async () => {
        const regex =
          /^https:\/\/media\w*\.giphy\.com\/media\/[\w-]+\/[\w-]+\.gif$/;

        const error = new Error();
        error.message = 'Request failed';

        requestMock.get.mockRejectedValue(error);
        const res = await giphy.fetchGif();
        expect(res).toMatch(regex);
      });
    });
  });
});
