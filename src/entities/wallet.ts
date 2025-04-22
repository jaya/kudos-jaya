import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { decimalTransformer } from '../utils/decimal-transformer';
import { Installation } from './installation';
import { User } from './user';

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

  @OneToOne(
    /* istanbul ignore next */ () => User,
    /* istanbul ignore next */ (user) => user.id,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn([{ name: 'ownerId', referencedColumnName: 'id' }])
  user: User | null;
}
