import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Arquivos de tradução (serão criados a seguir)
// Por enquanto, vamos colocar um objeto vazio para evitar erros.
const resources = {
  en: {
    translation: {
      // Chaves de exemplo que usaremos no Header primeiro
      "PrivacyPay": "PrivacyPay",
      "Powered by Avalanche": "Powered by Avalanche",
      "Visão Geral": "Overview",
      "Histórico": "History",
      "Ver App": "View App",
      "Ver Homepage": "View Homepage",
      "Menu": "Menu",

      // Traduções Dashboard.tsx
      "Não foi possível obter a chave pública de encriptação do usuário.": "Could not retrieve user's public encryption key.",
      "É necessário conectar sua carteira para realizar depósitos.": "You must connect your wallet to make deposits.",
      "Rede incorreta. Por favor, troque para Fuji Testnet e tente novamente.": "Incorrect network. Please switch to Fuji Testnet and try again.",
      "Token selecionado atualizado. Por favor, clique em depositar novamente.": "Selected token updated. Please click deposit again.",
      "Depósito (shield) enviado!": "Deposit (shield) sent!",
      "Para usar todas as funcionalidades, é necessário conectar sua carteira.": "To use all features, you need to connect your wallet.",
      "É necessário conectar sua carteira para realizar transações.": "You must connect your wallet to perform transactions.",
      "Por favor, insira um valor de transferência válido.": "Please enter a valid transfer amount.",
      "Por favor, insira um endereço de destinatário válido.": "Please enter a valid recipient address.",
      "Por favor, insira a chave pública de encriptação do destinatário.": "Please enter the recipient's public encryption key.",
      "Token selecionado ou seu conversor não está configurado.": "Selected token or its converter is not configured.",
      "Nenhuma nota privada de {{tokenSymbol}} disponível para enviar. Deposite primeiro.": "No private notes of {{tokenSymbol}} available to send. Deposit first.",
      "Nenhuma nota privada de {{tokenSymbol}} com saldo suficiente para enviar {{amount}} {{tokenSymbol}}. Tente um valor menor.": "No private note of {{tokenSymbol}} with sufficient balance to send {{amount}} {{tokenSymbol}}. Try a smaller amount.",
      "Transferência privada de {{amount}} {{tokenSymbol}} enviada! Hash: {{hash}}": "Private transfer of {{amount}} {{tokenSymbol}} sent! Hash: {{hash}}",
      "Erro ao enviar transferência privada.": "Error sending private transfer.",
      "É necessário conectar sua carteira para realizar saques.": "You must connect your wallet to make withdrawals.",
      "Nenhuma nota de {{tokenSymbol}} disponível para saque.": "No {{tokenSymbol}} notes available for withdrawal.",
      "Iniciando saque de {{amount}} {{tokenSymbol}}...": "Initiating withdrawal of {{amount}} {{tokenSymbol}}...",
      "Saque (unshield) enviado com sucesso!": "Withdrawal (unshield) sent successfully!",
      "Carteira": "Wallet",
      "Enviar": "Send",
      "Privacidade": "Privacy",
      "Portfólio Privado": "Private Portfolio",
      "Privado": "Private",
      "Valor Total Estimado": "Estimated Total Value",
      "Carregando...": "Loading...",
      "Saldo Privado de {{tokenSymbol}}": "Private Balance of {{tokenSymbol}}",
      "Visualizar Saldo de": "View Balance of",
      "Status de privacidade": "Privacy Status",
      "Protegido": "Protected",
      "Depositar": "Deposit",
      "Sacar": "Withdraw",
      "Transferência privada": "Private Transfer",
      "Endereço do destinatário": "Recipient Address",
      "O endereço do destinatário será encriptado": "The recipient's address will be encrypted",
      "Chave Pública de Encriptação do Destinatário": "Recipient's Public Encryption Key",
      "Cole a chave pública Base64 aqui...": "Paste the Base64 public key here...",
      "Necessária para que o destinatário possa decriptar a nota.": "Required for the recipient to decrypt the note.",
      "Token para Enviar": "Token to Send",
      "Quantidade de tokens": "Token Amount",
      "Ex: 10 (Máx: {{maxAmount}})": "Ex: 10 (Max: {{maxAmount}})",
      "Saldo privado de {{tokenSymbol}} disponível: {{balance}}": "Private balance of {{tokenSymbol}} available: {{balance}}",
      "Os valores e destinatários de suas transações são protegidos por tecnologia de encriptação ZK-SNARK": "The amounts and recipients of your transactions are protected by ZK-SNARK encryption technology",
      "Enviar transferência privada": "Send Private Transfer",
      "Status de Privacidade": "Privacy Status",
      "Ativo": "Active",
      "Endereços ocultos": "Hidden Addresses",
      "Valores protegidos": "Protected Amounts",
      "Rotas anonimizadas": "Anonymized Routes",
      "Sua Chave Pública de Encriptação (compartilhe com remetentes):": "Your Public Encryption Key (share with senders):",
      "Chave pública copiada!": "Public key copied!",
      "Copiar": "Copy",
      "Nossa tecnologia ZK-SNARK garante que suas operações fiquem totalmente anônimas na blockchain Avalanche.": "Our ZK-SNARK technology ensures your operations remain completely anonymous on the Avalanche blockchain.",
      "Ver detalhes técnicos": "View technical details",
      "Detalhes técnicos em breve disponíveis": "Technical details available soon",
      "Carteira Privada": "Private Wallet",
      "Sincronizando...": "Syncing...",
      "Sincronizar Notas Recebidas": "Sync Received Notes",
      "Rede:": "Network:",
      "Carteira não conectada": "Wallet not connected",
      "Para garantir privacidade total de suas transações, conecte uma carteira compatível com a rede Avalanche.": "To ensure full privacy of your transactions, connect a wallet compatible with the Avalanche network.",
      "Precisa de ajuda para conectar?": "Need help connecting?",

      // Traduções DepositModal.tsx
      "Por favor, insira uma quantidade válida para depositar.": "Please enter a valid amount to deposit.",
      "Erro ao depositar: {{errorMessage}}": "Error depositing: {{errorMessage}}",
      "Depositar Tokens": "Deposit Tokens",
      "Selecionar Token": "Select Token",
      "Quantidade de {{tokenSymbol}}": "Amount of {{tokenSymbol}}",
      "MAX": "MAX",
      "Porcentagem do Saldo": "Balance Percentage",
      "Saldo disponível: {{balance}} {{tokenSymbol}}": "Available balance: {{balance}} {{tokenSymbol}}",
      "Cancelar": "Cancel",

      // Traduções TransactionList.tsx
      "Nenhuma transação encontrada": "No transactions found",
      "Data:": "Date:",
      "Hash:": "Hash:",
      "Histórico de transações": "Transaction History",
      "Exportar": "Export",
      "Tipo": "Type",
      "Valor": "Amount",
      "Status": "Status",

      // Traduções Button.tsx
      "Processando...": "Processing...",

      // Traduções Home.tsx
      "PrivacyPay: Sua Liberdade Financeira na Web3": "PrivacyPay: Your Financial Freedom in Web3",
      "Transações 100% anônimas e seguras na blockchain Avalanche. Deposite, envie e saque seus ativos com privacidade total, utilizando a força dos ZK-SNARKs.": "100% anonymous and secure transactions on the Avalanche blockchain. Deposit, send, and withdraw your assets with total privacy, using the power of ZK-SNARKs.",
      "Acessar Carteira Privada": "Access Private Wallet",
      "Saiba Mais": "Learn More",
      "Por que PrivacyPay?": "Why PrivacyPay?",
      "Anonimato Total": "Total Anonymity",
      "Seus dados e transações são protegidos com criptografia de ponta.": "Your data and transactions are protected with cutting-edge cryptography.",
      "Tecnologia ZK": "ZK Technology",
      "Utilizamos ZK-SNARKs para garantir privacidade sem comprometer a segurança.": "We use ZK-SNARKs to ensure privacy without compromising security.",
      "Fácil de Usar": "Easy to Use",
      "Uma interface intuitiva para gerenciar seus ativos privados sem complicações.": "An intuitive interface to manage your private assets without complications.",
      "Pronto para o Futuro da Privacidade?": "Ready for the Future of Privacy?",
      "Junte-se à revolução das finanças descentralizadas com a segurança e o anonimato que você merece.": "Join the decentralized finance revolution with the security and anonymity you deserve.",
      "Comece Agora": "Get Started Now",
      "history": {
        "title": "Histórico de Transações",
        "empty": "Nenhuma transação encontrada.",
        "type": {
          "deposit": "Depósito Privado",
          "withdrawal": "Saque Público",
          "sent": "Transferência Enviada",
          "received": "Transferência Recebida"
        },
        "status": {
          "confirmed": "Confirmada",
          "pending": "Pendente",
          "failed": "Falhou",
          "soon": "Em breve"
        },
        "mobile": {
          "dateLabel": "Data:",
          "hashLabel": "Hash:"
        },
        "exportButton": "Exportar",
        "privacyBadge": "Privado",
        "copyTooltip": "Copiar Hash",
        "tableHeader": {
          "type": "Tipo",
          "date": "Data",
          "amount": "Valor",
          "status": "Status",
          "hash": "Hash"
        }
      }
    }
  },
  pt: {
    translation: {
      "PrivacyPay": "PrivacyPay",
      "Powered by Avalanche": "Powered by Avalanche",
      "Visão Geral": "Visão Geral",
      "Histórico": "Histórico",
      "Ver App": "Ver App",
      "Ver Homepage": "Ver Homepage",
      "Menu": "Menu",

      // Traduções Dashboard.tsx
      "Não foi possível obter a chave pública de encriptação do usuário.": "Não foi possível obter a chave pública de encriptação do usuário.",
      "É necessário conectar sua carteira para realizar depósitos.": "É necessário conectar sua carteira para realizar depósitos.",
      "Rede incorreta. Por favor, troque para Fuji Testnet e tente novamente.": "Rede incorreta. Por favor, troque para Fuji Testnet e tente novamente.",
      "Token selecionado atualizado. Por favor, clique em depositar novamente.": "Token selecionado atualizado. Por favor, clique em depositar novamente.",
      "Depósito (shield) enviado!": "Depósito (shield) enviado!",
      "Para usar todas as funcionalidades, é necessário conectar sua carteira.": "Para usar todas as funcionalidades, é necessário conectar sua carteira.",
      "É necessário conectar sua carteira para realizar transações.": "É necessário conectar sua carteira para realizar transações.",
      "Por favor, insira um valor de transferência válido.": "Por favor, insira um valor de transferência válido.",
      "Por favor, insira um endereço de destinatário válido.": "Por favor, insira um endereço de destinatário válido.",
      "Por favor, insira a chave pública de encriptação do destinatário.": "Por favor, insira a chave pública de encriptação do destinatário.",
      "Token selecionado ou seu conversor não está configurado.": "Token selecionado ou seu conversor não está configurado.",
      "Nenhuma nota privada de {{tokenSymbol}} disponível para enviar. Deposite primeiro.": "Nenhuma nota privada de {{tokenSymbol}} disponível para enviar. Deposite primeiro.",
      "Nenhuma nota privada de {{tokenSymbol}} com saldo suficiente para enviar {{amount}} {{tokenSymbol}}. Tente um valor menor.": "Nenhuma nota privada de {{tokenSymbol}} com saldo suficiente para enviar {{amount}} {{tokenSymbol}}. Tente um valor menor.",
      "Transferência privada de {{amount}} {{tokenSymbol}} enviada! Hash: {{hash}}": "Transferência privada de {{amount}} {{tokenSymbol}} enviada! Hash: {{hash}}",
      "Erro ao enviar transferência privada.": "Erro ao enviar transferência privada.",
      "É necessário conectar sua carteira para realizar saques.": "É necessário conectar sua carteira para realizar saques.",
      "Nenhuma nota de {{tokenSymbol}} disponível para saque.": "Nenhuma nota de {{tokenSymbol}} disponível para saque.",
      "Iniciando saque de {{amount}} {{tokenSymbol}}...": "Iniciando saque de {{amount}} {{tokenSymbol}}...",
      "Saque (unshield) enviado com sucesso!": "Saque (unshield) enviado com sucesso!",
      "Carteira": "Carteira",
      "Enviar": "Enviar",
      "Privacidade": "Privacidade",
      "Portfólio Privado": "Portfólio Privado",
      "Privado": "Privado",
      "Valor Total Estimado": "Valor Total Estimado",
      "Carregando...": "Carregando...",
      "Saldo Privado de {{tokenSymbol}}": "Saldo Privado de {{tokenSymbol}}",
      "Visualizar Saldo de": "Visualizar Saldo de",
      "Status de privacidade": "Status de privacidade",
      "Protegido": "Protegido",
      "Depositar": "Depositar",
      "Sacar": "Sacar",
      "Transferência privada": "Transferência privada",
      "Endereço do destinatário": "Endereço do destinatário",
      "O endereço do destinatário será encriptado": "O endereço do destinatário será encriptado",
      "Chave Pública de Encriptação do Destinatário": "Chave Pública de Encriptação do Destinatário",
      "Cole a chave pública Base64 aqui...": "Cole a chave pública Base64 aqui...",
      "Necessária para que o destinatário possa decriptar a nota.": "Necessária para que o destinatário possa decriptar a nota.",
      "Token para Enviar": "Token para Enviar",
      "Quantidade de tokens": "Quantidade de tokens",
      "Ex: 10 (Máx: {{maxAmount}})": "Ex: 10 (Máx: {{maxAmount}})",
      "Saldo privado de {{tokenSymbol}} disponível: {{balance}}": "Saldo privado de {{tokenSymbol}} disponível: {{balance}}",
      "Os valores e destinatários de suas transações são protegidos por tecnologia de encriptação ZK-SNARK": "Os valores e destinatários de suas transações são protegidos por tecnologia de encriptação ZK-SNARK",
      "Enviar transferência privada": "Enviar transferência privada",
      "Status de Privacidade": "Status de Privacidade",
      "Ativo": "Ativo",
      "Endereços ocultos": "Endereços ocultos",
      "Valores protegidos": "Valores protegidos",
      "Rotas anonimizadas": "Rotas anonimizadas",
      "Sua Chave Pública de Encriptação (compartilhe com remetentes):": "Sua Chave Pública de Encriptação (compartilhe com remetentes):",
      "Chave pública copiada!": "Chave pública copiada!",
      "Copiar": "Copiar",
      "Nossa tecnologia ZK-SNARK garante que suas operações fiquem totalmente anônimas na blockchain Avalanche.": "Nossa tecnologia ZK-SNARK garante que suas operações fiquem totalmente anônimas na blockchain Avalanche.",
      "Ver detalhes técnicos": "Ver detalhes técnicos",
      "Detalhes técnicos em breve disponíveis": "Detalhes técnicos em breve disponíveis",
      "Carteira Privada": "Carteira Privada",
      "Sincronizando...": "Sincronizando...",
      "Sincronizar Notas Recebidas": "Sincronizar Notas Recebidas",
      "Rede:": "Rede:",
      "Carteira não conectada": "Carteira não conectada",
      "Para garantir privacidade total de suas transações, conecte uma carteira compatível com a rede Avalanche.": "Para garantir privacidade total de suas transações, conecte uma carteira compatível com a rede Avalanche.",
      "Precisa de ajuda para conectar?": "Precisa de ajuda para conectar?",

      // Traduções DepositModal.tsx
      "Por favor, insira uma quantidade válida para depositar.": "Por favor, insira uma quantidade válida para depositar.",
      "Erro ao depositar: {{errorMessage}}": "Erro ao depositar: {{errorMessage}}",
      "Depositar Tokens": "Depositar Tokens",
      "Selecionar Token": "Selecionar Token",
      "Quantidade de {{tokenSymbol}}": "Quantidade de {{tokenSymbol}}",
      "MAX": "MAX",
      "Porcentagem do Saldo": "Porcentagem do Saldo",
      "Saldo disponível: {{balance}} {{tokenSymbol}}": "Saldo disponível: {{balance}} {{tokenSymbol}}",
      "Cancelar": "Cancelar",

      // Traduções TransactionList.tsx
      "Nenhuma transação encontrada": "Nenhuma transação encontrada",
      "Data:": "Data:",
      "Hash:": "Hash:",
      "Histórico de transações": "Histórico de transações",
      "Exportar": "Exportar",
      "Tipo": "Tipo",
      "Valor": "Valor",
      "Status": "Status",

      // Traduções Button.tsx
      "Processando...": "Processando...",

      // Traduções Home.tsx
      "PrivacyPay: Sua Liberdade Financeira na Web3": "PrivacyPay: Sua Liberdade Financeira na Web3",
      "Transações 100% anônimas e seguras na blockchain Avalanche. Deposite, envie e saque seus ativos com privacidade total, utilizando a força dos ZK-SNARKs.": "Transações 100% anônimas e seguras na blockchain Avalanche. Deposite, envie e saque seus ativos com privacidade total, utilizando a força dos ZK-SNARKs.",
      "Acessar Carteira Privada": "Acessar Carteira Privada",
      "Saiba Mais": "Saiba Mais",
      "Por que PrivacyPay?": "Por que PrivacyPay?",
      "Anonimato Total": "Anonimato Total",
      "Seus dados e transações são protegidos com criptografia de ponta.": "Seus dados e transações são protegidos com criptografia de ponta.",
      "Tecnologia ZK": "Tecnologia ZK",
      "Utilizamos ZK-SNARKs para garantir privacidade sem comprometer a segurança.": "Utilizamos ZK-SNARKs para garantir privacidade sem comprometer a segurança.",
      "Fácil de Usar": "Fácil de Usar",
      "Uma interface intuitiva para gerenciar seus ativos privados sem complicações.": "Uma interface intuitiva para gerenciar seus ativos privados sem complicações.",
      "Pronto para o Futuro da Privacidade?": "Pronto para o Futuro da Privacidade?",
      "Junte-se à revolução das finanças descentralizadas com a segurança e o anonimato que você merece.": "Junte-se à revolução das finanças descentralizadas com a segurança e o anonimato que você merece.",
      "Comece Agora": "Comece Agora",
      "history": {
        "title": "Histórico de Transações",
        "empty": "Nenhuma transação encontrada.",
        "type": {
          "deposit": "Depósito Privado",
          "withdrawal": "Saque Público",
          "sent": "Transferência Enviada",
          "received": "Transferência Recebida"
        },
        "status": {
          "confirmed": "Confirmada",
          "pending": "Pendente",
          "failed": "Falhou",
          "soon": "Em breve"
        },
        "mobile": {
          "dateLabel": "Data:",
          "hashLabel": "Hash:"
        },
        "exportButton": "Exportar",
        "privacyBadge": "Privado",
        "copyTooltip": "Copiar Hash",
        "tableHeader": {
          "type": "Tipo",
          "date": "Data",
          "amount": "Valor",
          "status": "Status",
          "hash": "Hash"
        }
      }
    }
  }
};

i18n
  // Detecta o idioma do navegador do usuário
  .use(LanguageDetector)
  // Passa a instância do i18n para o react-i18next
  .use(initReactI18next)
  // Configurações iniciais do i18n
  .init({
    resources,
    fallbackLng: 'pt', // Idioma padrão se a detecção falhar ou o idioma não for suportado
    debug: process.env.NODE_ENV === 'development', // Habilita logs no console em desenvolvimento
    interpolation: {
      escapeValue: false, // React já faz o escape de XSS
    },
    detection: {
      // Ordem e de onde detectar o idioma
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      // Chaves a serem procuradas no localStorage
      caches: ['i18nextLng'],
    }
  });

export default i18n; 