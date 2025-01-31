import * as fastCsv from 'fast-csv';
import * as fs from 'fs';
import { writeCsv } from '../write-csv';

jest.mock('fs');
jest.mock('fast-csv');

describe('writeCsv', () => {
  const mockData = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
  ];

  let writeStreamMock;
  let csvStreamMock;

  beforeEach(() => {
    writeStreamMock = {
      on: jest.fn().mockImplementation(function (event, callback) {
        if (event === 'finish') {
          setImmediate(callback);
        }
        return this;
      }),
    };
    csvStreamMock = {
      pipe: jest.fn().mockReturnValue(writeStreamMock),
    };
    (fs.createWriteStream as jest.Mock).mockReturnValue(writeStreamMock);
    (fastCsv.write as jest.Mock).mockReturnValue(csvStreamMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should write data to a CSV file successfully', async () => {
    await expect(writeCsv(mockData)).resolves.toBeUndefined();
    expect(fastCsv.write).toHaveBeenCalledWith(mockData, { headers: true });
  });
});
