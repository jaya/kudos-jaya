import config from 'config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Recognition } from './entity/recognition';
import { Wallet } from './entity/wallet';
import { DbConfig } from './types';

const { host, port, user, password, name } = config.get<DbConfig>('database');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username: user,
  password: password,
  database: name,
  synchronize: true,
  logging: false,
  entities: [Wallet, Recognition],
  migrations: [],
  subscribers: [],
});
