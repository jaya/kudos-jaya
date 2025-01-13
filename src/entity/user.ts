import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  tokenType: string;

  @Column()
  isEnterpriseInstall: boolean;

  @Column()
  appId: string;

  @Column()
  authVersion: string;

  @Column({ type: 'jsonb' })
  team: {
    id: string;
    name: string;
  };

  @Column({ type: 'jsonb' })
  enterprise: {
    id: string;
    name: string;
  };

  @Column({ type: 'jsonb' })
  user: {
    token: string;
    scopes: string[];
    id: string;
  };

  @Column({ type: 'jsonb' })
  bot: {
    scopes: string[];
    token: string;
    userId: string;
    id: string;
  };
}
