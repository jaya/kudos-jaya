import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Workspace } from '@/entity/workspace';

@Entity()
export class Recognition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fromId: string;

  @Column()
  fromName: string;

  @Column()
  toId: string;

  @Column()
  toName: string;

  @Column({ nullable: true })
  description: string | null;

  @Column({ default: () => 'NOW()' })
  createdAt: Date;

  @ManyToOne(() => Workspace, (workspace) => workspace.wallets, { onDelete: "CASCADE" })
  workspace: Workspace;
}
