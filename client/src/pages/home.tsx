import { WalletConnection } from '@/components/wallet-connection';
import { SendUSDT } from '@/components/send-usdt';
import { TransactionHistory } from '@/components/transaction-history';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-gray-900">USDT Wallet Manager</h1>
              <Badge className="bg-yellow-100 text-yellow-800">BSC Network</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <WalletConnection />
          <SendUSDT />
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}
