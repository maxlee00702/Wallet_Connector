import { wallets, transactions, adminSettings, type Wallet, type Transaction, type AdminSettings, type InsertWallet, type InsertTransaction, type InsertAdminSettings } from "@shared/schema";

export interface IStorage {
  // Wallet operations
  getWallet(address: string): Promise<Wallet | undefined>;
  getAllWallets(): Promise<Wallet[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletActivity(address: string): Promise<void>;
  
  // Transaction operations
  getTransactionsByAddress(address: string): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(txHash: string, status: string): Promise<void>;
  
  // Admin operations
  getAdminSettings(): Promise<AdminSettings | undefined>;
  updateAdminSettings(settings: InsertAdminSettings): Promise<AdminSettings>;
}

export class MemStorage implements IStorage {
  private wallets: Map<string, Wallet>;
  private transactions: Map<string, Transaction>;
  private adminSettings: AdminSettings | undefined;
  private walletIdCounter: number;
  private transactionIdCounter: number;

  constructor() {
    this.wallets = new Map();
    this.transactions = new Map();
    this.walletIdCounter = 1;
    this.transactionIdCounter = 1;
    this.adminSettings = undefined;
  }

  async getWallet(address: string): Promise<Wallet | undefined> {
    return this.wallets.get(address.toLowerCase());
  }

  async getAllWallets(): Promise<Wallet[]> {
    return Array.from(this.wallets.values())
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.walletIdCounter++;
    const wallet: Wallet = {
      id,
      ...insertWallet,
      address: insertWallet.address.toLowerCase(),
      createdAt: new Date(),
    };
    this.wallets.set(wallet.address, wallet);
    return wallet;
  }

  async updateWalletActivity(address: string): Promise<void> {
    const wallet = this.wallets.get(address.toLowerCase());
    if (wallet) {
      wallet.lastActivity = new Date();
    }
  }

  async getTransactionsByAddress(address: string): Promise<Transaction[]> {
    const addr = address.toLowerCase();
    return Array.from(this.transactions.values())
      .filter(tx => tx.fromAddress.toLowerCase() === addr || tx.toAddress.toLowerCase() === addr)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = {
      id,
      ...insertTransaction,
      fromAddress: insertTransaction.fromAddress.toLowerCase(),
      toAddress: insertTransaction.toAddress.toLowerCase(),
      createdAt: new Date(),
    };
    this.transactions.set(transaction.txHash, transaction);
    return transaction;
  }

  async updateTransactionStatus(txHash: string, status: string): Promise<void> {
    const transaction = this.transactions.get(txHash);
    if (transaction) {
      transaction.status = status;
    }
  }

  async getAdminSettings(): Promise<AdminSettings | undefined> {
    return this.adminSettings;
  }

  async updateAdminSettings(settings: InsertAdminSettings): Promise<AdminSettings> {
    if (!this.adminSettings) {
      this.adminSettings = {
        id: 1,
        ...settings,
        createdAt: new Date(),
      };
    } else {
      Object.assign(this.adminSettings, settings);
    }
    return this.adminSettings;
  }
}

export const storage = new MemStorage();
