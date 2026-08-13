# API de Parceiros Homologação - Nova Documentação

Fonte: https://documenter.getpostman.com/view/17122909/2s9YRFVA9Z

## Sobre a Todo

A Todo, uma empresa do grupo InComm Payments, é especializada na criação e operação de cartões-presente para grandes varejistas no Brasil. Oferecemos a infraestrutura tecnológica e a distribuição comercial para que as empresas possam vender e resgatar cartões presente em suas lojas físicas e online.

Atualmente, contamos com um portfólio de mais de 70 varejistas em todo o país, incluindo nomes como Riachuelo, Outback, Centauro, Nike, Tok&Stok, entre outros. Nosso principal objetivo é impulsionar resultados positivos para os lojistas por meio de uma experiência excepcional para o cliente final!

## Sobre o Projeto de Integração com a Todo

Esta documentação tem por objetivo trazer as especificações do endpoint de emissão de vales virtuais por parceiros de negócio da Todo InComm.

O endpoint de emissão de vale virtual é o endpoint principal desta documentação e é responsável por criar e ativar um cartão utilizando o valor enviado por parâmetro. É possível gerar apenas 1 vale virtual por chamada, pois este é um endpoint destinado a operações que buscam integrações para entregar vales virtuais diretamente para o cliente final através de plataformas externas.

Na entrada, é necessário enviar um id interno do parceiros (aqui referenciado por `external_partner_load_id`) este ID será armazenado em uma tabela de conciliação e será sempre único para o parceiro para garantir que não hajam duplicidades e facilite as operações de suporte tanto do parceiro quando da Todo. Sugerimos que o parceiro tenha um contador ou utilize um ID único já existente na sua plataforma.

No retorno, o Parceiro irá receber os campos `transaction_code` e `transaction_date`, que são as chaves primárias das tabelas de transações.

## Informações Técnicas

### Time Out / Reversal / Retrial

Recomendamos um Timeout/Threshold de 35 segundos entre o sistema integrado e a Todo. Se o sistema integrado enviar um request para a Todo e não receber um retorno dentro do período de timeout, o sistema integrado deve, automaticamente iniciar um processo de consulta da transação realizada com o endpoint de Consulta de Pedidos usando o `external_partner_id`. O sistema integrado deve considerar que a Todo realizou o processo requisitado corretamente, porém a resposta foi perdida no caminho.

*Recomendamos chamadas com espaçamento de tempo incremental até chegar em 24h, quando o parceiro pode entender o pedido como não realizado.*

Caso o parceiro tenha um fluxo que não permita um recebimento assíncrono do código, é possível realizar o cancelamento do código através do endpoint de cancelamento descrito nessa documentação. Esse processo pode, e deve, ocorrer em paralelo com a retentativa da request inicial, porém deve ser considerada uma request nova com um novo `request_id`.

Caso o sistema integrado não receba nenhuma resposta desse processo depois das 24h de chamadas a transação deve ser enviada em um Exception file que deve ser enviado para a InComm no final do mês.

### Metadados

Algumas transações retornam metadados no response. Esses metadados são informações extras das transações que podem ser utilizadas para determinadas funções de integrações específicas. No entanto, todas as transações que retornam o campo `Auth_ID` (ID de Autorização) precisam que essa informação seja salva para questões de conciliação das transações. Além disso, o sistema também precisa salvar o `request_id` das transações para essa mesma conciliação.

## Autenticação da API

A autenticação da API ocorre com o Bearer Token. Essa informação será passada pelo time de integrações da Todo para o time do sistema integrado.

O Token é fixo na integração, pois não há processo de atualização, exceto em casos de brechas de segurança. Em caso de brechas de segurança com o Token, o time da Todo precisa ser informado para que o Token seja atualizado.

Todas as solicitações de API devem ser feitas por HTTPS. As chamadas feitas por HTTP simples falharão. As solicitações de API sem autenticação também falharão. Com exceção do Ping, todos os endpoints da API tem autenticação. A falha em autenticar corretamente uma solicitação da API resultará em uma resposta `401 Unauthorized`.

## Fluxo de Homologação com a Todo

### Matriz de Suporte do Integrador (N1, N2, N3 com SLAs de resposta)

É esperado que o time do sistema integrado envie a matriz suporte para abertura de chamado e escalada em três níveis para que seja possível contatar o time responsável em caso de problemas na integração.

### Teste Assistido + Revisão Experiência

Após entrega do desenvolvimento da integração em homologação será agendada um teste assistido no qual o time de projetos da Todo acompanhará o time do sistema integrado no fluxo do caminho feliz da integração e o erros mais comuns. Além disso, o time da Todo irá validar também o fluxo da experiência do usuário do sistema integrado.

### Documentação de Homologação

Após a finalização do escopo de desenvolvimento será enviado um documento de Escopo de Trabalho da integração para formalização da integração que está sendo desenvolvida, os endpoints utilizados e as limitações do projeto (pontos não integrados). Posterior ao desenvolvimento, será anexada nessa documentação também um vídeo da experiência do usuário que poderá ser gravada na reunião do Teste Assistido. Dessa forma, a Todo sempre poderá apoiar o sistema integrado no suporte aos varejistas utilizando a integração.

## Códigos de Erro

| Código do Erro | Status HTTP | Descrição | Mensagem Exemplo |
|---|---|---|---|
| 001 | 500 | Um erro inesperado aconteceu durante a request. | "Something Went Wrong!" |
| 002 | 400 | Um ou mais parâmetros faltando na request. | "Missing required param: external_partner_load_id" |
| 003 | 422 | O objeto que está sendo criado não é válido. Verificar os parâmetros da request. | "external_partner_load_id must be unique"; "Object validation failed" |
| 004 | 404 | O objeto não foi localizado. Verificar os parâmetros da request. | "Card identificator or price unavailable for this gift card"; "Transaction not found"; "Product unavailable"; "Object not found" |
| 005 | 500 | Ocorreu um problema na comunicação com um serviço externo. Tente novamente mais tarde. | "Something Went Wrong!" |
| 006 | 422 | Ocorreu um erro. Verificar os parâmetros da request. | "Failed to create order. Please check total" |
| 007 | 422 | O valor não está disponível para esse cartão presente. | "Price unavailable for this gift card" |
| 008 | 400 | Ocorreu um erro ao cancelar o pedido. Verificar se o pedido já está cancelado ou se existe um cartão válido para cancelar. | "This order does not have valid gift cards to cancel"; "Order already canceled" |
| 009 | 500 | Limite do usuário atingido. Favor entrar em contato com o suporte da Todo | "User has no limit left" |

---

## Endpoints

### GET Linhas de Produto

`https://corporate-api-gateway.uat.todoincomm.com.br/uat/v2/product_lines`

**Explicação do Endpoint:**

Esse é o endpoint de integração de catálogo (Linhas de Produto). Sua função é listar todas das informações necessárias para o parceiro criar seu catálogo com todas as marcas da Todo e criar um template para disponibilizar para seus usuários os Gift Cards adquiridos.

Recomendamos que a aplicação do parceiro tenha uma rotina de atualização semanal com base no campo `updated_at` de cada uma das linhas de produto. Dessa forma, sempre que houver alguma alteração, a aplicação estará atualizada.

Os conteúdo deste endpoint são separados por Product Lines, ou seja, linhas de produtos principais que podem ter sub-produtos. Como, por exemplo, PlayStation Plus (Product Line) e PlayStation Plus de R$ 30,00 (Product). O identificador que precisa ser chamado é sempre específico no produto que está sendo gerado e ativado.

**Headers**

| Header | Valor |
|---|---|
| Content-Type | application/json |
| Authorization | Token \<seu token\> |

**Request:** Este endpoint não deve receber um body.

**Response:**

```json
{
  "success": "boolean",
  "product_lines": [
    {
      "brand_name": "string",
      "product_line_name": "string",
      "product_line_description": "string",
      "logo_url": "string",
      "online_redemption": "boolean",
      "store_redemption": "boolean",
      "terms_and_conditions": "string",
      "updated_at": "string",
      "identificator": "string",
      "subscription": "boolean",
      "steps_to_use": "string",
      "additional_data": {"array"},
      "card_images": [
        { "image_url": "string", "default": "boolean", "id": "string" },
        { "image_url": "string", "default": "boolean", "id": "string" },
        { "image_url": "string", "default": "boolean", "id": "string" }
      ],
      "products": [
        {
          "card_identificator": "string",
          "min_value": "decimal",
          "max_value": "decimal",
          "product_identifier": "string",
          "subscription_period": "string",
          "updated_at": "string"
        },
        {
          "card_identificator": "string",
          "min_value": "decimal",
          "max_value": "decimal",
          "product_identifier": "string",
          "subscription_period": "string",
          "updated_at": "string"
        }
      ]
    }
  ]
}
```

**Linhas de Produto (campos)**

| Nome | Tipo | Descrição |
|---|---|---|
| brand_name | string | Nome da Marca |
| product_line_name | string | Descrição da marca |
| product_line_description | string | Descrição da marca |
| logo_url | string | Logo da Marca Tamanho Padrão |
| online_redemption | boolean | Aceito em loja online |
| store_redemption | boolean | Aceito em lojas físicas |
| terms_and_conditions | string | Termos e condições de uso |
| identificator | string | Identificador da linha de produtos |
| updated_at | datetime | Datetime da última atualização da linha de produtos |
| steps_to_use | string | Passo a Passo para uso |
| subscription | boolean | Indica se é um produto de assinatura |
| additional_data | array | Site do lojista |

**Card Images**

| Nome | Tipo | Descrição |
|---|---|---|
| image_url | string | URL da Arte do Cartão |
| default | boolean | Define se a arte em questão é a padrão da linha de produto |
| id | string | Identificador da arte em questão |

**Products**

| Nome | Tipo | Descrição |
|---|---|---|
| card_identificator | string | Identificador do produto que deve ser utilizado na geração do Gift Card |
| min_value | string | Valor mínimo |
| max_value | string | Valor Máximo |
| subscription_period | string | Período de assinatura do produto |
| updated_at | datetime | Datetime da última atualização do produto |
| product_identifier | string | Identificador auxiliar, não deve ser utilizado na chamada de geração |

**Example Request**

```bash
curl --location 'https://corporate-api-gateway.uat.todoincomm.com.br/uat/v2/product_lines' \
--header 'Content-Type: application/json' \
--header 'Authorization: Token <seu token>' \
--data ''
```

**Example Response (200 OK)**

```json
{
  "success": true,
  "product_lines": [
    {
      "identificator": "55",
      "online_redemption": false,
      "store_redemption": true,
      "product_line_name": "Todo an InComm Payments Company",
      "brand_name": "Todo an InComm Payments Company",
      "logo_url": "URL",
      "product_line_description": "Sobre o produto",
      "subscription": false,
      "updated_at": "2021-10-15T20:02:35.620-03:00",
      "terms_and_conditions": "Esses são os nossos Termos e Condições de Serviço.",
      "steps_to_use": "Texto de como utilizar o produto.",
      "additional_data": "Dados adicionais.",
      "card_images": [
        { "image_url": "URL", "default": true, "id": "c-005-00009" }
      ],
      "products": [
        {
          "updated_at": "2021-09-21T14:56:35.980-03:00",
          "card_identificator": "CARD ID",
          "min_value": "5.0",
          "max_value": "5.0",
          "product_identifier": "CP-00007-00000017",
          "subscription_period": null
        }
      ]
    }
  ]
}
```

---

### GET Consulta do Pedido

`https://corporate-api-gateway.uat.todoincomm.com.br/uat/v2/orders/:external_partner_load_id`

**Explicação do Endpoint:**

Esse endpoint permite que o parceiro consulte um pedido realizado com base no seu ID. Essa chamada sempre irá retornar o mesmo retorno da transação original (caso ela tenha sido bem sucedida) ou retornar que não há chamada com o ID informado.

O ID é o campo `external_partner_load_id` informado na emissão do gift card.

**Headers**

| Header | Valor |
|---|---|
| Content-Type | application/json |
| Authorization | Token \<seu token\> |

**Path Variables**

| Variável | Descrição |
|---|---|
| external_partner_load_id | ID informado na emissão do gift card |

**Request:** Este endpoint não deve receber um body.

**Response:** Essa chamada sempre irá retornar o mesmo retorno da transação original (caso ela tenha sido bem sucedida) ou retornar que não há chamada com o ID informado.

**Example Request**

```bash
curl --location 'https://corporate-api-gateway.uat.todoincomm.com.br/uat/v2/orders/:external_partner_load_id' \
--header 'Content-Type: application/json' \
--header 'Authorization: Token <seu token>' \
--data ''
```

**Example Response**

```json
{
  "item": {
    "transaction_code": "4ebcab2d-b5c1-4c08-b425-afcf91ac8ec9",
    "transaction_date": "2022-01-20",
    "magic_link": "https://giftcard-hmg.todo.gift/MnrdJTar6sjp71KqFY3EE2tWiF-zqJgHcefB",
    "card_number": "0000014281767635",
    "card_password": "",
    "redemption_code": "9443315754",
    "expire_date": null,
    "external_partner_load_id": "1",
    "metadata": [
      { "name": "ddpId", "value": 123456 },
      { "name": "prodType", "value": "pin_realtime" },
      { "name": "serialNum", "value": 654321 },
      { "name": "pin", "value": "123ABC" },
      { "name": "vsn", "value": "ABC123" }
    ]
  }
}
```

---

### POST Emissão Gift Cards

`https://corporate-api-gateway.uat.todoincomm.com.br/uat/v2/orders`

**Explicação da Transação:**

As transações de Ativação de Cartões Digitais são referentes a venda dos cartões digitais nas lojas online do varejista. Esses cartões são vendidos através da integração com as APIs Emissão de Giftcards entre o sistema de PDV do varejista e o sistema da Todo.

O endpoint de emissão de Gift Cards é responsável por criar e ativar um Gift Card utilizando o valor enviado por parâmetro. É possível gerar apenas 1 Gift Card por chamada, pois este é um endpoint destinado a operações que buscam integrações para entregar Gift Cards diretamente para o cliente final através de plataformas externas. Caso seja necessário gerar múltiplos Gift Cards é preciso chamar o endpoint diversas vezes.

O processamento do pagamento dos cartões é responsabilidade do sistema integrado. Ou seja, a Todo irá gerar todos os cartões que o sistema integrado solicitar através da integração. A Todo não consegue controlar se o cartão foi pago de fato no sistema, pois isso é responsabilidade do próprio sistema integrado.

Temos dois tipos de cartões que poderão ser ativados nos sistemas integrados: cartões que são resgatados com número do cartão e senha, e cartões que são resgatados com o `redemption_code` (PIN). Essa especificidade muda as informações que precisam ser enviadas para o comprador do cartão de acordo com o response da emissão.

Os cartões que são resgatados com número do cartão e senha terão a senha no campo `password` e o campo `redemption_code` vazio. Já os cartões que são resgatados com `redemption_code` terão esse campo preenchido no response e o campo `password` vazio.

Na entrada, é necessário enviar um id interno do parceiros (aqui referenciado por `external_partner_load_id`) este ID será armazenado em uma tabela de conciliação e será sempre único, garantindo que não hajam duplicidades e facilitando as operações de suporte tanto do parceiro quando da Todo. Sugerimos que o parceiro tenha um contador ou utilize um ID único já existente na sua plataforma.

**LEMBRE-SE que:** este ID será usado posteriormente em rotas (para consulta ou cancelamentos).

O campo `card_identificator` é o identificador do tipo de cartão que será emitido. Esse campo varia dependendo da marca e do valor do gift card. No exemplo abaixo, está sendo usado o `card_identificator` `799366454854` - um cartão dummy de valor aberto entre R$60 e R$600.

No retorno, o Parceiro irá receber os campos `transaction_code` e `transaction_date`, que são as chaves primárias das tabelas de transações.

#### Contábil/Fiscal

**Registro Contábil**

A aquisição de cartão-presente constitui adiantamento de crédito por parte do cliente, com fins a uso futuro desse crédito, não se tratando de venda de mercadoria.

**Prática Fiscal**

O cartão presente não constitui venda de mercadoria, sendo mera antecipação de recursos, de forma que não é por si fato gerador de tributo. Dessa forma, a venda de cartão presente deve ser acompanhada de documento não fiscal (recibo não fiscal) e não de Nota Fiscal de Venda. Entende-se, portanto, que o cartão presente é adiantamento, de forma que a tributação somente deverá ser realizada integralmente quando da utilização dele como forma de pagamento. Por uma questão fiscal, não é possível lançar a venda de cartões presente juntamente com outros produtos no mesmo documento, pois a venda de cartões não tem emissão de Nota Fiscal. Portanto, caso o sistema integrado queira vender produtos ou serviços juntamente com a venda de cartões presentes é necessária a emissão de dois documentos da venda com os valores separados em Nota Fiscal (para a venda de produto ou serviço) e Documento Não-fiscal (para a venda de cartão presente).

#### Pontos Obrigatórios

**Ativação Posterior a Cobrança (Autorização Post-tender)**

É necessário que o endpoint de ativação seja chamado apenas após a confirmação do pagamento pelo cartão. Essa ativação posterior a aprovação do pagamento reduz os riscos de fraude na loja e a quantidade de cancelamentos de ativação por recusa de pagamento.

**Emissão de Recibo não Fiscal**

O recibo não fiscal é um ponto obrigatório na venda de cartões presentes, pois ele é a única prova física da venda do cartão presente para o consumidor. Esse recibo não é um documento fiscal, pois a venda de cartão presente não consiste em uma venda de produto ou serviço tributável no momento da venda.

Informações obrigatórias no recibo:
- Descrição do Cartão
- Valor Pago Pelo Cartão
- NSU da Transação
- Data e Hora da Transação
- Número do Cartão Vendido (primeiros e últimos dígitos), ex.: 504161*12345

**Estorno de Pagamento**

É obrigatório que o estorno de uma compra de cartão esteja atrelado ao estorno do pagamento por esse cartão na mesma forma de pagamento realizada inicialmente, sem esse vínculo, pode haver problemas de conciliação dos dados (ter o pagamento e o cartão estar cancelado).

**Casos de Negativa de Ativação**

Podem ocorrer casos em que a pré-autorização retornou sucesso e o sistema integrado seguiu com a ativação, porém a ativação retornou erro caso algum dos parâmetros sejam alterados no momento da ativação em si. Caso isso ocorra, é necessário estornar o pagamento realizado por aquele cartão automaticamente, para tentar uma nova ativação.

#### Melhores Práticas

**Venda de Cartões Presentes em Conjunto com Produtos/Serviços**

Entende-se que para uma melhor experiência de compra do cartão presente, caso o cliente esteja realizando uma compra de produtos ou serviços e queira adicionar um cartão presente seria importante que essa compra fosse feita com o mesmo pagamento e o próprio sistema integrado deveria separar os dois valores em documentos separados: Produto ou Serviço na Nota Fiscal e Cartão Presente no Recibo não Fiscal. Contudo, é possível fazer a venda separadamente, não possibilitando vender Cartões Presentes em conjunto com Produtos e Serviços.

**Venda de Múltiplos Cartões**

A venda de cartões deve considerar tanto a possibilidade de venda de um único cartão quanto a venda de múltiplos cartões em um mesmo cupom. A cada número inserido, o valor a ser pago pelo cliente vai sendo somado ao valor a ser pago pelo pedido.

**Parcelamento de Venda de Cartões**

Normalmente não é possível parcelar a compra de cartão presente, pois os repasses são realizados no valor total da carga para a Todo, no caso de gestão do passivo pela Todo. Caso o varejo opte pela possibilidade de parcelamento da compra dos cartões, o mesmo precisa arcar com as taxas e diferença de recebimentos em relação aos repasses realizados para a Todo.

#### Fluxo de Testes

O time de integrações da Todo irá fornecer a quantidade de cartões necessária para a realização dos testes desse endpoint.

1. Gerar um cartão com número do cartão e senha
2. Gerar um cartão com redemption_code

**Headers**

| Header | Valor |
|---|---|
| Content-Type | application/json |
| Authorization | Token \<seu token\> |

**Request Body**

```json
{
  "card_identificator": "799366454854",
  "store_cnpj": "21647164000185",
  "external_partner_load_id": "1",
  "total": 190.11,
  "card_image_id": "1"
}
```

| Campo | Tipo | Observações | Obrigatório |
|---|---|---|---|
| card_identificator | String | Identificador de tipo de produto | SIM |
| store_cnpj | String | CNPJ da loja que está originando a venda deste Gift Card | NÃO |
| external_partner_load_id | String | ID da plataforma do parceiro, não serão aceitos valores duplicados neste campo | SIM |
| card_image_id | Integer | ID da imagem do cartão que deverá ser utilizado em todas comunicações com o cliente. Caso não seja enviado, será utilizado o padrão | NÃO |
| total | Decimal | Valor a ser carregado no Gift Card | SIM |

**Response**

```json
{
  "response_code": "201",
  "response_message": "Gift cards created",
  "external_partner_load_id": "1",
  "transaction_code": "4ebcab2d-b5c1-4c08-b425-afcf91ac8ec9",
  "transaction_date": "2022-01-20",
  "magic_link": "https://giftcard-hmg.todo.gift/MnrdJTar6sjp71KqFY3EE2tWiF-zqJgHcefB",
  "expire_date": null,
  "card_number": "0000014281767635",
  "card_password": "",
  "redemption_code": "9443315754",
  "metadata": [
    { "name": "ddpId", "value": 123456 },
    { "name": "prodType", "value": "pin_realtime" },
    { "name": "serialNum", "value": 654321 },
    { "name": "pin", "value": "123ABC" },
    { "name": "vsn", "value": "ABC123" }
  ]
}
```

| Campo | Tipo | Observações |
|---|---|---|
| card_response_code | String | Código de resposta interno da Todo Cartões |
| card_response_message | String | Tradução do código de resposta |
| transaction_code | String | NSU que identifica a transação geração na ativação do vale virtual |
| transaction_date | String | Data que identifica a transação na geração do vale virtual |
| magic_link | String | URL para o usuário acessar seu Gift Card |
| card_number | String | Número do cartão gerado |
| card_password | String | Senha do cartão gerado |
| redemption_code | String | Código que deve ser utilizado para o resgate do Gift Card |
| expire_date | Date | Data de vencimento do cartão gerado |
| external_partner_load_id | String | ID da plataforma do parceiro, não serão aceitos valores duplicados neste campo |
| Metafields | * | Campos adicionais da transação, que podem ser necessários para determinados produtos |

**Example Request**

```bash
curl --location 'https://corporate-api-gateway.uat.todoincomm.com.br/uat/v2/orders' \
--header 'Content-Type: application/json' \
--header 'Authorization: Token <seu token>' \
--data '{
    "card_identificator": "799366454854",
    "store_cnpj": "21647164000185",
    "external_partner_load_id": "1",
    "total": 190.11,
    "card_image_id": "1"
}'
```

**Example Response (200 OK)**

```json
{
  "response_code": "201",
  "response_message": "Gift cards created",
  "external_partner_load_id": "1",
  "transaction_code": "4ebcab2d-b5c1-4c08-b425-afcf91ac8ec9",
  "transaction_date": "2022-01-20",
  "magic_link": "https://giftcard-hmg.todo.gift/MnrdJTar6sjp71KqFY3EE2tWiF-zqJgHcefB",
  "expire_date": null,
  "card_number": "0000014281767635",
  "card_password": "",
  "redemption_code": "9443315754",
  "metadata": [
    { "name": "ddpId", "value": 123456 },
    { "name": "prodType", "value": "pin_realtime" },
    { "name": "serialNum", "value": 654321 },
    { "name": "pin", "value": "123ABC" },
    { "name": "vsn", "value": "ABC123" }
  ]
}
```

---

### POST Cancelamento de Pedido

`https://corporate-api-gateway.uat.todoincomm.com.br/uat/v2/orders/:external_partner_load_id/cancel`

Este endpoint é responsável por cancelar um pedido criado através do endpoint "Emissão Gift Cards". Para usar este endpoint, é necessário enviar o ID enviado no parâmetro `external_partner_load_id` (enviado na criação do pedido).

Este endpoint não deve ser chamado mais de uma vez por `external_partner_load_id`, uma vez que o pedido foi cancelado, o cartão emitido com aquele pedido não funcionará mais. Chamar mais de uma vez esse pedido para o mesmo `external_partner_load_id` uma vez obtido sucesso no cancelamento resultará em um retorno com erro.

**Headers**

| Header | Valor |
|---|---|
| Content-Type | application/json |
| Authorization | Token \<seu token\> |

**Path Variables**

| Variável | Exemplo | Descrição |
|---|---|---|
| external_partner_load_id | 1 | ID informado na emissão do gift card |

**Request:** Este endpoint não deve receber um body.

**Resposta com sucesso**

A resposta desse endpoint será um JSON e um status de 200 no caso de sucesso. Ao receber um 200 você pode considerar que o cartão não é mais válido e foi cancelado.

```json
{
  "response_code": "200",
  "response_message": "Gift card canceled",
  "transaction_code": "75fef290-6926-457b-9948-7b908cf9fafd",
  "transaction_date": "2022-01-20T18:18:56.518Z"
}
```

**Resposta com erro**

Existem alguns cenários que podemos encontrar erro ao cancelar um pedido. Seja por o pedido já estar cancelado, o pedido não ser mais válido ou qualquer outro problema interno nessa operação. Neste caso, o retorno será sempre conforme abaixo.

| Status | O que significa? | Observação |
|---|---|---|
| 4xx | Algo está errado na sua requisição ou obtivemos um timeout ao executar a chamada (iremos retentar). | Não retente a chamada. |
| 5xx | Algo deu errado no nosso servidor enquanto estávamos realizando a operação. | Retente a chamada. |

Em qualquer cenário de erro, sempre será retornado algum tipo de mensagem:

```json
{
  "message": "helpful message"
}
```

**Example Request**

```bash
curl --location --request POST 'https://corporate-api-gateway.uat.todoincomm.com.br/uat/v2/orders/1/cancel' \
--header 'Content-Type: application/json' \
--header 'Authorization: Token <seu token>'
```

**Example Response (200 OK)**

```json
{
  "response_code": "200",
  "response_message": "Gift card canceled",
  "transaction_code": "75fef290-6926-457b-9948-7b908cf9fafd",
  "transaction_date": "2022-01-20T18:18:56.518Z"
}
```

---

### GET Limites de Parceiro

`https://corporate-api-gateway.uat.todoincomm.com.br/uat/v2/partner-limits`

Cada parceiro tem um limite de valor de crédito por período negociado comercialmente para ativar cartões presentes digitais.

Este endpoint é responsável por apresentar qual o limite disponível para ativação de cartões dentro do período negociado comercialmente.

Esse limite é utilizado apenas para um tipo específico de parceiro corporativo, portanto a Todo InComm irá informar se sua integração utilizará esse endpoint para essa consulta ou se a consulta de limites será realizada por outro método.

**Headers**

| Header | Valor |
|---|---|
| Content-Type | application/json |
| Authorization | Token \<seu token\> |

**Example Request**

```bash
curl --location 'https://corporate-api-gateway.uat.todoincomm.com.br/uat/v2/partner-limits' \
--header 'Content-Type: application/json' \
--header 'Authorization: Token <seu token>'
```

**Example Response:** No response body.
