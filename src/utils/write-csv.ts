import * as fastCsv from 'fast-csv';
import * as fs from 'fs';
import path from 'path';

export async function writeCsv(data: object[]): Promise<void> {
  const filePath = path.join(__dirname, '../assets/file.csv');
  return new Promise((resolve, reject) =>
    fastCsv
      .write(data, { headers: true })
      .pipe(fs.createWriteStream(filePath))
      .on('finish', resolve)
      .on('error', reject),
  );
}
