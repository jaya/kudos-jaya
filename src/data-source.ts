import config from 'config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { DbConfig } from './types';

const { host, port, user, password, name } = config.get<DbConfig>('database');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username: user,
  password: password,
  database: name,
  synchronize: false,
  logging: ['error'],
  ssl: { rejectUnauthorized: false },
  entities: [`${__dirname}/**/entities/*.{ts,js}`],
  migrations: [`${__dirname}/**/migrations/*.{ts,js}`],
});
