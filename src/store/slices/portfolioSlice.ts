import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Token {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
  holdings: number;
  market_cap_rank?: number;
}

interface PortfolioState {
  tokens: Token[];
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  totalValue: number;
  searchResults: Token[];
  trending: Token[];
}

const initialState: PortfolioState = {
  tokens: [],
  loading: false,
  error: null,
  lastUpdated: 0,
  totalValue: 0,
  searchResults: [],
  trending: [],
};

// Load portfolio from localStorage
const loadFromStorage = (): Token[] => {
  try {
    const saved = localStorage.getItem('portfolio');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save portfolio to localStorage
const saveToStorage = (tokens: Token[]) => {
  try {
    localStorage.setItem('portfolio', JSON.stringify(tokens));
  } catch (error) {
    console.error('Failed to save portfolio to localStorage:', error);
  }
};

// Fetch token prices and data
export const fetchTokenPrices = createAsyncThunk(
  'portfolio/fetchTokenPrices',
  async (tokenIds: string[]) => {
    if (tokenIds.length === 0) return [];
    
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets`,
      {
        params: {
          vs_currency: 'usd',
          ids: tokenIds.join(','),
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
          sparkline: true,
          price_change_percentage: '24h',
        },
      }
    );
    return response.data;
  }
);

// Search tokens
export const searchTokens = createAsyncThunk(
  'portfolio/searchTokens',
  async (query: string) => {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/search`,
      {
        params: { query },
      }
    );
    
    // Get detailed data for search results
    const coinIds = response.data.coins.slice(0, 20).map((coin: any) => coin.id);
    if (coinIds.length === 0) return [];
    
    const detailResponse = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets`,
      {
        params: {
          vs_currency: 'usd',
          ids: coinIds.join(','),
          order: 'market_cap_desc',
          per_page: 20,
          page: 1,
          sparkline: false,
        },
      }
    );
    
    return detailResponse.data.map((token: any) => ({
      ...token,
      holdings: 0,
    }));
  }
);

// Fetch trending tokens
export const fetchTrending = createAsyncThunk(
  'portfolio/fetchTrending',
  async () => {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/search/trending'
    );
    
    const coinIds = response.data.coins.slice(0, 10).map((coin: any) => coin.item.id);
    
    const detailResponse = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets`,
      {
        params: {
          vs_currency: 'usd',
          ids: coinIds.join(','),
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
          sparkline: false,
        },
      }
    );
    
    return detailResponse.data.map((token: any) => ({
      ...token,
      holdings: 0,
    }));
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState: {
    ...initialState,
    tokens: loadFromStorage(),
  },
  reducers: {
    addToken: (state, action: PayloadAction<Token>) => {
      const existingToken = state.tokens.find(t => t.id === action.payload.id);
      if (!existingToken) {
        state.tokens.push({ ...action.payload, holdings: 0 });
        saveToStorage(state.tokens);
      }
    },
    removeToken: (state, action: PayloadAction<string>) => {
      state.tokens = state.tokens.filter(t => t.id !== action.payload);
      saveToStorage(state.tokens);
    },
    updateHoldings: (state, action: PayloadAction<{ tokenId: string; holdings: number }>) => {
      const token = state.tokens.find(t => t.id === action.payload.tokenId);
      if (token) {
        token.holdings = action.payload.holdings;
        saveToStorage(state.tokens);
      }
    },
    calculateTotalValue: (state) => {
      state.totalValue = state.tokens.reduce(
        (total, token) => total + (token.current_price * token.holdings),
        0
      );
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokenPrices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTokenPrices.fulfilled, (state, action) => {
        state.loading = false;
        state.lastUpdated = Date.now();
        
        // Update existing tokens with new price data
        action.payload.forEach((newToken: any) => {
          const existingToken = state.tokens.find(t => t.id === newToken.id);
          if (existingToken) {
            existingToken.current_price = newToken.current_price;
            existingToken.price_change_percentage_24h = newToken.price_change_percentage_24h;
            existingToken.sparkline_in_7d = newToken.sparkline_in_7d;
            existingToken.image = newToken.image;
          }
        });
        
        // Calculate new total value
        portfolioSlice.caseReducers.calculateTotalValue(state);
        saveToStorage(state.tokens);
      })
      .addCase(fetchTokenPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch token prices';
      })
      .addCase(searchTokens.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.trending = action.payload;
      });
  },
});

export const { addToken, removeToken, updateHoldings, calculateTotalValue, clearSearchResults } = portfolioSlice.actions;
export default portfolioSlice.reducer;