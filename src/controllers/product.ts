import { AppDataSource } from '@/data-source';
import { Product } from '@/entities/';
import { BaseProduct } from '@/models/IProduct';
import logger from '@/utils/logger';

export class ProductController {
  private readonly productRepository = AppDataSource.getRepository(Product);

  public async save(products: BaseProduct[]): Promise<void> {
    logger.info('Updating products catalog');
    await this.productRepository.delete({});
    await this.productRepository.save(products);
  }

  public async get(offset: number, limit: number = 5): Promise<BaseProduct[]> {
    return this.productRepository.find({ skip: offset, take: limit });
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
}
