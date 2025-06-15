import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@/hooks/use-wallet';
import type { Transaction } from '@shared/schema';

export function TransactionHistory() {
  const { account, isConnected } = useWallet();
  
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/transactions', account],
    enabled: isConnected && !!account,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!isConnected) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTransactionType = (tx: Transaction) => {
    if (!account) return '';
    const isOutgoing = tx.fromAddress.toLowerCase() === account.toLowerCase();
    return isOutgoing ? 'Sent' : 'Received';
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const openInExplorer = (txHash: string) => {
    window.open(`https://bscscan.com/tx/${txHash}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Recent Transactions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 bg-gray-100 rounded-lg">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx: Transaction) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getTransactionType(tx)} {tx.amount} USDT
                    </p>
                    {getStatusBadge(tx.status)}
                  </div>
                  <p className="text-xs text-gray-500 font-mono">
                    {tx.fromAddress.toLowerCase() === account?.toLowerCase() 
                      ? `To: ${formatAddress(tx.toAddress)}`
                      : `From: ${formatAddress(tx.fromAddress)}`
                    }
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => openInExplorer(tx.txHash)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="View on BSCScan"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
