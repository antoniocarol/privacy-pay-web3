export interface SupportedToken {
  symbol: string;
  name: string;
  decimals: number;
  address: `0x${string}`;
  isPrivate: boolean;
  isNative?: boolean;
  erc20?: `0x${string}`;
  converter?: `0x${string}`;
}

export const TOKENS: SupportedToken[] = [
  {
    symbol: 'EERC',
    name: 'Enhanced ERC20',
    decimals: 18,
    address: '0x5425890298aed601595a70AB815c96711a31Bc65' as `0x${string}`, // Endereço do contrato EERC20 na Fuji
    isPrivate: true,
    isNative: false,
    erc20: '0x5425890298aed601595a70AB815c96711a31Bc65' as `0x${string}`, // Mesmo endereço do EERC20
    converter: '0x5425890298aed601595a70AB815c96711a31Bc65' as `0x${string}` // Mesmo endereço do EERC20
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3' as `0x${string}`, // Endereço do USDC na Fuji
    isPrivate: true,
    isNative: false,
    erc20: '0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3' as `0x${string}`, // Mesmo endereço do USDC
    converter: '0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3' as `0x${string}` // Mesmo endereço do USDC
  }
]; 