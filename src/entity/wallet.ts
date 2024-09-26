import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  balance: number;

  deposit() {}
  withdraw() {}
}
