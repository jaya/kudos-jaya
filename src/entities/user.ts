import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  // @ManyToOne(/* istanbul ignore next */ () => Installation, {
  //   nullable: true,
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'teamId' })
  // installation: Installation;

  @Column()
  teamId: string;

  @Column({ default: /* istanbul ignore next */ () => 'NOW()' })
  createdAt: Date;
}
