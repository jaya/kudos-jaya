import { fetchProductsResponse } from '@/clients/todo-cartoes/test/samples';
import { AppDataSource } from '@/data-source';
import { ProductController } from '../product';

describe('ProductController', () => {
  let productController: ProductController;
  let mockRepository;
  beforeEach(() => {
    mockRepository = {
      delete: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      upsert: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockRepository);

    productController = new ProductController();
  });

  describe('save()', () => {
    it('Should save products', async () => {
      mockRepository.insert.mockResolvedValueOnce();

      await productController.save(fetchProductsResponse);

      expect(mockRepository.insert).toHaveBeenCalledWith(fetchProductsResponse);
    });
  });
  describe('get()', () => {
    it('Should return the products from db limited to 5', async () => {
      mockRepository.find.mockResolvedValueOnce(fetchProductsResponse);
      const response = await productController.get(0);
      expect(response.length).toEqual(fetchProductsResponse.length);
      expect(response).toEqual(fetchProductsResponse);
    });
  });

  describe('getCatalogSize()', () => {
    it('Should return the number of products saved on DB', async () => {
      mockRepository.count.mockResolvedValueOnce(60);
      const response = await productController.getCatalogSize();
      expect(response).toEqual(60);
    });
  });

  describe('isCatalogUpdated()', () => {
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    beforeEach(() => {
      jest.clearAllMocks();
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });
    describe('When catalog is up to date', () => {
      it('should return true', async () => {
        mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        const mockUpdatedAt = new Date();
        const latestProductDate = { updatedAt: mockUpdatedAt };

        mockQueryBuilder.getOne.mockResolvedValueOnce(latestProductDate);

        const result = await productController.isCatalogUpdated();

        expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
          'product',
        );
        expect(mockQueryBuilder.select).toHaveBeenCalledWith(
          'product.updatedAt',
        );

        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
          'product.updatedAt',
          'DESC',
        );
        expect(result).toEqual(true);
      });
    });

    describe('When catalog is out of date', () => {
      it('Should return false', async () => {
        mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        const date = new Date();
        const mockNotUpdated = new Date(date);
        mockNotUpdated.setDate(date.getDate() - 15);
        const latestProductDate = { updatedAt: mockNotUpdated };

        mockQueryBuilder.getOne.mockResolvedValueOnce(latestProductDate);

        const result = await productController.isCatalogUpdated();

        expect(result).toEqual(false);
      });
    });
  });

  describe('updateCatalog()', () => {
    const incomingProducts = [
      {
        id: '1',
        name: 'Product 1',
        logo: 'logo-1',
        description: 'Description 1',
        terms: 'Terms 1',
        minValue: 10,
        maxValue: 100,
        isActive: true,
      },
    ];

    it('Should deactivate missing products and upsert received catalog', async () => {
      mockRepository.find.mockResolvedValueOnce([
        { id: '1', isActive: true },
        { id: '2', isActive: true },
      ]);
      mockRepository.update.mockResolvedValueOnce();
      mockRepository.upsert.mockResolvedValueOnce();

      await productController.updateCatalog(incomingProducts);

      expect(mockRepository.update).toHaveBeenCalledWith(['2'], {
        isActive: false,
      });
      expect(mockRepository.upsert).toHaveBeenCalledWith(
        incomingProducts.map((product) => ({
          ...product,
          isActive: true,
        })),
        {
          conflictPaths: ['id'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
    });

    it('Should not deactivate when all db products are in received catalog', async () => {
      mockRepository.find.mockResolvedValueOnce([{ id: '1', isActive: true }]);
      mockRepository.upsert.mockResolvedValueOnce();

      await productController.updateCatalog(incomingProducts);

      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(mockRepository.upsert).toHaveBeenCalled();
    });
  });
});
