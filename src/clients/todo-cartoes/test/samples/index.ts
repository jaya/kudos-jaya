import { TodoProductLineResponse } from '../../types';

export const giftCardResponse = {
  response_code: '201',
  response_message: 'Gift cards created',
  external_partner_load_id: 'jayatech203232',
  transaction_code: '2584e128-000c-42d4-a24e-19d25910febb',
  transaction_date: '2024-10-08',
  magic_link:
    'https://giftcard-hmg.todo.gift/_-Po7zh7pUB5kGXf9AgowAijgq-HIrIGdjYX',
  expire_date: null,
  card_number: '0000014281781487',
  card_password: '',
  redemption_code: '9490428162',
  metadata: [
    {
      name: 'pan',
      value: '0000014281781487',
    },
    {
      name: 'ddpId',
      value: 1004530751,
    },
    {
      name: 'prodType',
      value: 'pan_internal',
    },
    {
      name: 'snb',
      value: 14281781487,
    },
    {
      name: 'serialNum',
      value: 14281781487,
    },
    {
      name: 'pin',
      value: 9490428162,
    },
    {
      name: 'authID',
      value: 1325859857,
    },
  ],
};

export const giftCardErrorResponse = {
  error_code: '005',
  error_message:
    '"Error while generating. The order was created, but giftcards not activated. It won\'t generate a charge"',
  additional_data: {
    response: {
      identifier: 'OO-00000504-0004406323',
      total_value: '5.0',
      external_partner_load_id: 'jayatech11',
    },
  },
};

export const todoProductsResponse = {
  success: true,
  product_lines: [
    {
      id: 444,
      updated_at: '2025-11-12T10:16:08.089-03:00',
      categories: ['Varejo'],
      product_line_name: 'Shopee',
      identificator: 'SHOPEE',
      online_redemption: true,
      store_redemption: false,
      brand_name: 'SHOPEE',
      logo_url: 'https://cdn.todoincomm.com.br/01pr21v3fd7cmxo8vkdxmk52ce9q',
      product_line_description:
        'A Shopee é uma plataforma de e-commerce que conecta vendedores, marcas e consumidores, proporcionando uma experiência de compra fácil, segura e divertida. Com o Cartão Presente Shopee, você tem acesso a uma ampla gama de produtos, divididos em mais de 30 categorias, como Beleza, Casa \u0026 Decoração, PET, Moda, Tecnologia e muito mais. Aproveite ainda diversos benefícios que ajudam a economizar e a comodidade de fazer suas compras diretamente pelo aplicativo.',
      subscription: false,
      terms_and_conditions:
        '[Política] Termos e Condições – Vale Presente Shopee (Gift Cards) Antes de prosseguir com a compra, você, usuário, deve ler atentamente os termos e condições a seguir. Ao realizar a compra, você concorda e consente com os termos abaixo, que integram os Termos de Serviço da Shopee, reconhecendo estar sujeito às regras estabelecidas para compras do Vale Presente Shopee. Caso não concorde com qualquer uma das regras indicadas abaixo, não conclua sua compra.  Créditos Virtuais. O Vale Presente Shopee é um produto digital que possibilita ao comprador ter acesso a uma determinada quantidade de créditos a ser aplicada e utilizada em produtos comercializados na plataforma. Resgate e uso do produto. Os Créditos Virtuais são produtos de natureza exclusivamente digital, sendo fornecidos pela Shopee para serem resgatados e utilizados digitalmente na compra de produtos da plataforma, no prazo máximo a ser definido pelo respectivo comprador no ato da compra do vale-presente. O uso dos Créditos Virtuais atrelados a determinado Vale Presente podem ser utilizados somente em uma única compra. Assim, ainda que o valor da compra seja menor que a quantidade de Créditos Virtuais adquiridos naquele Vale Presente, referido Vale Presente Shopee será integralmente consumido, sem que haja qualquer saldo em favor do usuário. Após a conclusão do pagamento, não será mais possível solicitar reembolso ou cancelamento para o Vale Presente Shopee. Nenhum item físico será fornecido ou entregue a você em decorrência da compra do Vale Presente Shopee. Quaisquer produtos consumidos na plataforma, ainda que mediante uso do crédito contido no Vale Presente Shopee, são fornecidos sob exclusiva responsabilidade do vendedor e, portanto, está sujeito aos termos de uso, políticas de privacidade e demais especificações indicadas pelo vendedor. Nesse sentido, quaisquer questões, limitações ou problemas relacionados ao uso do produto são de responsabilidade do vendedor. Cancelamento ou Devoluções de Produtos Adquiridos com Créditos Virtuais. A Política de Reembolsos e Devoluções da Shopee será normalmente aplicada nos casos de cancelamento e/ou devolução do(s) produto(s) adquiridos com o uso de Vale Presente Shopee / Créditos Virtuais. Nestes casos, o reembolso ocorrerá por meio da devolução dos Créditos Virtuais gastos pelo usuário comprador na compra. Se a compra tiver sido parcialmente paga com outro método de pagamento (ex. cartão de crédito), o valor será proporcionalmente reembolsado ao comprador por meio do mesmo método.',
      steps_to_use:
        'O código pode ser aplicado diretamente durante a finalização da compra, garantindo uma experiência fluida e sem complicações.  Para resgatar, basta copiar e colar o código em “Meus Cupons” \u003e “Inserir código” no aplicativo Shopee.   Também é possível aplicar o código recebido por e-mail ou compartilhado via WhatsApp pelo remetente. Basta acessar “Cupom Shopee” \u003e Digite o código recebido \u003e Clique em “Aplicar” \u003e toque em “OK”. O valor será descontado automaticamente de sua compra. ',
      card_images: [
        {
          default: true,
          id: 'SHOPEE-3A4E130C8CB7',
          image_url:
            'https://cdn.todoincomm.com.br/spxtoa56bvy0vkbl3k8zgy3ro8uw',
        },
      ],
      products: [
        {
          card_identificator: '196742106794',
          updated_at: '2025-11-12T10:54:50.103-03:00',
          min_value: '20.0',
          max_value: '20.0',
          subscription_period: null,
          product_identifier: 'SHOPEE CORPORATIVO',
        },
        {
          card_identificator: '196742106787',
          updated_at: '2025-11-12T10:54:50.103-03:00',
          min_value: '10.0',
          max_value: '10.0',
          subscription_period: null,
          product_identifier: 'SHOPEE-DIGITAL-10',
        },
        {
          card_identificator: '196742106794',
          updated_at: '2025-11-12T10:54:50.103-03:00',
          min_value: '100.0',
          max_value: '100.0',
          subscription_period: null,
          product_identifier: 'SHOPEE-DIGITAL-100',
        },
        {
          card_identificator: '196742106817',
          updated_at: '2025-11-12T10:54:50.103-03:00',
          min_value: '50.0',
          max_value: '50.0',
          subscription_period: null,
          product_identifier: 'SHOPEE-DIGITAL-50',
        },
        {
          card_identificator: '196742106800',
          updated_at: '2025-11-12T10:54:50.103-03:00',
          min_value: '30.0',
          max_value: '30.0',
          subscription_period: null,
          product_identifier: 'SHOPEE-DIGITAL-30',
        },
        {
          card_identificator: '196742106824',
          updated_at: '2025-11-12T10:54:50.103-03:00',
          min_value: '100.0',
          max_value: '100.0',
          subscription_period: null,
          product_identifier: 'SHOPEE-DIGITAL-100',
        },
      ],
    },
    {
      id: 8,
      identificator: 'dummy-ddp-open-denom',
      online_redemption: true,
      store_redemption: false,
      categories: [],
      product_line_name: 'Dummy Product InComm DDP Open Denom',
      brand_name: 'InComm DDP Open Denom',
      logo_url:
        'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/product_line_configuration/plataform/logo/6/thumb_giftcard-todo-incomm-002.png',
      product_line_description:
        'About this Product Line Text About this Product Line Text About this Product Line Text About this Product Line Text About this Product Line Text About this Product Line Text About this Product Line Text',
      subscription: false,
      updated_at: '2023-11-27T16:40:54.770-03:00',
      terms_and_conditions: 'Terms & Conditions Dummy Product DDP',
      steps_to_use: 'Steps to Use',
      additional_data: 'field1: text_field1',
      card_images: [
        {
          image_url:
            'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/card_option/image/8/thumb_giftcard-todo-incomm-002.png',
          default: true,
          id: 'c-004-00008',
        },
      ],
      products: [
        {
          updated_at: '2021-09-21T09:24:09.597-03:00',
          card_identificator: '799366454854',
          min_value: '60.0',
          max_value: '600.0',
          product_identifier: 'CP-00006-00000028',
          subscription_period: null,
        },
        {
          updated_at: '2022-08-30T10:28:12.004-03:00',
          card_identificator: '799366454854',
          min_value: '150.0',
          max_value: '150.0',
          product_identifier: 'CP-00006-00000016',
          subscription_period: 'três meses',
        },
        {
          updated_at: '2022-08-30T10:28:12.009-03:00',
          card_identificator: '799366454854',
          min_value: '200.0',
          max_value: '200.0',
          product_identifier: 'CP-00006-00000027',
          subscription_period: null,
        },
        {
          updated_at: '2022-08-30T10:28:12.014-03:00',
          card_identificator: '799366454854',
          min_value: '80.0',
          max_value: '80.0',
          product_identifier: 'CP-00006-00000015',
          subscription_period: 'até 12/2023',
        },
        {
          updated_at: '2022-08-30T10:28:12.018-03:00',
          card_identificator: '799366454854',
          min_value: '90.0',
          max_value: '90.0',
          product_identifier: 'CP-00006-00000026',
          subscription_period: '5',
        },
        {
          updated_at: '2022-08-30T10:28:12.023-03:00',
          card_identificator: '799366454854',
          min_value: '100.0',
          max_value: '100.0',
          product_identifier: 'CP-00006-00000014',
          subscription_period: '6,5 semanas',
        },
      ],
    },
    {
      id: 7,
      identificator: 'dummy-local-code',
      online_redemption: true,
      store_redemption: false,
      categories: [],
      product_line_name: 'Dummy Local Code',
      brand_name: 'Staging Outback',
      logo_url:
        'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/product_line_configuration/plataform/logo/4/outback.png',
      product_line_description: '',
      subscription: false,
      updated_at: '2023-11-23T14:57:30.238-03:00',
      terms_and_conditions: '',
      steps_to_use: '',
      additional_data: '',
      card_images: [
        {
          image_url:
            'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/card_option/image/2/thumb_gift-card_virtual_aniver_V2.png',
          default: false,
          id: 'c-001-00002',
        },
        {
          image_url:
            'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/card_option/image/26/Sem_t%C3%ADtulo.png',
          default: false,
          id: 'c-001-00026',
        },
      ],
      products: [
        {
          updated_at: '2022-08-30T10:47:33.614-03:00',
          card_identificator: 'TODO TI TESTES CODE',
          min_value: '0.0',
          max_value: '1000.0',
          product_identifier: 'CP-00004-00000126',
          subscription_period: null,
        },
        {
          updated_at: '2022-08-30T10:47:33.621-03:00',
          card_identificator: 'TODO TI TESTES CODE',
          min_value: '100.0',
          max_value: '100.0',
          product_identifier: 'CP-00004-00000118',
          subscription_period: null,
        },
      ],
    },
    {
      id: 6,
      identificator: 'dummy-ddp-fixed-denom',
      online_redemption: true,
      store_redemption: false,
      categories: [],
      product_line_name: 'Dummy Product InComm DDP Fixed Denom',
      brand_name: 'InComm DDP Fixed Denom',
      logo_url:
        'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/product_line_configuration/plataform/logo/10/logo_todo_resize.jpg',
      product_line_description:
        'Plataforma de processamento de cartões presente integrada à sua loja física e virtual para criar, vender e receber seus gift cards de forma simples e incrível.',
      subscription: true,
      updated_at: '2024-07-08T21:53:30.332-03:00',
      terms_and_conditions: 'Terms & Conditions Dummy Product DDP Fixed Denom',
      steps_to_use:
        'O Gift Card pode ser utilizado em diversos serviços. O que o torna uma excelente opção de presente.\r\n\r\nInclusive, ele também se apresenta como uma oportunidade para as empresas que atuam em home office presentearem os seus colaboradores. Afinal, o Cartão Presente é uma opção prática e capaz de agradar a todos os gostos.',
      additional_data: '',
      card_images: [
        {
          image_url:
            'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/card_option/image/23/thumb_CartaoPresente_4.jpg',
          default: false,
          id: 'c-008-00023',
        },
        {
          image_url:
            'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/card_option/image/25/Sem_t%C3%ADtulo.png',
          default: false,
          id: 'c-008-00025',
        },
        {
          image_url:
            'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/card_option/image/13/thumb_CartaoPresente_1.jpg',
          default: false,
          id: 'c-008-00013',
        },
        {
          image_url:
            'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/card_option/image/22/thumb_CartaoPresente_3.jpg',
          default: false,
          id: 'c-008-00022',
        },
        {
          image_url:
            'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/card_option/image/21/thumb_CartaoPresente_2.jpg',
          default: false,
          id: 'c-008-00021',
        },
      ],
      products: [
        {
          updated_at: '2024-09-11T14:21:53.609-03:00',
          card_identificator: '799366454847',
          min_value: '60.0',
          max_value: '60.0',
          product_identifier: 'CP-00010-00000029',
          subscription_period: '30 dias',
        },
        {
          updated_at: '2024-09-11T14:22:13.331-03:00',
          card_identificator: '799366454847',
          min_value: '100.0',
          max_value: '100.0',
          product_identifier: 'CP-00010-00000128',
          subscription_period: '30 dias',
        },
        {
          updated_at: '2024-09-11T14:22:13.334-03:00',
          card_identificator: '799366454847',
          min_value: '30.0',
          max_value: '30.0',
          product_identifier: 'CP-00010-00000141',
          subscription_period: '30 dias',
        },
      ],
    },
    {
      id: 5,
      identificator: 'dummy-local-open-denom',
      online_redemption: true,
      store_redemption: true,
      categories: [],
      product_line_name: 'Dummy Qualita Open Denom',
      brand_name: 'Dummy Qualita Open Denom',
      logo_url:
        'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/product_line_configuration/plataform/logo/49/1000x600_logo_amaro_black__1_.png',
      product_line_description: '',
      subscription: false,
      updated_at: '2023-11-24T13:25:15.327-03:00',
      terms_and_conditions: 'rwar',
      steps_to_use: '',
      additional_data: '',
      card_images: [
        {
          image_url:
            'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/card_option/image/16/AMARO-TODO-Giftcard-3__2_.png',
          default: false,
          id: 'c-047-00016',
        },
        {
          image_url:
            'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/card_option/image/18/AMARO-TODO-Giftcard-2__1_.jpg',
          default: false,
          id: 'c-047-00018',
        },
        {
          image_url:
            'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/card_option/image/19/AMARO-TODO-Giftcard-4.jpg',
          default: false,
          id: 'c-047-00019',
        },
        {
          image_url:
            'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/card_option/image/20/AMARO-TODO-Giftcard-5.jpg',
          default: false,
          id: 'c-047-00020',
        },
        {
          image_url:
            'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/card_option/image/27/Sem_t%C3%ADtulo.png',
          default: false,
          id: 'c-047-00027',
        },
      ],
      products: [
        {
          updated_at: '2022-08-30T10:33:36.543-03:00',
          card_identificator: 'TODO TI TESTES',
          min_value: '0.0',
          max_value: '1000.0',
          product_identifier: 'CP-00049-00000127',
          subscription_period: null,
        },
        {
          updated_at: '2024-09-10T10:59:45.069-03:00',
          card_identificator: 'TODO TI TESTES',
          min_value: '10.0',
          max_value: '10.0',
          product_identifier: 'CP-00049-00000124',
          subscription_period: null,
        },
        {
          updated_at: '2024-09-10T10:59:45.072-03:00',
          card_identificator: 'TODO TI TESTES',
          min_value: '50.0',
          max_value: '50.0',
          product_identifier: 'CP-00049-00000137',
          subscription_period: null,
        },
        {
          updated_at: '2024-09-10T10:59:45.075-03:00',
          card_identificator: 'TODO TI TESTES',
          min_value: '200.0',
          max_value: '200.0',
          product_identifier: 'CP-00049-00000138',
          subscription_period: null,
        },
        {
          updated_at: '2024-09-10T10:59:45.077-03:00',
          card_identificator: 'TODO TI TESTES',
          min_value: '150.0',
          max_value: '150.0',
          product_identifier: 'CP-00049-00000139',
          subscription_period: null,
        },
        {
          updated_at: '2024-09-10T10:59:45.080-03:00',
          card_identificator: 'TODO TI TESTES',
          min_value: '400.0',
          max_value: '400.0',
          product_identifier: 'CP-00049-00000140',
          subscription_period: null,
        },
      ],
    },
    {
      id: 4,
      identificator: 'GIFT_CARD_DIGITAL_PSN_GT7',
      online_redemption: true,
      store_redemption: true,
      categories: [],
      product_line_name: 'Teste PSN',
      brand_name: 'PSN',
      logo_url:
        'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/product_line_configuration/plataform/logo/48/download.png',
      product_line_description: '',
      subscription: false,
      updated_at: '2024-02-08T18:58:31.687-03:00',
      terms_and_conditions: '',
      steps_to_use: '',
      additional_data: '',
      card_images: [],
      products: [
        {
          updated_at: '2024-02-08T18:58:31.694-03:00',
          card_identificator: '799366436775',
          min_value: '10.0',
          max_value: '10.0',
          product_identifier: 'CP-00048-00000121',
          subscription_period: null,
        },
      ],
    },
    {
      id: 3,
      identificator: null,
      online_redemption: null,
      store_redemption: null,
      categories: [],
      product_line_name: 'Outback',
      brand_name: null,
      logo_url: null,
      product_line_description: null,
      subscription: null,
      updated_at: null,
      terms_and_conditions: null,
      steps_to_use: null,
      additional_data: {},
      card_images: [],
      products: [],
    },
    {
      id: 2,
      identificator: 'Vivara',
      online_redemption: true,
      store_redemption: true,
      categories: [],
      subscription: null,
      terms_and_conditions: null,
      updated_at: null,
      additional_data: null,
      product_line_name: 'Teste Vivara',
      brand_name: 'Vivara',
      logo_url: 'http://mylogo.com',
      product_line_description: null,
      steps_to_use: '',
      card_images: [],
      products: [],
    },
    {
      id: 1,
      identificator: 'another_company',
      online_redemption: true,
      store_redemption: true,
      categories: [],
      subscription: null,
      terms_and_conditions: null,
      updated_at: null,
      additional_data: null,
      product_line_name: 'Company A',
      brand_name: 'Company A',
      logo_url: 'http://mylogo.com',
      product_line_description: null,
      steps_to_use: '',
      card_images: [],
      products: [
        {
          updated_at: '2024-09-10T10:59:45.072-03:00',
          card_identificator: 'TODO TI TESTES',
          min_value: null,
          max_value: null,
          product_identifier: 'CP-00049-00000137',
          subscription_period: null,
        },
      ],
    },
  ],
} satisfies TodoProductLineResponse;

export const fetchProductsResponse = [
  {
    id: 'TODO TI TESTES',
    name: 'Company A',
    description: 'Company A',
    terms: 'Os valores disponíveis para este produto são: NaN',
    logo: 'http://mylogo.com',
    minValue: 1,
    maxValue: 1,
    isActive: true,
  },
  {
    id: 'TODO TI TESTES',
    name: 'Dummy Qualita Open Denom',
    description: 'Dummy Qualita Open Denom',
    terms:
      'Os valores disponíveis para este produto são: 0 - 10 - 50 - 150 - 200 - 400 - 1000',
    logo: 'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/product_line_configuration/plataform/logo/49/1000x600_logo_amaro_black__1_.png',
    minValue: 1,
    maxValue: 1000,
    isActive: true,
  },
  {
    id: '799366454847',
    name: 'InComm DDP Fixed Denom',
    description:
      'Plataforma de processamento de cartões presente integrada à sua loja física e virtual para criar, vender e receber seus gift cards de forma simples e incrível.',

    terms: 'Os valores disponíveis para este produto são: 30 - 60 - 100',
    logo: 'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/product_line_configuration/plataform/logo/10/logo_todo_resize.jpg',
    minValue: 30,
    maxValue: 100,
    isActive: true,
  },
  {
    id: '799366454854',
    name: 'InComm DDP Open Denom',
    description:
      'About this Product Line Text About this Product Line Text About this Product Line Text About this Product Line Text About this Product Line Text About this Product Line Text About this Product Line...',
    terms:
      'Os valores disponíveis para este produto são: 60 - 80 - 90 - 100 - 150 - 200 - 600',
    logo: 'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/product_line_configuration/plataform/logo/6/thumb_giftcard-todo-incomm-002.png',
    minValue: 60,
    maxValue: 600,
    isActive: true,
  },
  {
    id: '799366436775',
    name: 'PSN',
    description: 'PSN',
    terms: 'Os valores disponíveis para este produto são: 10',
    logo: 'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/product_line_configuration/plataform/logo/48/download.png',
    minValue: 10,
    maxValue: 10,
    isActive: true,
  },
  {
    id: 'TODO TI TESTES CODE',
    name: 'Staging Outback',
    description: 'Staging Outback',
    terms: 'Os valores disponíveis para este produto são: 0 - 100 - 1000',
    logo: 'https://vendas-corp-teste.s3.sa-east-1.amazonaws.com/uploads/product_line_configuration/plataform/logo/4/outback.png',
    minValue: 1,
    maxValue: 1000,
    isActive: true,
  },
];
