import Web3 from 'web3';

// BSC Network Configuration
export const BSC_CONFIG = {
  chainId: '0x38', // 56 in hex
  chainName: 'Binance Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/']
};

// USDT Contract Address on BSC
export const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// USDT ABI (simplified)
export const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
];

let web3Instance: Web3 | null = null;
let usdtContractInstance: any = null;

export function getWeb3() {
  if (!web3Instance && typeof window !== 'undefined' && window.ethereum) {
    web3Instance = new Web3(window.ethereum);
    usdtContractInstance = new web3Instance.eth.Contract(USDT_ABI, USDT_CONTRACT_ADDRESS);
  }
  return web3Instance;
}

export function getUSDTContract() {
  if (!usdtContractInstance && getWeb3()) {
    usdtContractInstance = new web3Instance!.eth.Contract(USDT_ABI, USDT_CONTRACT_ADDRESS);
  }
  return usdtContractInstance;
}

export async function connectWallet(): Promise<string[]> {
  if (!window.ethereum) {
    const error = new Error('No wallet detected. Please install MetaMask or Trust Wallet.');
    error.name = 'WalletNotInstalledError';
    error.message = 'To use this application, you need to install a Web3 wallet. Please install MetaMask or Trust Wallet from the Chrome Web Store.';
    throw error;
  }
  console.log(window.ethereum, "etherums")
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      const error = new Error('No accounts found. Please unlock your wallet.');
      error.name = 'WalletLockedError';
      error.message = 'Please unlock your wallet and try again.';
      throw error;
    }

    return accounts;
  } catch (error: any) {
    if (error.code === 4001) {
      // User rejected the connection
      const newError = new Error('Connection rejected. Please connect your wallet to continue.');
      newError.name = 'ConnectionRejectedError';
      throw newError;
    }
    throw error;
  }
}

export async function switchToBSC(): Promise<void> {
  if (!window.ethereum) {
    throw new Error('No wallet detected.');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BSC_CONFIG.chainId }]
    });
  } catch (switchError: any) {
    // If BSC is not added to wallet, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [BSC_CONFIG]
      });
    } else {
      throw switchError;
    }
  }
}

export async function getBalances(account: string) {
  const web3 = getWeb3();
  const usdtContract = getUSDTContract();
  
  if (!web3 || !usdtContract) {
    throw new Error('Web3 not initialized');
  }

  // Get BNB balance
  const bnbBalance = await web3.eth.getBalance(account);
  const bnbFormatted = web3.utils.fromWei(bnbBalance, 'ether');

  // Get USDT balance
  const usdtBalance = await usdtContract.methods.balanceOf(account).call();
  const usdtFormatted = web3.utils.fromWei(usdtBalance, 'ether');

  return {
    usdt: parseFloat(usdtFormatted).toFixed(2),
    bnb: parseFloat(bnbFormatted).toFixed(4)
  };
}

export async function sendUSDT(fromAddress: string, toAddress: string, amount: string): Promise<string> {
  const web3 = getWeb3();
  const usdtContract = getUSDTContract();
  
  if (!web3 || !usdtContract) {
    throw new Error('Web3 not initialized');
  }

  const amountWei = web3.utils.toWei(amount, 'ether');
  
  // Estimate gas
  const gasEstimate = await usdtContract.methods
    .transfer(toAddress, amountWei)
    .estimateGas({ from: fromAddress });

  // Send transaction
  const transaction = await usdtContract.methods
    .transfer(toAddress, amountWei)
    .send({
      from: fromAddress,
      gas: gasEstimate
    });

  return transaction.transactionHash;
}

export async function getCurrentChainId(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('No wallet detected.');
  }
  
  return await window.ethereum.request({ method: 'eth_chainId' });
}

// Declare global ethereum interface
declare global {
  interface Window {
    ethereum?: any;
    Web3?: any;
  }
}
