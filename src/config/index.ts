const CONVERTER_ADDR = (import.meta as any).env.VITE_CONTRACT_ADDRESS as `0x${string}`;

if (!CONVERTER_ADDR) {
  console.warn('⚠️  VITE_CONTRACT_ADDRESS não definido no .env – funcionalidades blockchain indisponíveis');
}

export { CONVERTER_ADDR }; 