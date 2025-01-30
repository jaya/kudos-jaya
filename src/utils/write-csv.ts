import * as fastCsv from 'fast-csv';
import * as fs from 'fs';
import path from 'path';

export const writeCsv = async (data: object[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const dirPath = path.join(__dirname, '../assets');
    const filePath = path.join(dirPath, 'file.csv');
    const ws = fs.createWriteStream(filePath);
    fastCsv
      .write(data, { headers: true })
      .pipe(ws)
      .on('finish', () => resolve())
      .on('error', reject);
  });
};
