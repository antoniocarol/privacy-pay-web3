import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMintPoints } from '@/hooks/useMintPoints';
import { useContract } from '@/services/contract';
import { encrypt } from '@/services/crypto';
import { useAccount } from 'wagmi';
import { createWrapper } from '@/test/test-utils';

// Mock dos módulos
vi.mock('@/services/contract');
vi.mock('@/services/crypto');
vi.mock('wagmi');

describe('useMintPoints', () => {
  const mockAddress = '0x123...';
  const mockAmount = '100';
  const mockEncryptedAmount = 'encrypted_100';
  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAccount as any).mockReturnValue({ address: mockAddress });
    (useContract as any).mockReturnValue({
      write: {
        mint: vi.fn().mockResolvedValue({ hash: '0xabc...' }),
      },
    });
    (encrypt as any).mockResolvedValue(mockEncryptedAmount);
  });

  it('deve mintar pontos com sucesso', async () => {
    const { result } = renderHook(() => useMintPoints(), { wrapper });

    await result.current.mutateAsync({ amount: Number(mockAmount), recipient: mockAddress });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 5000 });

    expect(encrypt).toHaveBeenCalledWith(mockAmount, mockAddress);
    expect(useContract().write.mint).toHaveBeenCalledWith({
      args: [mockAddress, mockEncryptedAmount],
    });
  });

  it('deve lançar erro quando a wallet não está conectada', async () => {
    (useAccount as any).mockReturnValue({ address: undefined });

    const { result } = renderHook(() => useMintPoints(), { wrapper });

    try {
      await result.current.mutateAsync({ amount: Number(mockAmount), recipient: mockAddress });
    } catch (error) {
      expect(error).toBeDefined();
    }

    expect(result.current.isError).toBe(true);
  });
}); 