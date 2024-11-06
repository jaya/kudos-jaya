import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
