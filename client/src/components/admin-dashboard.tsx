import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, DollarSign, Activity, TrendingUp, Send, Download, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Wallet, Transaction } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  connectedWallets: number;
  todayTransactions: number;
  activeUsers: number;
  totalTransactions: number;
}

export function AdminDashboard() {
  const [sendForm, setSendForm] = useState({
    fromWallet: '',
    toAddress: '',
    amount: '',
  });
  const [collectForm, setCollectForm] = useState({
    fromWallet: 'all',
    toMasterWallet: '',
    amount: '',
  });
  
  const { toast } = useToast();

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000,
  });

  const { data: wallets = [] } = useQuery<Wallet[]>({
    queryKey: ['/api/wallets'],
    refetchInterval: 30000,
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    refetchInterval: 30000,
  });

  const { data: adminSettings } = useQuery({
    queryKey: ['/api/admin/settings'],
  });

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

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

  const handleSendUSDT = async (e: React.FormEvent) => {
    e.preventDefault();
    // This would integrate with Web3 for admin transactions
    toast({
      title: "Admin Send",
      description: "Admin send functionality would be implemented here with proper authentication.",
    });
  };

  const handleCollectFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    // This would integrate with Web3 for fund collection
    toast({
      title: "Collect Funds",
      description: "Fund collection functionality would be implemented here with proper authentication.",
    });
  };

  const openInExplorer = (txHash: string) => {
    window.open(`https://bscscan.com/tx/${txHash}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
              <p className="text-gray-600 mt-1">Manage all connected wallets and USDT transactions</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">BSC Network</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Connected Wallets</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.connectedWallets || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalTransactions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Today's Transactions</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.todayTransactions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Wallets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Connected Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell className="font-mono">
                      {formatAddress(wallet.address)}
                    </TableCell>
                    <TableCell>
                      {wallet.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(wallet.lastActivity).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                          Send
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          Freeze
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Fund Management */}
      <Card>
        <CardHeader>
          <CardTitle>Fund Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Send USDT */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Send USDT (Admin)</h4>
              <form onSubmit={handleSendUSDT} className="space-y-4">
                <div>
                  <Label>From Wallet</Label>
                  <Select value={sendForm.fromWallet} onValueChange={(value) => setSendForm(prev => ({ ...prev, fromWallet: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.address}>
                          {formatAddress(wallet.address)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>To Address</Label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={sendForm.toAddress}
                    onChange={(e) => setSendForm(prev => ({ ...prev, toAddress: e.target.value }))}
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label>Amount (USDT)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  <Send className="mr-2 h-4 w-4" />
                  Send USDT
                </Button>
              </form>
            </div>

            {/* Collect Funds */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Collect Funds</h4>
              <form onSubmit={handleCollectFunds} className="space-y-4">
                <div>
                  <Label>Collect From</Label>
                  <Select value={collectForm.fromWallet} onValueChange={(value) => setCollectForm(prev => ({ ...prev, fromWallet: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Wallets</SelectItem>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.address}>
                          {formatAddress(wallet.address)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>To Master Wallet</Label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={collectForm.toMasterWallet}
                    onChange={(e) => setCollectForm(prev => ({ ...prev, toMasterWallet: e.target.value }))}
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label>Amount (USDT)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={collectForm.amount}
                    onChange={(e) => setCollectForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  <Download className="mr-2 h-4 w-4" />
                  Collect Funds
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Admin Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admin Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {tx.type === 'send' ? 'Sent' : tx.type === 'admin_send' ? 'Admin Sent' : 'Collected'} {tx.amount} USDT
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      From: {formatAddress(tx.fromAddress)} → To: {formatAddress(tx.toAddress)}
                    </p>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <div>
                      <p className="text-sm text-gray-900">{new Date(tx.createdAt).toLocaleString()}</p>
                      {getStatusBadge(tx.status)}
                    </div>
                    <button
                      onClick={() => openInExplorer(tx.txHash)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View on BSCScan"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
