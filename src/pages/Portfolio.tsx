import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Plus, Clock } from 'lucide-react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchTokenPrices, calculateTotalValue } from '../store/slices/portfolioSlice';
import PortfolioChart from '../components/PortfolioChart';
import WatchlistTable from '../components/WatchlistTable';
import AddTokenModal from '../components/AddTokenModal';
import WalletConnect from '../components/WalletConnect';

const Portfolio = () => {
  const dispatch = useAppDispatch();
  const { tokens, loading, lastUpdated, totalValue } = useAppSelector((state) => state.portfolio);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Calculate total value on component mount
    dispatch(calculateTotalValue());
    
    // Fetch prices if we have tokens
    if (tokens.length > 0) {
      const tokenIds = tokens.map(token => token.id);
      dispatch(fetchTokenPrices(tokenIds));
    }
  }, [dispatch, tokens.length]);

  const handleRefreshPrices = () => {
    if (tokens.length > 0) {
      const tokenIds = tokens.map(token => token.id);
      dispatch(fetchTokenPrices(tokenIds));
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    const date = new Date(lastUpdated);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTotalValue = () => {
    return `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Token Portfolio
              </span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <WalletConnect />
            <Button
              onClick={() => setShowAddModal(true)}
              className="portfolio-gradient text-primary-foreground font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Token
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Total Card */}
          <Card className="lg:col-span-1 card-gradient border-border/50 glow-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Portfolio Total
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-card-foreground">
                {formatTotalValue()}
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Last updated: {formatLastUpdated()}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRefreshPrices}
                  disabled={loading || tokens.length === 0}
                  className="h-6 px-2 text-xs hover:bg-muted/50"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Chart */}
          <Card className="lg:col-span-2 card-gradient border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Portfolio Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PortfolioChart />
            </CardContent>
          </Card>
        </div>

        {/* Watchlist */}
        <Card className="card-gradient border-border/50">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-card-foreground flex items-center space-x-2">
                <span>⭐</span>
                <span>Watchlist</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefreshPrices}
                  disabled={loading || tokens.length === 0}
                  className="border-border hover:bg-muted/50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Prices
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                  className="portfolio-gradient"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Token
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <WatchlistTable />
          </CardContent>
        </Card>

        {/* Pagination Footer Placeholder */}
        {tokens.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>1 of 10 results</div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled className="border-border">
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled className="border-border">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <AddTokenModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
    </div>
  );
};

export default Portfolio;