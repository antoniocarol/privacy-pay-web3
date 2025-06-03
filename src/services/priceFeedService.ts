import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';

// IDs dos tokens no CoinGecko (verificar se estão corretos e disponíveis)
const TOKEN_IDS = {
  AVAX: 'avalanche-2',
  WAVAX: 'wrapped-avax',
  USDCe: 'usd-coin-avalanche-bridged-usdc-e', // Confirme se este é o ID correto para USDC.e na Avalanche
};

interface PriceData {
  [tokenId: string]: {
    usd: number;
  };
}

/**
 * Busca os preços atuais dos tokens especificados em USD da API do CoinGecko.
 * @returns Uma promessa que resolve para um objeto mapeando o símbolo do token para seu preço em USD.
 *          Retorna um objeto vazio em caso de erro.
 */
export async function fetchTokenPrices(): Promise<Record<string, number>> {
  try {
    const idsToFetch = Object.values(TOKEN_IDS).join(',');
    const response = await axios.get<PriceData>(COINGECKO_API_URL, {
      params: {
        ids: idsToFetch,
        vs_currencies: 'usd',
      },
    });

    const prices: Record<string, number> = {};
    if (response.data) {
      // Mapeia de volta para os símbolos que usamos internamente (AVAX, WAVAX, USDCe)
      if (response.data[TOKEN_IDS.AVAX]) {
        prices['AVAX'] = response.data[TOKEN_IDS.AVAX].usd;
      }
      if (response.data[TOKEN_IDS.WAVAX]) {
        prices['WAVAX'] = response.data[TOKEN_IDS.WAVAX].usd;
      }
      if (response.data[TOKEN_IDS.USDCe]) {
        prices['USDC.e'] = response.data[TOKEN_IDS.USDCe].usd; // Usar 'USDC.e' como chave
      }
    }
    return prices;
  } catch (error) {
    console.error("Erro ao buscar preços dos tokens do CoinGecko:", error);
    return {}; 
  }
} 