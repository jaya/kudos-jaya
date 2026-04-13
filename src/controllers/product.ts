import { AppDataSource } from '@/data-source';
import { Product } from '@/entities/';
import { BaseProduct } from '@/models/IProduct';
import logger from '@/utils/logger';

export class ProductController {
  private readonly productRepository = AppDataSource.getRepository(Product);

  public async save(products: BaseProduct[]): Promise<void> {
    await this.productRepository.insert(products);
  }

  public async get(
    offset: number,
    limit: number = 5,
    params = {},
  ): Promise<Partial<BaseProduct>[]> {
    return this.productRepository.find({
      where: {
        ...params,
        isActive: true,
      },
      skip: offset,
      take: limit,
      order: {
        name: 'ASC',
        minValue: 'ASC',
      },
    });
  }

  public async getCatalogSize(): Promise<number> {
    return this.productRepository.count({ where: { isActive: true } });
  }

  public async isCatalogUpdated(): Promise<boolean> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .select('product.updatedAt')
      .where('product.isActive = :isActive', { isActive: true })
      .orderBy('product.updatedAt', 'DESC')
      .limit(1);
    const result = await queryBuilder.getOne();

    const updatedAt = result?.updatedAt;

    logger.info('Last catalog update ', { updatedAt });

    if (updatedAt) {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      if (updatedAt < oneHourAgo) {
        return false;
      }
      return true;
    }
  }

  public async updateCatalog(products: BaseProduct[]): Promise<void> {
    logger.info('Updating products catalog');

    const currentProducts = await this.productRepository.find({
      select: {
        id: true,
        isActive: true,
      },
    });

    const incomingProductsById = new Set(products.map((product) => product.id));
    const productIdsToDeactivate = currentProducts
      .filter(
        (product) => product.isActive && !incomingProductsById.has(product.id),
      )
      .map((product) => product.id);

    if (productIdsToDeactivate.length > 0) {
      await this.productRepository.update(productIdsToDeactivate, {
        isActive: false,
      });
    }

    await this.productRepository.upsert(
      products.map((product) => ({
        ...product,
        isActive: true,
      })),
      {
        conflictPaths: ['id'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }
}
