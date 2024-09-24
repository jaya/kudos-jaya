import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: string;

  @Column()
  balance: number;

  deposit() {}
  withdraw() {}
}
