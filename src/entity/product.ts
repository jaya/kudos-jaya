import { decimalTransformer } from '@/utils/decimal-transformer';
import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  terms: string;

  @Column()
  logo: string;

  @Column({
    name: 'minValue',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: decimalTransformer,
  })
  minValue: number;

  @Column({
    name: 'maxValue',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: decimalTransformer,
  })
  maxValue: number;

  @UpdateDateColumn({ default: /* istanbul ignore next */ () => 'NOW()' })
  updatedAt: Date;
}
