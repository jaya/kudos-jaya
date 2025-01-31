export interface BaseProduct {
  id: string;
  name: string;
  logo: string;
  description: string;
  terms: string;
  minValue: number;
  maxValue: number;
  updatedAt?: Date;
}

export interface IProduct {
  products: BaseProduct[];
}
