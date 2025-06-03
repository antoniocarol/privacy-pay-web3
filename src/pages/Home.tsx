import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Shield, Cpu, Lightbulb } from 'lucide-react';
import Button from '@/components/Button';

// Variantes para animações de container e item
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

// Novas variantes para a animação do título palavra por palavra
const titleContainerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: i * 0.04 }, // Atraso entre palavras
  }),
};

const titleWordVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    transition: { type: "spring", damping: 12, stiffness: 200 },
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", damping: 12, stiffness: 200 },
  },
};

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  const pageTitle = t("PrivacyPay: Sua Liberdade Financeira na Web3");
  const titleWords = pageTitle.split(" ");

  return (
    <motion.div 
      className="min-h-screen text-white flex flex-col items-center justify-center p-4 md:p-8 text-center overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <motion.section 
        className="w-full max-w-4xl mb-16 md:mb-24"
        variants={itemVariants}
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-pink-500 to-orange-500"
          variants={titleContainerVariants}
          initial="hidden"
          animate="visible"
          aria-label={pageTitle}
        >
          {titleWords.map((word, index) => (
            <motion.span 
              key={index} 
              variants={titleWordVariants}
              style={{ display: 'inline-block', marginRight: '0.25em' }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          {t("Transações 100% anônimas e seguras na blockchain Avalanche. Deposite, envie e saque seus ativos com privacidade total, utilizando a força dos ZK-SNARKs.")}
        </motion.p>
        <motion.div 
          className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
          variants={itemVariants}
        >
          <motion.div variants={itemVariants}>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleNavigateToDashboard}
            >
              {t("Acessar Carteira Privada")}
            </Button>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t("Saiba Mais")}
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features-section" 
        className="w-full max-w-5xl mb-16 md:mb-24"
        variants={containerVariants}
      >
        <motion.h2 className="text-3xl md:text-4xl font-bold mb-12 text-white" variants={itemVariants}>
          {t("Por que PrivacyPay?")}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[ 
            { title: t("Anonimato Total"), description: t("Seus dados e transações são protegidos com criptografia de ponta."), icon: <Shield size={36} className="text-primary" /> },
            { title: t("Tecnologia ZK"), description: t("Utilizamos ZK-SNARKs para garantir privacidade sem comprometer a segurança."), icon: <Cpu size={36} className="text-primary" /> },
            { title: t("Fácil de Usar"), description: t("Uma interface intuitiva para gerenciar seus ativos privados sem complicações."), icon: <Lightbulb size={36} className="text-primary" /> },
          ].map(feature => (
            <motion.div 
              key={feature.title} 
              className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg"
              variants={itemVariants}
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px rgba(255,255,255,0.1)" }}
            >
              <motion.div className="mb-4 flex justify-center items-center" variants={itemVariants}>{feature.icon}</motion.div>
              <motion.h3 className="text-xl font-semibold mb-2 text-white" variants={itemVariants}>{feature.title}</motion.h3>
              <motion.p className="text-white/70 text-sm" variants={itemVariants}>{feature.description}</motion.p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="w-full max-w-4xl py-12 bg-gradient-to-r from-primary/80 via-pink-500/80 to-orange-500/80 rounded-xl shadow-2xl"
        variants={itemVariants}
      >
        <motion.h2 className="text-3xl md:text-4xl font-bold mb-6 text-white" variants={itemVariants}>
          {t("Pronto para o Futuro da Privacidade?")}
        </motion.h2>
        <motion.p className="text-lg text-white/90 mb-8 max-w-xl mx-auto" variants={itemVariants}>
          {t("Junte-se à revolução das finanças descentralizadas com a segurança e o anonimato que você merece.")}
        </motion.p>
        <motion.div variants={itemVariants}>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleNavigateToDashboard} 
            className="px-10 py-4"
          >
            {t("Comece Agora")}
          </Button>
        </motion.div>
      </motion.section>
    </motion.div>
  );
} 