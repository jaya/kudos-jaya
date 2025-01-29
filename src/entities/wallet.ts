import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { decimalTransformer } from '../utils/decimal-transformer';
import { Installation } from './installation';

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

  @ManyToOne(/* istanbul ignore next */ () => Installation, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teamId' })
  installation: Installation;

  @Column({ nullable: true })
  teamId: string | null;

  // @ManyToOne(/* istanbul ignore next */ () => User, {
  //   nullable: true,
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'ownerId' })
  // user: User;
}
