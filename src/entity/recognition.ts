import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Installation } from './installation';

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

  @ManyToOne(() => Installation, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  installation: Installation;

  @Column({ nullable: true })
  teamId: string | null;
}
