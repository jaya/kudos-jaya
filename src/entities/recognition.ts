import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Installation } from './installation';
import { User } from './user';

@Entity()
@Unique(['id', 'teamId'])
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

  @Column({ default: /* istanbul ignore next */ () => 'NOW()' })
  createdAt: Date;

  @ManyToOne(/* istanbul ignore next */ () => Installation, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teamId' })
  installation: Installation;

  @Column({ nullable: true })
  teamId: string | null;

  @ManyToOne(/* istanbul ignore next */ () => User, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'fromId', referencedColumnName: 'id' },
    { name: 'teamId', referencedColumnName: 'teamId' },
  ])
  fromUser: User;

  @ManyToOne(/* istanbul ignore next */ () => User, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'toId', referencedColumnName: 'id' },
    { name: 'teamId', referencedColumnName: 'teamId' },
  ])
  toUser: User;

  @Column({ nullable: true })
  slackMessageId: string | null;

  @Column({ nullable: true })
  slackChannelId: string | null;
}
