import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { sendUSDT, getWeb3 } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function SendUSDT() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { account, isConnected, updateBalance } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const recordTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const response = await apiRequest('POST', '/api/transactions', transactionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    if (!recipient || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const web3 = getWeb3();
    if (!web3 || !web3.utils.isAddress(recipient)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid recipient address.",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const txHash = await sendUSDT(account, recipient, amount);
      
      // Record transaction in backend
      recordTransactionMutation.mutate({
        fromAddress: account,
        toAddress: recipient,
        amount: amount,
        txHash: txHash,
        status: 'completed',
        type: 'send',
      });

      toast({
        title: "Transaction Sent",
        description: `Successfully sent ${amount} USDT. Transaction hash: ${txHash.substring(0, 10)}...`,
      });

      // Clear form
      setRecipient('');
      setAmount('');
      
      // Update balance after a delay
      setTimeout(() => {
        updateBalance && updateBalance();
      }, 2000);

    } catch (error) {
      console.error('Error sending USDT:', error);
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to send USDT",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Send USDT</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="font-mono"
            />
          </div>
          
          <div>
            <Label htmlFor="amount">Amount (USDT)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send USDT'
              )}
            </Button>
            <p className="text-sm text-gray-500">Gas fee will be deducted from BNB balance</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
