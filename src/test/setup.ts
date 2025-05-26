import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  writable: true,
});

// Mock do Web3Modal
vi.mock('@web3modal/wagmi/react', () => ({
  Web3Button: () => null,
  createWeb3Modal: vi.fn(),
})); 