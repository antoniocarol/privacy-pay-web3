# PrivacyPay - Pagamentos Anônimos na Blockchain

<div align="center">
  <img src="public/privacy-pay-logo.png" alt="PrivacyPay Logo" width="150" height="150" style="border-radius: 20px;" />

  <p align="center">
    <strong>O PayPal da Web3 - Pagamentos totalmente privados e anônimos usando o padrão eERC20 da Avalanche</strong>
  </p>
</div>

## Sobre o Projeto

PrivacyPay é uma plataforma descentralizada que permite transferências completamente privadas de ativos digitais na blockchain Avalanche. Utilizando o padrão de token eERC20 da Avalanche e tecnologias de zero-knowledge proofs, a PrivacyPay garante que os detalhes das transações - incluindo valores, remetentes e destinatários - permaneçam completamente privados.

### Principais Funcionalidades

- **Transações 100% Privadas**: Envie e receba tokens sem revelar valores ou endereços na blockchain
- **Interface Amigável**: UX/UI moderna inspirada em aplicativos de fintech tradicionais
- **Shield & Unshield**: Converta tokens públicos em privados e vice-versa
- **Gestão de Notas Privadas**: Sistema seguro para gerenciamento de notas criptográficas
- **Compatibilidade com Wallets**: Integração com MetaMask, Core Wallet e outras carteiras Web3

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Web3**: ethers.js, wagmi, viem
- **State Management**: Zustand, React Query
- **Blockchain**: Avalanche C-Chain, Padrão eERC20
- **Segurança**: Zero-knowledge proofs, criptografia AES avançada

## Documentação

- [Roadmap de Desenvolvimento](./ROADMAP.md) - Status atual e plano de implementação
- [Documentação de Implementação](./IMPLEMENTACAO.md) - Guia técnico de implementação
- [Contrato EERC20Converter](./src/contracts/EERC20Converter.sol) - Smart contract para conversão eERC20

## Arquitetura do Sistema

```
┌────────────┐       ┌────────────┐       ┌────────────┐
│   Cliente  │──────▶│  Frontend  │◀─────▶│  Relayer   │
│            │       │  React App │       │ (Opcional) │
└────────────┘       └───────┬────┘       └──────┬─────┘
                            │                    │
       ┌───────────────────▶│◀───────────────────┘
       │                    ▼
┌──────┴──────┐      ┌────────────┐
│  LocalStore │◀────▶│  Contrato  │
│  (Secrets)  │      │   eERC20   │
└─────────────┘      └────────────┘
```

## Conceitos de Privacidade

O sistema utiliza os seguintes conceitos criptográficos:

1. **Shield** - Converte tokens públicos em tokens privados (commitments)
2. **Private Transfer** - Transfere tokens privados mantendo o anonimato
3. **Unshield** - Converte tokens privados de volta para o formato público

## Quick Start

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/privacy-pay-web3.git
cd privacy-pay-web3

# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env
# Edite o .env com seu Contract Address e WalletConnect ID

# Inicie o servidor de desenvolvimento
npm run dev
```

## Screenshots

<div align="center">
  <img src="public/screenshots/dashboard.png" alt="PrivacyPay Dashboard" width="80%" />
</div>

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Créditos

Desenvolvido por [Seu Nome/Equipe](https://github.com/seu-usuario)

---

<div align="center">
  <p>
    <strong>⚠️ AVISO: Este projeto está em desenvolvimento e não deve ser usado em produção sem auditoria de segurança adequada ⚠️</strong>
  </p>
</div>
