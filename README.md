# PrivacyPay - Anonymous Blockchain Payments

<div align="center">
  <img src="public/privacy-pay-logo.png" alt="PrivacyPay Logo" width="150" height="150" style="border-radius: 20px;" />
  
  <p align="center">
    <strong>The Web3 PayPal - Fully private and anonymous payments using Avalanche's eERC20 standard</strong>
  </p>
</div>

## About the Project

PrivacyPay is a **UI/UX design and frontend prototype** for a decentralized platform that enables completely private digital asset transfers on the Avalanche blockchain. This project serves as the **design foundation and user interface concept** for the [ChainPal project](https://github.com/antoniocarol/EncryptedERC/tree/main/chainpal-functional), providing a modern, intuitive user experience for private Web3 payments.

> **Note**: This is primarily a **UI/UX design project** showcasing how private blockchain payments could look and feel. The actual implementation logic is handled by the [ChainPal backend system](https://github.com/antoniocarol/EncryptedERC/tree/main/chainpal-functional) using EncryptedERC contracts and zero-knowledge proofs.

Using Avalanche's eERC20 token standard and zero-knowledge proof technologies, PrivacyPay ensures that transaction details - including amounts, senders, and recipients - remain completely private.

### Key Features

- **100% Private Transactions**: Send and receive tokens without revealing amounts or addresses on the blockchain
- **User-Friendly Interface**: Modern UX/UI design inspired by traditional fintech applications
- **Shield & Unshield**: Convert public tokens to private and vice versa
- **Private Notes Management**: Secure system for managing cryptographic notes
- **Wallet Compatibility**: Integration with MetaMask, Core Wallet, and other Web3 wallets
- **Responsive Design**: Optimized for desktop and mobile experiences

## Technologies Used

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Web3**: ethers.js, wagmi, viem
- **State Management**: Zustand, React Query
- **Blockchain**: Avalanche C-Chain, eERC20 Standard
- **Security**: Zero-knowledge proofs, advanced AES encryption
- **Design**: Modern fintech-inspired UI components

## Related Projects

This UI/UX project is designed to work with:
- **[ChainPal](https://github.com/antoniocarol/EncryptedERC/tree/main/chainpal-functional)** - The backend implementation with smart contracts and ZK proofs
- **EncryptedERC** - The core smart contract system for private tokens

## Documentation

- [Development Roadmap](./ROADMAP.md) - Current status and implementation plan
- [Implementation Guide](./IMPLEMENTACAO.md) - Technical implementation guide
- [EERC20Converter Contract](./src/contracts/EERC20Converter.sol) - Smart contract for eERC20 conversion

## System Architecture

```
┌────────────┐       ┌────────────┐       ┌────────────┐
│   Client   │──────▶│  Frontend  │◀─────▶│  Relayer   │
│            │       │  React App │       │ (Optional) │
└────────────┘       └───────┬────┘       └──────┬─────┘
                            │                    │
       ┌───────────────────▶│◀───────────────────┘
       │                    ▼
┌──────┴──────┐      ┌────────────┐
│  LocalStore │◀────▶│  eERC20    │
│  (Secrets)  │      │  Contract  │
└─────────────┘      └────────────┘
```

## Privacy Concepts

The system utilizes the following cryptographic concepts:

1. **Shield** - Converts public tokens into private tokens (commitments)
2. **Private Transfer** - Transfers private tokens while maintaining anonymity
3. **Unshield** - Converts private tokens back to public format

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/privacy-pay-web3.git
cd privacy-pay-web3

# Install dependencies
nvm use 21
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Contract Address and WalletConnect ID

# Start development server
npm run dev
```

## Design Philosophy

This project focuses on creating an intuitive, accessible interface for private blockchain transactions. Key design principles include:

- **Familiar UX**: Interface patterns similar to traditional payment apps
- **Privacy First**: Clear visual indicators for private vs public transactions
- **Progressive Disclosure**: Complex cryptographic operations hidden behind simple actions
- **Trust Indicators**: Visual feedback for transaction privacy and security status

## Screenshots

<div align="center">
  <img src="public/screenshots/dashboard.png" alt="PrivacyPay Dashboard" width="80%" />
</div>

## Project Status

🎨 **UI/UX Design**: Complete prototype with modern fintech-inspired interface
🔧 **Frontend Implementation**: React components and Web3 integration
🔗 **Backend Integration**: Designed to work with ChainPal's EncryptedERC system
⚡ **Performance**: Optimized for smooth user experience

## Contributing

This project welcomes contributions, especially in:
- UI/UX improvements and accessibility
- Frontend performance optimizations
- Integration with ChainPal backend
- Mobile responsiveness enhancements

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Developed by [Corin & Pablexx](https://github.com/antoniocarol)

Special thanks to the ChainPal team for the underlying privacy technology.

---

<div align="center">
  <p>
    <strong>⚠️ NOTICE: This is a UI/UX prototype and should not be used in production without proper security audit and backend implementation ⚠️</strong>
  </p>
  
  <p>
    <em>For the actual implementation with smart contracts and cryptographic proofs, see the <a href="https://github.com/antoniocarol/EncryptedERC/tree/main/chainpal-functional">ChainPal project</a></em>
  </p>
</div>
