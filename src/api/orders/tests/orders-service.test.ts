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
    it('should call createOrderWithTransaction only once per order', async () => {
      Container.set(SaleService, {
        checkSaleStatus: vi.fn().mockReturnValueOnce(true),
      });
      Container.set(ProductService, {
        addOrder: vi.fn().mockReturnValueOnce(true),
      });

      const ordersService = Container.get(OrderService);

      prismaMock.$transaction.mockImplementationOnce((callback) =>
        callback(prismaMock),
      );

      ordersService.createOrderWithTransaction = vi
        .fn()
        .mockReturnValueOnce(true);

      const orderData = {
        price: 1,
        productId: 1,
        quantity: 1,
        rate: 1,
        saleId: 1,
      };
      await ordersService.createOrder(orderData);

      await ordersService.createOrder(orderData);

      expect(ordersService.createOrderWithTransaction).toHaveBeenCalledTimes(2);
    });
  });
});
