import config from 'config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Installation } from './entity/installation';
import { Product } from './entity/product';
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
  entities: [Wallet, Recognition, Product, Installation],
  migrations: [],
  subscribers: [],
});
