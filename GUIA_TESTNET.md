# Guia para Testar o PrivacyPay na Avalanche Fuji Testnet

Este guia vai ajudá-lo a configurar e testar o PrivacyPay usando a testnet Avalanche Fuji, permitindo transações privadas de verdade entre carteiras.

## Pré-requisitos

1. **Carteira MetaMask ou Core Wallet** com pelo menos duas contas configuradas
2. **AVAX de testnet** obtidos através da faucet da Avalanche
3. **Node.js** e **npm** instalados na sua máquina
4. **Chave privada** de pelo menos uma conta para fazer o deploy do contrato

## Passo 1: Obter AVAX de Testnet

1. Adicione a rede Avalanche Fuji em sua carteira:
   - **Nome**: Avalanche Fuji 
   - **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
   - **Chain ID**: 43113
   - **Símbolo**: AVAX
   - **Explorer**: https://testnet.snowtrace.io/

2. Obtenha AVAX de teste através da faucet oficial:
   - Acesse https://faucet.avax.network/
   - Insira seu endereço público
   - Solicite os fundos (você deve receber pelo menos 2 AVAX)

## Passo 2: Configurar o Ambiente

1. Configure o arquivo `.env` com as informações necessárias:
   ```
   VITE_WALLET_CONNECT_PROJECT_ID=e10333aeca6f729cab99cf36d9ac5927
   VITE_CONTRACT_ADDRESS=endereco_sera_adicionado_apos_deploy
   VITE_USE_REAL_CONTRACT=true

   # Descomente e adicione sua chave privada (NUNCA compartilhe este arquivo)
   PRIVATE_KEY=0xSuaChavePrivadaAqui
   ```

## Passo 3: Deploy do Contrato

1. Instale as dependências necessárias:
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
   ```

2. Faça o deploy do contrato na rede Fuji:
   ```bash
   npx hardhat run scripts/deploy_converter.js --network fuji
   ```

3. Depois do deploy bem-sucedido, você verá o endereço do contrato no terminal. Copie esse endereço.

4. Atualize o arquivo `.env` com o endereço do contrato:
   ```
   VITE_CONTRACT_ADDRESS=0xEnderecoDoContratoGerado
   ```

## Passo 4: Interagir com o Contrato

1. O contrato EERC20Converter usa WAVAX (Wrapped AVAX) como token subjacente

2. Para usar o PrivacyPay, você precisa:
   - Ter AVAX comum na sua carteira
   - Converter para WAVAX usando outro contrato ou DEX (como Trader Joe na testnet)
   - Ou pegar WAVAX direto do contrato na Fuji: `0xd00ae08403B9bbb9124bB305C09058E32C39A48c`

3. Você pode obter WAVAX diretamente depositando AVAX no contrato WAVAX:
   - Vá ao explorador testnet: https://testnet.snowtrace.io/address/0xd00ae08403B9bbb9124bB305C09058E32C39A48c#writeContract
   - Conecte sua carteira
   - Use a função "deposit" e envie alguns AVAX (por exemplo 0.5 AVAX)

## Passo 5: Testar Recursos de Privacidade

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Conecte sua primeira carteira na aplicação

3. Teste o fluxo completo:
   - **Shield**: Proteja alguns tokens tornando-os privados (será solicitada aprovação seguida da transação shield)
   - **Exportar notas**: Exporte suas notas privadas (serão criptografadas e copiadas para seu clipboard)
   - **Conectar outra conta**: Desconecte sua primeira carteira e conecte a segunda
   - **Importar notas**: Importe as notas que foram exportadas anteriormente
   - **Transferência privada**: Faça uma transferência privada para qualquer endereço
   - **Unshield**: Recupere os tokens para forma pública novamente

4. Verifique a privacidade:
   - Acesse https://testnet.snowtrace.io/ e busque por seu endereço
   - Observe que as transações privadas não mostram valores nem destinatários
   - Apenas os eventos Shield, PrivateTransfer e Unshield são visíveis
   - Os dados sensíveis estão protegidos pelos commitments/nullifiers

## Problemas Comuns

1. **Erro "gas estimation failed"**: 
   - Provavelmente você não tem WAVAX suficiente ou não aprovou o contrato EERC20Converter para usar seus tokens

2. **Erro "underlying zeroAddress"**:
   - O endereço do token WAVAX está incorreto no script de deploy

3. **Notas privadas não aparecem**:
   - Verifique se está usando o mesmo navegador e se não limpou o localStorage

## Próximos Passos para Produção

- Implementar verificações ZK-SNARK completas
- Desenvolver um sistema de relayer para aumentar privacidade
- Fazer auditoria de segurança do código
- Implementar mecanismos de recuperação mais robustos

---

Lembre-se: Esta é uma implementação para testnet. Para uso em produção, seria necessária uma revisão de segurança completa e a implementação de técnicas mais avançadas de privacidade, como um sistema de relayer anônimo. 