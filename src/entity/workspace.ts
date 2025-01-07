import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Wallet } from '@/entity/wallet';
import { Recognition } from '@/entity/recognition';

@Entity()
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teamId: string;

  @Column()
  organization: string;

  @OneToMany(() => Wallet, (wallet) => wallet.workspace, { cascade: true })
  wallets: Wallet[];

  @OneToMany(() => Recognition, (recognition) => recognition.workspace, { cascade: true })
  recognitions: Recognition[];
}