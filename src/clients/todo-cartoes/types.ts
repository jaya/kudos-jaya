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

export type ProductLine = {
  id: number;
  identificator: string | null;
  online_redemption: boolean | null;
  store_redemption: boolean | null;
  categories: string[] | null;
  product_line_name: string;
  brand_name: string | null;
  logo_url: string | null;
  product_line_description: string | null;
  subscription: boolean;
  updated_at: string | null;
  terms_and_conditions: string | null;
  steps_to_use: string | null;
  additional_data?: object | string;
  card_images: CardImage[];
  products: Product[];
};

export type TodoProductLineResponse = {
  success: boolean;
  product_lines: ProductLine[];
};

export type EmitGiftCardPayload = {
  /** Identificador de tipo de produto  - Obtido no endpoint /product_lines */
  card_identificator: string;
  /** CNPJ da loja que está originando a venda deste Gift Card */
  store_cnpj?: string;
  /** ID da plataforma do parceiro, não serão aceitos valores duplicados neste campo*/
  external_partner_load_id: string;
  /** Valor do gift card*/
  total: number;
  /** ID da imagem do cartão que deverá ser utilizado em todas comunicações com o cliente. Caso não seja enviado, será utilizado o padrão */
  card_image_id?: string;
};

type Metadata = {
  name: string;
  value: string | number;
};

export type TodoGiftCardResponse = {
  response_code: string;
  response_message: string;
  external_partner_load_id: string;
  transaction_code: string;
  transaction_date: string;
  magic_link: string;
  expire_date: string | null;
  card_number: string;
  card_password: string;
  redemption_code: string;
  metadata: Metadata[];
};
