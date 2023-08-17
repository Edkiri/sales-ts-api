import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import prismaMock from 'prisma/__mocks__/prisma';
import { OrderService } from '../service';
import Container from 'typedi';
import { ProductService } from '../../products/service';
import { SaleService } from '../../sales/service';

vi.mock('prisma/prisma');

describe('orders.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('createOrder', () => {
    it('should call createOrderWithTransaction only once when no tx', async () => {
      Container.set(SaleService, {
        checkSaleStatus: vi.fn().mockReturnValueOnce(true),
      });
      Container.set(ProductService, {
        addOrder: vi.fn().mockReturnValueOnce(true),
      });

      const ordersService = Container.get(OrderService);

      ordersService.prisma = prismaMock;
      prismaMock.$transaction.mockImplementationOnce((callback) =>
        callback(prismaMock),
      );

      ordersService.createOrderWithTransaction = vi
        .fn()
        .mockReturnValueOnce(true);

      await ordersService.createOrder({
        price: 10,
        productId: 1,
        quantity: 1,
        rate: 1,
        saleId: 1,
      });

      expect(ordersService.createOrderWithTransaction).toHaveBeenCalledTimes(1);
    });
  });
});
