import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSecretPoints } from '@/hooks/useSecretPoints';
import { useContract } from '@/services/contract';
import { decrypt } from '@/services/crypto';
import { useAccount } from 'wagmi';
import { createWrapper } from '@/test/test-utils';

// Mock dos módulos
vi.mock('@/services/contract');
vi.mock('@/services/crypto');
vi.mock('wagmi');

describe('useSecretPoints', () => {
  const mockAddress = '0x123...';
  const mockBalance = '100';
  const mockDecryptedBalance = '50';
  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAccount as any).mockReturnValue({ address: mockAddress });
    (useContract as any).mockReturnValue({
      read: {
        balanceOf: vi.fn().mockResolvedValue(mockBalance),
      },
    });
    (decrypt as any).mockResolvedValue(mockDecryptedBalance);
  });

  it('deve retornar o saldo descriptografado quando a wallet está conectada', async () => {
    const { result } = renderHook(() => useSecretPoints(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBe(mockDecryptedBalance);
    }, { timeout: 5000 });

    expect(useContract).toHaveBeenCalled();
    expect(decrypt).toHaveBeenCalledWith(mockBalance, mockAddress);
  });

  it('deve lançar erro quando a wallet não está conectada', async () => {
    (useAccount as any).mockReturnValue({ address: undefined });

    const { result } = renderHook(() => useSecretPoints(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    }, { timeout: 5000 });
  });
}); 