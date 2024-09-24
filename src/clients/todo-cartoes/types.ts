type CardImage = {
  image_url: string;
  default: boolean;
  id: string;
};
type Product = {
  updated_at: string;
  card_identificator: string;
  min_value: string;
  max_value: string;
  product_identifier: string;
  subscription_period: string | null;
};

type ProductLine = {
  identificator: string;
  online_redemption: boolean;
  store_redemption: boolean;
  categories: string[];
  product_line_name: string;
  brand_name: string;
  logo_url: string;
  product_line_description: string;
  subscription: string;
  updated_at: string;
  terms_and_conditions: string;
  steps_to_use: string;
  additional_data: string;
  card_images: CardImage[];
  products: Product[];
};

export type TodoProductLineResponse = {
  success: boolean;
  product_lines: ProductLine[];
};
