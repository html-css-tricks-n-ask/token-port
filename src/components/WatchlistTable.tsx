import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { updateHoldings, removeToken } from '../store/slices/portfolioSlice';
import Sparkline from './Sparkline';

const WatchlistTable = () => {
  const dispatch = useAppDispatch();
  const { tokens } = useAppSelector((state) => state.portfolio);
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [holdingsInput, setHoldingsInput] = useState<string>('');

  const handleEditHoldings = (tokenId: string, currentHoldings: number) => {
    setEditingToken(tokenId);
    setHoldingsInput(currentHoldings.toString());
  };

  const handleSaveHoldings = (tokenId: string) => {
    const holdings = parseFloat(holdingsInput) || 0;
    dispatch(updateHoldings({ tokenId, holdings }));
    setEditingToken(null);
    setHoldingsInput('');
  };

  const handleCancelEdit = () => {
    setEditingToken(null);
    setHoldingsInput('');
  };

  const handleRemoveToken = (tokenId: string) => {
    dispatch(removeToken(tokenId));
  };

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatValue = (value: number) => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0;
    return (
      <span className={`font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
        {isPositive ? '+' : ''}{percentage.toFixed(2)}%
      </span>
    );
  };

  if (tokens.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <div className="text-4xl mb-4">🚀</div>
        <h3 className="text-lg font-semibold text-card-foreground mb-2">Start Your Portfolio</h3>
        <p className="text-muted-foreground mb-4">
          Add your first token to begin tracking your crypto portfolio
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="text-muted-foreground font-medium">Token</TableHead>
            <TableHead className="text-muted-foreground font-medium">Price</TableHead>
            <TableHead className="text-muted-foreground font-medium">24h %</TableHead>
            <TableHead className="text-muted-foreground font-medium">Sparkline (7d)</TableHead>
            <TableHead className="text-muted-foreground font-medium">Holdings</TableHead>
            <TableHead className="text-muted-foreground font-medium">Value</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token) => (
            <TableRow key={token.id} className="border-border hover:bg-muted/30">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <img 
                    src={token.image} 
                    alt={token.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-card-foreground">{token.name}</div>
                    <div className="text-sm text-muted-foreground uppercase">{token.symbol}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium text-card-foreground">
                {formatPrice(token.current_price)}
              </TableCell>
              <TableCell>
                {formatPercentage(token.price_change_percentage_24h)}
              </TableCell>
              <TableCell>
                <Sparkline 
                  data={token.sparkline_in_7d?.price || []}
                  isPositive={token.price_change_percentage_24h >= 0}
                />
              </TableCell>
              <TableCell>
                {editingToken === token.id ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={holdingsInput}
                      onChange={(e) => setHoldingsInput(e.target.value)}
                      className="w-20 h-8"
                      step="0.000001"
                      min="0"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveHoldings(token.id)}
                      className="h-8 px-2"
                    >
                      ✓
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="h-8 px-2"
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditHoldings(token.id, token.holdings)}
                    className="text-card-foreground hover:text-primary transition-colors font-medium flex items-center space-x-1"
                  >
                    <span>{token.holdings.toLocaleString()}</span>
                    <Edit3 className="w-3 h-3 opacity-50" />
                  </button>
                )}
              </TableCell>
              <TableCell className="font-medium text-card-foreground">
                {formatValue(token.current_price * token.holdings)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem
                      onClick={() => handleEditHoldings(token.id, token.holdings)}
                      className="hover:bg-muted cursor-pointer"
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit Holdings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRemoveToken(token.id)}
                      className="text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Token
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WatchlistTable;