import * as fs from 'fs';
import * as path from 'path';
import express, { Express, Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';

const MOCK_PORT = process.env.MOCK_TODO_PORT || 3001;
const PRODUCTS_FILE = path.join(__dirname, './products.json');

let productsData: unknown = null;

const loadProducts = (): void => {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    productsData = JSON.parse(data);
    logger.info('Mock server: Products loaded successfully');
  } catch (error) {
    logger.error('Mock server: Failed to load products.json', error);
    process.exit(1);
  }
};

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Token ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

const createMockServer = (): Express => {
  const app = express();

  app.use(express.json());
  app.use(authMiddleware);

  app.get('/product_lines', (req: Request, res: Response) => {
    if (!productsData) {
      res.status(500).json({ error: 'Products data not loaded' });
      return;
    }
    logger.info('Mock server: GET /product_lines');
    res.status(200).json(productsData);
  });

  app.post('/orders', (req: Request, res: Response) => {
    logger.info('Mock server: POST /orders', { body: req.body });

    const { card_identificator, external_partner_load_id, total } = req.body;

    if (!card_identificator || !external_partner_load_id || !total) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const mockResponse = {
      id: Math.random().toString(36).substr(2, 9),
      magic_link: `https://mock.todocartoes.com.br/giftcard/${Math.random().toString(36).substr(2, 9)}`,
      card_identificator,
      external_partner_load_id,
      total,
      status: 'created',
      created_at: new Date().toISOString(),
    };

    res.status(201).json(mockResponse);
  });

  app.use((req: Request, res: Response) => {
    logger.warn(`Mock server: 404 ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Not found' });
  });

  return app;
};

const startMockServer = (): void => {
  loadProducts();

  const app = createMockServer();

  app.listen(MOCK_PORT, () => {
    logger.info(`🎭 Mock TodoCartoes server is running on port ${MOCK_PORT}`);
  });
};

if (require.main === module) {
  startMockServer();
}

export { createMockServer, startMockServer };
