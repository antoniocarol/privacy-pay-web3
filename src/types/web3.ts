export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export interface PointsState {
  balance: number;
  isLoading: boolean;
  error: string | null;
}

export interface MintPointsParams {
  amount: number;
  recipient: string;
}

export interface SecretPointsContract {
  balanceOf(address: string): Promise<number>;
  mint(amount: number, encryptedValue: string): Promise<string>;
  decryptBalance(address: string): Promise<number>;
} 