import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { fetchHistory } from "@/services/blockchain";
import type { Transaction } from "@/components/TransactionListUtils";

export function useHistory() {
  const { address } = useAccount();

  return useQuery<Transaction[], Error>({
    queryKey: ["history", address],
    queryFn: () => address ? fetchHistory(address) : Promise.resolve([]),
    enabled: !!address,
    refetchInterval: 30_000, // 30 s – suficiente p/ demo
  });
}
