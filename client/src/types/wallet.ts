export interface WalletBalance {
  usdt: string;
  bnb: string;
}

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export interface TransactionData {
  from: string;
  to: string;
  value: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
}

export interface WalletState {
  isConnected: boolean;
  account: string | null;
  balance: WalletBalance;
  chainId: string | null;
  isCorrectNetwork: boolean;
}
