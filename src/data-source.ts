import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Recognition } from './entity/recognition';
import { Wallet } from './entity/wallet';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'testpassword',
  database: 'kudos-jaya',
  synchronize: true,
  logging: false,
  entities: [Wallet, Recognition],
  migrations: [],
  subscribers: [],
});
