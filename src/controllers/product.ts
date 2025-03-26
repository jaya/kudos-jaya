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
      },
      skip: offset,
      take: limit,
      order: {
        name: 'ASC',
      },
    });
  }

  public async getCatalogSize(): Promise<number> {
    return this.productRepository.count();
  }

  public async isCatalogUpdated(): Promise<boolean> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .select('product.updatedAt')
      .orderBy('product.updatedAt', 'ASC')
      .limit(1);
    const result = await queryBuilder.getOne();

    const updatedAt = result?.updatedAt;

    logger.info('Last catalog update ', { updatedAt });

    if (updatedAt) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      if (updatedAt < sevenDaysAgo) {
        return false;
      }
      return true;
    }
  }

  public async updateCatalog(products: BaseProduct[]): Promise<void> {
    logger.info('Updating products catalog');
    products.forEach((prod) => {
      prod.updatedAt = new Date();
    });
    await this.productRepository.save(products);
  }
}
