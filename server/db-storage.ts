import { db } from './db';
import { wallets, transactions, adminSettings, type Wallet, type Transaction, type AdminSettings, type InsertWallet, type InsertTransaction, type InsertAdminSettings } from '@shared/schema';
import { eq, or } from 'drizzle-orm';

export class DbStorage {
  // Wallet operations
  async getWallet(address: string): Promise<Wallet | undefined> {
    const result = await db.select().from(wallets).where(eq(wallets.address, address.toLowerCase()));
    return result[0];
  }

  async getAllWallets(): Promise<Wallet[]> {
    return await db.select().from(wallets).orderBy(wallets.lastActivity);
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const result = await db.insert(wallets).values({
      ...wallet,
      address: wallet.address.toLowerCase(),
    }).returning();
    return result[0];
  }

  async updateWalletActivity(address: string): Promise<void> {
    await db.update(wallets)
      .set({ lastActivity: new Date() })
      .where(eq(wallets.address, address.toLowerCase()));
  }

  // Transaction operations
  async getTransactionsByAddress(address: string): Promise<Transaction[]> {
    const addr = address.toLowerCase();
    return await db.select().from(transactions)
      .where(or(
        eq(transactions.fromAddress, addr),
        eq(transactions.toAddress, addr)
      ))
      .orderBy(transactions.createdAt);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(transactions.createdAt);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values({
      ...transaction,
      fromAddress: transaction.fromAddress.toLowerCase(),
      toAddress: transaction.toAddress.toLowerCase(),
    }).returning();
    return result[0];
  }

  async updateTransactionStatus(txHash: string, status: string): Promise<void> {
    await db.update(transactions)
      .set({ status })
      .where(eq(transactions.txHash, txHash));
  }

  // Admin operations
  async getAdminSettings(): Promise<AdminSettings | undefined> {
    const result = await db.select().from(adminSettings).limit(1);
    return result[0];
  }

  async updateAdminSettings(settings: InsertAdminSettings): Promise<AdminSettings> {
    const existing = await this.getAdminSettings();
    if (existing) {
      const result = await db.update(adminSettings)
        .set(settings)
        .where(eq(adminSettings.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(adminSettings)
        .values(settings)
        .returning();
      return result[0];
    }
  }
}

export const storage = new DbStorage(); 