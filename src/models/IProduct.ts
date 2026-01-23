export interface BaseProduct {
  id: string;
  name: string;
  logo: string;
  description: string;
  terms: string;
  minValue: number;
  maxValue: number;
  updatedAt?: Date;
  isActive: boolean;
}

export interface IProduct {
  products: BaseProduct[];
}
