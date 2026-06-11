import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { Installation } from './installation';

@Entity()
@Unique(['id', 'teamId'])
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @ManyToOne(/* istanbul ignore next */ () => Installation, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teamId' })
  installation: Installation;

  @Column()
  teamId: string;

  @Column({ default: /* istanbul ignore next */ () => 'NOW()' })
  createdAt: Date;

  @Column({ nullable: true })
  isAuditor: boolean;

  @Column({ default: /* istanbul ignore next */ true })
  isActive: boolean;
}
