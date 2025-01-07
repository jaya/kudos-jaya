import { decimalTransformer } from '@/utils/decimal-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Workspace } from '@/entity/workspace';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.wallets, { onDelete: "CASCADE" })
  workspace: Workspace;

  @Column({
    name: 'balance',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: decimalTransformer,
  })
  balance: number;
}
