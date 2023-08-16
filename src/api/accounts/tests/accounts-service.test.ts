import { beforeEach, describe, expect, it, vi } from 'vitest';
import prismaMock from 'prisma/__mocks__/prisma';
import { AccountService } from '../service';

vi.mock('prisma/prisma');

describe('accounts.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('addPayment', () => {
    it('should return account', async () => {
      const accountService = new AccountService();

      prismaMock.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: 1,
        amount: 100,
        currency: 1,
        name: 'testing account',
        deletedAt: null,
      });

      prismaMock.account.update.mockResolvedValueOnce({
        id: 1,
        amount: 0,
        currency: 1,
        name: 'testing account',
        deletedAt: null,
      });

      const updatedAccount = await accountService.addPayment({
        accountId: 1,
        amount: 100,
        currency: 1,
        method: 1,
        rate: 1,
        saleId: 1,
      });

      expect(updatedAccount.amount).toBe(0);
    });

    it('should throw "Not enough money on this account" error message', async () => {
      const accountService = new AccountService();

      prismaMock.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: 1,
        amount: 100,
        currency: 1,
        name: 'testing account',
        deletedAt: null,
      });

      expect(
        async () =>
          await accountService.addPayment({
            accountId: 1,
            amount: -101,
            currency: 1,
            method: 1,
            rate: 1,
            saleId: 1,
          }),
      ).rejects.toThrowError('Not enough money on this account');
    });
  });
});
