export interface ProductOption {
  text: {
    type: string;
    text: string;
  };
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  logo: string;
  terms: string;
  minValue: number;
  maxValue: number;
  isActive: boolean;
}
