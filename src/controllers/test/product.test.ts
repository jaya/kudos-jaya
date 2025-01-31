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
      save: jest.fn(),
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
      expect(response.length).toEqual(5);
      expect(response).toEqual(fetchProductsResponse.slice(0, 5));
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
          'product'
        );
        expect(mockQueryBuilder.select).toHaveBeenCalledWith(
          'product.updatedAt'
        );

        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
          'product.updatedAt',
          'ASC'
        );
        expect(result).toEqual(true);
      });
    });

    describe('When catalog is out of date', () => {
      it('Should return false', async () => {
        mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        const date = new Date();
        const mockNotUpdated = date.getDate() - 15;
        const latestProductDate = { updatedAt: mockNotUpdated };

        mockQueryBuilder.getOne.mockResolvedValueOnce(latestProductDate);

        const result = await productController.isCatalogUpdated();

        expect(result).toEqual(false);
      });
    });
  });

  describe('updateCatalog()', () => {
    it('Should update the date of the sync between the db and todo and insert new products if they exist', async () => {
      mockRepository.save.mockResolvedValueOnce();

      await productController.updateCatalog(fetchProductsResponse);

      expect(mockRepository.save).toHaveBeenCalledWith(fetchProductsResponse);
    });
  });
});
