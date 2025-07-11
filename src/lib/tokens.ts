export interface Token {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  isNative?: boolean;
}

export interface TokenList {
  name: string;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  tokens: Token[];
}

// Hard-coded token list for Ethereum mainnet
// This can be extended to fetch from external sources in the future
const ETHEREUM_TOKENS: Token[] = [
  {
    name: "Ethereum", // Keep original name for backward compatibility
    symbol: "ETH",
    address: "0x0000000000000000000000000000000000000000", // null address for native ETH
    decimals: 18,
    logoURI: "/static/media/eth.33901ab6.png", // Keep original symbolURI for backward compatibility
    chainId: 1,
    isNative: true
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    address: "0xA0b86a33E6441c8E7a0F4f5b48e3E5B22d8C6F0c",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86a33E6441c8E7a0F4f5b48e3E5B22d8C6F0c/logo.png",
    chainId: 1
  },
  {
    name: "Dai Stablecoin",
    symbol: "DAI",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimals: 18,
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
    chainId: 1
  },
  {
    name: "Tether USD",
    symbol: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Correct checksum case
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
    chainId: 1
  },
  {
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    decimals: 8,
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
    chainId: 1
  },
  {
    name: "Wrapped Ether",
    symbol: "WETH",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    decimals: 18,
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    chainId: 1
  },
  {
    name: "Pinakion",
    symbol: "PNK",
    address: "0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d",
    decimals: 18,
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d/logo.png",
    chainId: 1
  }
];

// Token service class with extensible architecture
export class TokenService {
  private tokenList: TokenList;
  private tokenMap: Map<string, Token>;

  constructor() {
    this.tokenList = {
      name: "Kleros Escrow Token List",
      version: { major: 1, minor: 0, patch: 0 },
      tokens: ETHEREUM_TOKENS
    };
    this.tokenMap = new Map(ETHEREUM_TOKENS.map(token => [token.address.toLowerCase(), token]));
  }

  // Get all allowed tokens
  getAllTokens(): Token[] {
    return this.tokenList.tokens;
  }

  // Get token by address
  getTokenByAddress(address: string): Token | undefined {
    return this.tokenMap.get(address.toLowerCase());
  }

  // Get token by symbol
  getTokenBySymbol(symbol: string): Token | undefined {
    return this.tokenList.tokens.find(token => token.symbol.toLowerCase() === symbol.toLowerCase());
  }

  // Check if token is allowed
  isTokenAllowed(address: string): boolean {
    return this.tokenMap.has(address.toLowerCase());
  }

  // Get default token (ETH)
  getDefaultToken(): Token {
    return this.tokenList.tokens.find(token => token.isNative) || this.tokenList.tokens[0];
  }

  // Format token amount for display
  formatTokenAmount(amount: string | number, token: Token): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${numAmount.toFixed(token.decimals <= 6 ? 2 : 4)} ${token.symbol}`;
  }

  // Parse token amount to smallest unit (like Wei for ETH)
  parseTokenAmount(amount: string, token: Token): string {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) throw new Error("Invalid amount");
    
    // Convert to smallest unit
    const multiplier = Math.pow(10, token.decimals);
    return Math.floor(numAmount * multiplier).toString();
  }

  // Format token amount from smallest unit
  formatFromSmallestUnit(amount: string, token: Token): string {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "0";
    
    const divider = Math.pow(10, token.decimals);
    return (numAmount / divider).toString();
  }

  // Future extensibility: Load external token list
  async loadExternalTokenList(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const externalList: TokenList = await response.json();
      
      // Validate and merge tokens
      const validTokens = externalList.tokens.filter(token => 
        token.address && token.symbol && token.name && token.decimals >= 0
      );
      
      // Add new tokens to the existing list
      const newTokens = validTokens.filter(token => 
        !this.tokenMap.has(token.address.toLowerCase())
      );
      
      this.tokenList.tokens.push(...newTokens);
      newTokens.forEach(token => {
        this.tokenMap.set(token.address.toLowerCase(), token);
      });
    } catch (error) {
      console.error("Failed to load external token list:", error);
      throw new Error("Failed to load external token list");
    }
  }

  // Get token metadata for transaction metadata
  getTokenMetadata(token: Token): {
    name: string;
    ticker: string;
    address: string | null;
    decimals: number;
    symbolURI?: string;
  } {
    return {
      name: token.name,
      ticker: token.symbol,
      address: token.isNative ? null : token.address,
      decimals: token.decimals,
      symbolURI: token.logoURI
    };
  }
}

// Create a singleton instance
export const tokenService = new TokenService();

// Export default token list for backwards compatibility
export { ETHEREUM_TOKENS as defaultTokens }; 