import { Column, Entity, PrimaryColumn } from 'typeorm';
import { decimalTransformer } from '../utils/decimal-transformer';

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

  @Column({
    name: 'defaultAmount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 100.0,
    transformer: decimalTransformer,
  })
  defaultAmount: number;

  @Column({ default: /* istanbul ignore next */ () => 'NOW()' })
  createdAt: Date;

  @Column({ nullable: true })
  companyValues: string;

  @Column({ nullable: true })
  clientApiKey: string;

  @Column({ type: 'int', nullable: true, default: null })
  monthlyKudosLimit: number | null;
}
