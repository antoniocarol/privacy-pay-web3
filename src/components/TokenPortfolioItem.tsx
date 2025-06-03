import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SupportedToken } from '@/config/tokens';
import { TokenIcon } from './TokenIcon';
import { formatUnits } from 'viem';
import { TrendingUp } from 'lucide-react'; // Importar o ícone
// import Chart from 'react-apexcharts'; // Importaremos quando formos usar o gráfico

interface TokenPortfolioItemProps {
  token: SupportedToken;
  privateBalance: string; // Saldo privado em unidades menores (wei, satoshi)
  usdPrice: number; // Preço atual em USD
  // chartData?: number[]; // Dados para o mini-gráfico (opcional por enquanto)
  index: number;
}

export const TokenPortfolioItem: React.FC<TokenPortfolioItemProps> = ({
  token,
  privateBalance,
  usdPrice,
  // chartData,
  index,
}) => {
  const balanceFormatted = formatUnits(BigInt(privateBalance), token.decimals);
  const usdValue = parseFloat(balanceFormatted) * usdPrice;

  const [isHovered, setIsHovered] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow); // Re-check on resize
    return () => window.removeEventListener('resize', checkOverflow);
  }, [token.name]);

  // Configurações básicas para o sparkline (serão ajustadas)
  // const sparklineOptions: ApexCharts.ApexOptions = {
  //   chart: {
  //     type: 'area',
  //     sparkline: {
  //       enabled: true,
  //     },
  //     animations: {
  //       enabled: false,
  //     }
  //   },
  //   stroke: {
  //     curve: 'smooth',
  //     width: 2,
  //     colors: [usdValue >= (parseFloat(balanceFormatted) * (usdPrice * 0.99)) ? '#34D399' : '#F87171'], // Verde para alta/estável, vermelho para baixa
  //   },
  //   fill: {
  //     opacity: 0.3,
  //     colors: [usdValue >= (parseFloat(balanceFormatted) * (usdPrice * 0.99)) ? '#34D399' : '#F87171'],
  //   },
  //   yaxis: {
  //     min: 0,
  //   },
  //   tooltip: {
  //     enabled: false,
  //   },
  //   colors: ['#34D399']
  // }; 

  // const series = chartData ? [{ name: 'Price', data: chartData }] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white/5 p-4 rounded-lg border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors duration-150 min-h-[90px] h-full space-x-2 md:space-x-3"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-2 md:space-x-3 flex-shrink min-w-0">
        <TokenIcon token={token} size="md" />
        <div 
          ref={containerRef}
          className="max-w-[90px] md:max-w-[110px] overflow-hidden"
        >
          <motion.p
            ref={textRef}
            className="text-sm font-medium text-white whitespace-nowrap"
            title={token.name}
            animate={isOverflowing && isHovered ? { x: [0, -(textRef.current!.scrollWidth - containerRef.current!.clientWidth), 0], transition: { duration: (textRef.current!.scrollWidth / 30), repeat: Infinity, ease: "linear", repeatDelay: 0.5 } } : 
                     isOverflowing ? { x: [0, -(textRef.current!.scrollWidth - containerRef.current!.clientWidth), 0], transition: { duration: (textRef.current!.scrollWidth / 50), repeat: Infinity, ease: "linear", repeatDelay: 1 } } : 
                     { x: 0 }}
          >
            {token.name}
          </motion.p>
        </div>
      </div>

      <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0 mx-1 text-white/30">
        <TrendingUp size={28} strokeWidth={1.5} /> {/* Ícone como placeholder */}
      </div>

      <div className="text-left flex-1 min-w-[90px] md:min-w-[100px] overflow-hidden">
        <p 
          className="text-sm font-medium text-white truncate"
          title={`${balanceFormatted} P-${token.symbol}`}
        >
          {balanceFormatted} <span className="text-xs opacity-80">P-{token.symbol}</span>
        </p>
        <p 
          className="text-xs text-white/70 truncate"
          title={`$${usdValue.toFixed(2)} USD`}
        >
          ${usdValue.toFixed(2)} <span className="opacity-80">USD</span>
        </p>
      </div>
    </motion.div>
  );
}; 