import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWalletSchema, insertTransactionSchema, insertAdminSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Wallet routes
  app.post("/api/wallets", async (req, res) => {

    try {
      console.log("wallets", req.body);
      const walletData = insertWalletSchema.parse(req.body);
      
      // Check if wallet already exists
      const existingWallet = await storage.getWallet(walletData.address);
      if (existingWallet) {
        // Update activity and return existing wallet
        await storage.updateWalletActivity(walletData.address);
        return res.json(existingWallet);
      }
      
      const wallet = await storage.createWallet(walletData);
      res.json(wallet);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid wallet data" });
    }
  });

  app.get("/api/wallets", async (req, res) => {
    try {
      const wallets = await storage.getAllWallets();
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  app.get("/api/wallets/:address", async (req, res) => {
    try {
      const wallet = await storage.getWallet(req.params.address);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  app.put("/api/wallets/:address/activity", async (req, res) => {
    try {
      await storage.updateWalletActivity(req.params.address);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update wallet activity" });
    }
  });

  // Transaction routes
  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid transaction data" });
    }
  });

  app.get("/api/transactions", async (req, res) => {
    try {
      const { address } = req.query;
      
      if (address && typeof address === 'string') {
        const transactions = await storage.getTransactionsByAddress(address);
        return res.json(transactions);
      }
      
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.put("/api/transactions/:txHash/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      await storage.updateTransactionStatus(req.params.txHash, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update transaction status" });
    }
  });

  // Admin routes
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getAdminSettings();
      res.json(settings || { masterWallet: null, isMaintenanceMode: false });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin settings" });
    }
  });

  app.put("/api/admin/settings", async (req, res) => {
    try {
      const settingsData = insertAdminSettingsSchema.parse(req.body);
      const settings = await storage.updateAdminSettings(settingsData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid settings data" });
    }
  });

  // Admin statistics
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const wallets = await storage.getAllWallets();
      const transactions = await storage.getAllTransactions();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayTransactions = transactions.filter(tx => 
        tx.createdAt >= today
      );
      
      const activeWallets = wallets.filter(wallet => {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return wallet.lastActivity >= dayAgo;
      });

      res.json({
        connectedWallets: wallets.length,
        todayTransactions: todayTransactions.length,
        activeUsers: activeWallets.length,
        totalTransactions: transactions.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
