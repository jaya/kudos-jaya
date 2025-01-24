import {
  Installation,
  Product,
  Recognition,
  Transaction,
  Wallet,
} from '@/entity';
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
  synchronize: true,
  logging: false,
  entities: [Wallet, Recognition, Product, Installation, Transaction],
  migrations: [],
  subscribers: [],
});
