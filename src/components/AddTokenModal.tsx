import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, TrendingUp } from 'lucide-react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { searchTokens, fetchTrending, addToken, clearSearchResults } from '../store/slices/portfolioSlice';
import { Token } from '../store/slices/portfolioSlice';

interface AddTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddTokenModal = ({ open, onOpenChange }: AddTokenModalProps) => {
  const dispatch = useAppDispatch();
  const { searchResults, trending, loading } = useAppSelector((state) => state.portfolio);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchTrending());
    }
  }, [open, dispatch]);

  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      dispatch(clearSearchResults());
      return;
    }
    
    setSearchLoading(true);
    try {
      await dispatch(searchTokens(query.trim()));
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleTokenSelect = (tokenId: string) => {
    const newSelected = new Set(selectedTokens);
    if (newSelected.has(tokenId)) {
      newSelected.delete(tokenId);
    } else {
      newSelected.add(tokenId);
    }
    setSelectedTokens(newSelected);
  };

  const handleAddTokens = () => {
    const allTokens = [...searchResults, ...trending];
    selectedTokens.forEach(tokenId => {
      const token = allTokens.find(t => t.id === tokenId);
      if (token) {
        dispatch(addToken(token));
      }
    });
    
    setSelectedTokens(new Set());
    setSearchQuery('');
    dispatch(clearSearchResults());
    onOpenChange(false);
  };

  const TokenList = ({ tokens, title }: { tokens: Token[], title: string }) => (
    <div className="space-y-2">
      {tokens.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-2xl mb-2">🔍</div>
          <p>{title === 'Search Results' ? 'No tokens found' : 'Loading trending tokens...'}</p>
        </div>
      ) : (
        <RadioGroup value="" className="space-y-2">
          {tokens.map((token) => (
            <div key={token.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem
                value={token.id}
                id={token.id}
                checked={selectedTokens.has(token.id)}
                onClick={() => handleTokenSelect(token.id)}
              />
              <Label htmlFor={token.id} className="flex items-center space-x-3 flex-1 cursor-pointer">
                <img 
                  src={token.image} 
                  alt={token.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="font-medium text-card-foreground">{token.name}</div>
                  <div className="text-sm text-muted-foreground uppercase">{token.symbol}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-card-foreground">
                    ${token.current_price?.toFixed(6) || 'N/A'}
                  </div>
                  {token.market_cap_rank && (
                    <div className="text-xs text-muted-foreground">
                      Rank #{token.market_cap_rank}
                    </div>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Add Token to Portfolio</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-input border-border text-card-foreground"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="trending" className="data-[state=active]:bg-background">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="search" className="data-[state=active]:bg-background" disabled={searchResults.length === 0}>
                <Search className="w-4 h-4 mr-2" />
                Search Results
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="trending" className="max-h-96 overflow-y-auto">
              <TokenList tokens={trending} title="Trending Tokens" />
            </TabsContent>
            
            <TabsContent value="search" className="max-h-96 overflow-y-auto">
              <TokenList tokens={searchResults} title="Search Results" />
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {selectedTokens.size} token{selectedTokens.size !== 1 ? 's' : ''} selected
            </p>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddTokens}
                disabled={selectedTokens.size === 0}
                className="portfolio-gradient"
              >
                Add to Watchlist
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTokenModal;