# PrivacyPay - Documentação de Implementação

## Visão Geral

O PrivacyPay é uma solução de pagamentos privados e anônimos na blockchain Avalanche, utilizando o padrão eERC20. Este documento descreve os componentes principais do sistema, como implementar uma instância e como utilizar a plataforma.

## Arquitetura do Sistema

### Componentes Principais

1. **Frontend React**: Interface de usuário para interação com o sistema
2. **Smart Contract eERC20Converter**: Contrato Solidity que implementa o padrão eERC20
3. **Sistema de Gerenciamento de Segredos**: Camada para armazenamento e gerenciamento seguro de chaves e notas privadas
4. **Serviço de Criptografia**: Implementação de criptografia AES e funções helper para operações ZK

### Fluxo de Dados

```
┌────────────┐       ┌────────────┐       ┌────────────┐
│   Cliente  │──────▶│  Frontend  │◀─────▶│  Relayer   │
│            │       │  React App │       │  (Futuro)  │
└────────────┘       └───────┬────┘       └──────┬─────┘
                            │                    │
       ┌───────────────────▶│◀───────────────────┘
       │                    ▼
┌──────┴──────┐      ┌────────────┐
│  LocalStore │◀────▶│  Contrato  │
│  (Secrets)  │      │   eERC20   │
└─────────────┘      └────────────┘
```

## Configuração do Ambiente

### Pré-requisitos

- Node.js v18+
- npm ou yarn
- Carteira Web3 (MetaMask, Core Wallet)
- Acesso à rede Avalanche Fuji (testnet) ou Mainnet

### Instalação

1. Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/privacy-pay-web3.git
cd privacy-pay-web3
npm install
```

2. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo .env com os seguintes valores:

```
VITE_CONTRACT_ADDRESS=0xYourContractAddress
VITE_WALLET_CONNECT_PROJECT_ID=YourWalletConnectProjectID
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Smart Contract eERC20Converter

### Funções Principais

- **shield(uint256 amount, bytes32 commitment)** - Depósito de tokens públicos → cria commitment zk-proof
- **privateTransfer(bytes32 nullifier, bytes32 newCommitment)** - Transfere valor dentro do pool privado
- **unshield(bytes32 nullifier, address to, uint256 amount)** - Resgata tokens de volta ao modo público

### Eventos

- **Shield(bytes32 indexed commitment, uint256 amount)**
- **PrivateTransfer(bytes32 indexed nullifier, bytes32 indexed newCommitment)**
- **Unshield(bytes32 indexed nullifier, address indexed to, uint256 amount)**

### Deployment

Para fazer o deployment do contrato na rede Fuji:

```bash
npx hardhat run scripts/deploy_converter.ts --network fuji
```

Certifique-se de configurar as chaves privadas no arquivo hardhat.config.ts:

```typescript
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 43113
    }
  }
};
```

## Implementação Frontend

### Componentes Principais

1. **PrivacyTransactionForm**: Formulário para operações shield/transfer/unshield
2. **PrivateNotes**: Visualizador de notas privadas do usuário
3. **PrivacyDashboard**: Dashboard principal com informações do usuário

### Hooks Personalizados

O sistema utiliza hooks React personalizados para interagir com o contrato:

- **useEERC20**: Gerencie operações shield, transfer, unshield e armazenamento de segredos
- **useCryptoService**: Funções auxiliares para operações criptográficas

## Fluxo de Transação Privada

### Shield (Proteger Tokens)

1. Usuário escolhe o valor para proteger
2. Sistema gera um par (nullifier, secret) aleatório
3. Cria um commitment hash(nullifier, secret, amount)
4. Armazena o commitment localmente com criptografia
5. Envia transação shield para o contrato

### Transfer (Transferir Privadamente)

1. Usuário seleciona nota privada para gastar
2. Escolhe valor e destinatário (opcional)
3. Sistema gera novo commitment para o destinatário
4. Se houver troco, gera commitment adicional para o remetente
5. Envia transação privada via relayer ou diretamente

### Unshield (Recuperar Tokens)

1. Usuário seleciona nota privada para recuperar
2. Escolhe valor para converter em tokens públicos
3. Se houver troco, gera novo commitment para o valor restante
4. Envia transação unshield para o contrato

## Considerações de Segurança

### Gestão de Secrets

- Os nullifiers e segredos são armazenados localmente com criptografia
- Recomenda-se exportar e fazer backup das chaves periodicamente
- Perder o acesso aos segredos significa perder acesso aos fundos privados

### Privacidade

- O sistema atualmente usa armazenamento local criptografado
- Para segurança industrial, exportar/importar segredos deveria usar criptografia de curva elíptica
- Em um sistema de produção, usar serviços de relayer anônimos é recomendado

## Roadmap de Melhorias

1. Implementar sistema completo de Zero-Knowledge Proofs
2. Adicionar relayer descentralizado para transações anônimas
3. Implementar mixer para aumentar privacidade
4. Adicionar novas camadas de segurança para gestão de chaves

## Dicas para Desenvolvedores

### Debugging de Transações Privadas

Para depurar transações privadas, use o evento de emissão do contrato:

```javascript
const contract = getContract();
contract.on("Shield", (commitment, amount) => {
  console.log(`Shield event: ${commitment} - ${amount}`);
});
```

### Extensão da Plataforma

Para adicionar mais tokens e redes, implemente novos contratos EERC20Converter e modifique o arquivo de configuração em `src/config/web3.ts`.

## Conclusão

A PrivacyPay fornece uma solução robusta para transações confidenciais na blockchain Avalanche. O sistema combina criptografia local com transações em blockchain para criar uma experiência de pagamento semelhante ao PayPal, mas com privacidade aprimorada e controle descentralizado.

---

## FAQ

**P: É possível recuperar segredos perdidos?**  
R: Não, se você perder o acesso aos seus segredos locais, não será possível recuperar os fundos associados a eles. Sempre exporte e guarde seus segredos em local seguro.

**P: As transações são realmente privadas?**  
R: O padrão eERC20 da Avalanche fornece privacidade significativa, mas note que este é um projeto em desenvolvimento. Para uso em produção, seriam necessárias mais camadas de segurança.

**P: Quais tokens são suportados?**  
R: Atualmente, o sistema suporta qualquer token ERC-20 na Avalanche que seja passado como parâmetro para o contrato EERC20Converter. 