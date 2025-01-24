import { decimalTransformer } from '@/utils/decimal-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Installation } from './installation';
import { Product } from './product';
import { Wallet } from './wallet';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teamId: string;

  @Column()
  walletId: number;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: decimalTransformer,
  })
  amount: number;

  @Column()
  productId: string;

  @Column({ default: () => 'NOW()' })
  createdAt: Date;

  @ManyToOne(() => Installation, { nullable: false, onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'teamId' })
  installation: Installation;

  @ManyToOne(() => Wallet, { nullable: false, onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product;
}
