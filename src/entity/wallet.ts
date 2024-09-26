import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { decimalTransformer } from '../utils/decimal-transformer';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: string;

  @Column({
    name: 'balance',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: decimalTransformer,
  })
  balance: number;

  deposit() {}
  withdraw() {}
}
