import { useState, useEffect, useCallback } from 'react';
import { getWeb3, connectWallet, switchToBSC, getBalances, getCurrentChainId, BSC_CONFIG } from '@/lib/web3';
import type { WalletState } from '@/types/wallet';
import { useToast } from '@/hooks/use-toast';

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    account: null,
    balance: { usdt: '0.00', bnb: '0.0000' },
    chainId: null,
    isCorrectNetwork: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const account = accounts[0];
            const isCorrectNetwork = await checkNetwork();
            
            setWalletState(prev => ({
              ...prev,
              isConnected: true,
              account,
              isCorrectNetwork,
            }));

            await updateBalance(account);
          }
        } catch (error) {
          console.error('Error checking existing connection:', error);
        }
      }
    };

    checkExistingConnection();
  }, []);

  const updateBalance = useCallback(async (account: string) => {
    try {
      const balance = await getBalances(account);
      setWalletState(prev => ({ ...prev, balance }));
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  }, []);

  const checkNetwork = useCallback(async () => {
    try {
      const chainId = await getCurrentChainId();
      const isCorrectNetwork = chainId === BSC_CONFIG.chainId;
      setWalletState(prev => ({ ...prev, chainId, isCorrectNetwork }));
      return isCorrectNetwork;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      const accounts = await connectWallet();
      const account = accounts[0];
      
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        await switchToBSC();
        await checkNetwork();
      }

      setWalletState(prev => ({
        ...prev,
        isConnected: true,
        account,
      }));

      await updateBalance(account);
      
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      });

      return account;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [checkNetwork, updateBalance, toast]);

  const disconnect = useCallback(() => {
    setWalletState({
      isConnected: false,
      account: null,
      balance: { usdt: '0.00', bnb: '0.0000' },
      chainId: null,
      isCorrectNetwork: false,
    });
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  }, [toast]);

  // Listen for account and network changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== walletState.account) {
          setWalletState(prev => ({ ...prev, account: accounts[0] }));
          updateBalance(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        checkNetwork();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [walletState.account, updateBalance, disconnect, checkNetwork]);

  // Auto-update balance every 30 seconds
  useEffect(() => {
    if (walletState.isConnected && walletState.account) {
      const interval = setInterval(() => {
        updateBalance(walletState.account!);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [walletState.isConnected, walletState.account, updateBalance]);

  return {
    ...walletState,
    isLoading,
    connect,
    disconnect,
    updateBalance: () => walletState.account && updateBalance(walletState.account),
    checkNetwork,
  };
}
