import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentService } from '../service';
import { SaleService } from '../../sales/service';
import { AccountService } from '../../accounts/service';
import Container from 'typedi';

vi.mock('prisma/prisma');

describe('payments.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('createPayment', () => {
    it('should throw "\'saleId\' is required" error message', async () => {
      Container.set(SaleService, {
        checkSaleStatus: vi.fn().mockReturnValue(true),
      });
      Container.set(AccountService, {
        addPayment: vi.fn().mockReturnValue(true),
      });
      const paymentService = Container.get(PaymentService);

      expect(async () => {
        await paymentService.createPayment({
          accountId: 1,
          amount: 100,
          currency: 1,
          method: 1,
          rate: 1,
        });
      }).rejects.toThrowError("'saleId' is required");
    });
  });
});
