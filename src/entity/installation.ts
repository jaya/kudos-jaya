import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Installation {
  @PrimaryColumn()
  teamId: string;

  @Column()
  teamName: string;

  @Column()
  tokenType: string;

  @Column()
  isEnterpriseInstall: boolean;

  @Column()
  appId: string;

  @Column()
  authVersion: string;

  @Column({ type: 'jsonb', nullable: true })
  enterprise: {
    id: string | null;
    name: string | null;
  };

  @Column({ type: 'jsonb' })
  bot: {
    scopes: string[];
    token: string;
    userId: string;
    id: string;
  };

  @Column({ nullable: true })
  giftCardApiToken: string;

  @Column({ nullable: true })
  defaultRecognitionChannel: string;

  @Column({ default: () => 'NOW()' })
  createdAt: Date;
}
