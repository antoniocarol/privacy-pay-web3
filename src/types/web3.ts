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

export interface IProof {
  proof: bigint[];
  publicInputs: bigint[];
}

export interface EncryptedBalance {
  balance: bigint;
  nonce: bigint;
}

export interface EERC {
  fetchTokenId: (tokenAddress: string) => Promise<bigint>;
  getEncryptedUserBalance: (address: string, tokenId: bigint) => Promise<EncryptedBalance>;
  withdraw: (tokenId: bigint, amount: bigint[], balance: EncryptedBalance, proof: bigint[], publicInputs: bigint[]) => Promise<any>;
  transfer: (recipient: string, tokenId: bigint, amount: bigint[], balance: EncryptedBalance, proof: bigint[], publicInputs: bigint[]) => Promise<any>;
} 