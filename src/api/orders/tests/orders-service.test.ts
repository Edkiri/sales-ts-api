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

  describe('createOrder', () => {
    it('should return a order object', async () => {
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

      const orderData = {
        price: 1,
        productId: 1,
        quantity: 1,
        saleId: 1,
        rate: 1,
      };

      ordersService.createOrderWithTransaction = vi
        .fn()
        .mockReturnValueOnce({ ...orderData, id: 1 });

      prismaMock.$transaction.mockResolvedValueOnce({ ...orderData, id: 1 });

      await ordersService.createOrder(orderData);

      expect(prismaMock.$transaction).toHaveReturnedWith({
        ...orderData,
        id: 1,
      });
    });
  });

  describe('deleteOrder', () => {
    it('should call deleteOrderWithTransaction only once per order', async () => {
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

      ordersService.deleteOrderWithTransaction = vi
        .fn()
        .mockReturnValueOnce(true);

      await ordersService.deleteOrder(1);

      expect(ordersService.deleteOrderWithTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateOrder', () => {
    it('should call addOrder or removeOrder one time each', async () => {
      const order = {
        id: 1,
        price: 1,
        productId: 1,
        quantity: 1,
        saleId: 1,
      };
      prismaMock.$transaction.mockImplementationOnce((callback) =>
        callback(prismaMock),
      );
      prismaMock.order.findFirstOrThrow.mockResolvedValueOnce(order);
      prismaMock.order.update.mockResolvedValueOnce(order);

      const ordersService = Container.get(OrderService);

      ordersService.productService.removeOrder = vi
        .fn()
        .mockReturnValueOnce(true);
      ordersService.productService.addOrder = vi.fn().mockReturnValueOnce(true);

      ordersService.deleteOrderWithTransaction = vi
        .fn()
        .mockReturnValueOnce(true);

      await ordersService.updateOrder(1, {
        price: 1,
        rate: 1,
        quantity: 1,
      });

      expect(ordersService.productService.addOrder).toHaveBeenCalledTimes(1);
      expect(ordersService.productService.removeOrder).toHaveBeenCalledTimes(1);
      expect(ordersService.saleService.checkSaleStatus).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should not call addOrder or removeOrder', async () => {
      const order = {
        id: 1,
        price: 1,
        productId: 1,
        quantity: 1,
        saleId: 1,
      };
      prismaMock.$transaction.mockImplementationOnce((callback) =>
        callback(prismaMock),
      );
      prismaMock.order.findFirstOrThrow.mockResolvedValueOnce(order);
      prismaMock.order.update.mockResolvedValueOnce(order);

      const ordersService = Container.get(OrderService);

      ordersService.prisma = prismaMock;
      ordersService.productService.removeOrder = vi
        .fn()
        .mockReturnValueOnce(true);
      ordersService.productService.addOrder = vi.fn().mockReturnValueOnce(true);

      ordersService.deleteOrderWithTransaction = vi
        .fn()
        .mockReturnValueOnce(true);

      await ordersService.updateOrder(1, {
        price: 1,
        rate: 1,
      });

      expect(ordersService.productService.addOrder).toHaveBeenCalledTimes(0);
      expect(ordersService.productService.removeOrder).toHaveBeenCalledTimes(0);
      expect(ordersService.saleService.checkSaleStatus).toHaveBeenCalledTimes(
        1,
      );
    });
  });
});
