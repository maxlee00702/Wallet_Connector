import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function WalletConnection() {
  const { isConnected, account, balance, isCorrectNetwork, isLoading, connect, disconnect } = useWallet();
  const queryClient = useQueryClient();

  const registerWalletMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await apiRequest('POST', '/api/wallets', {
        address,
        isActive: true
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
    },
  });

  const handleConnect = async () => {
    try {
      const account = await connect();
      if (account) {
        // Register wallet with backend
        registerWalletMutation.mutate(account);
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  if (isConnected && account) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-green-800">Wallet Connected</p>
                  <p className="text-sm text-green-600 font-mono">
                    {`${account.substring(0, 6)}...${account.substring(38)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!isCorrectNetwork && (
                  <Badge variant="destructive" className="text-xs">
                    Wrong Network
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnect}
                  className="text-red-600 hover:text-red-800"
                >
                  Disconnect
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900">USDT Balance</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{balance.usdt}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900">BNB Balance</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{balance.bnb}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Wallet className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-lg font-medium text-gray-900">Connect Your Wallet</h2>
              <p className="text-gray-600">Connect your Trust Wallet or any BEP-20 compatible wallet to start managing USDT transactions.</p>
            </div>
          </div>
          
          <Button 
            onClick={handleConnect} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Wallet'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
