import { EERC } from "@avalabs/ac-eerc-sdk";
import { generateProofSnarkJs } from "./proofService";
import { SDK_EERC_CIRCUIT_CONFIG } from "@/config/circuits";
import { parseUnits } from "ethers";
import { randomBytes } from "crypto";

const generateRandomBigInt = () => {
  const bytes = randomBytes(32);
  return BigInt('0x' + bytes.toString('hex'));
};

export class EERCService {
  private sdk: any;

  constructor(sdk: any) {
    this.sdk = sdk;
  }

  async withdraw(amount: string, decimals: number, address: string, contractAddress: string) {
    const amountBaseUnit = BigInt(parseUnits(amount, decimals));
    const tokenId = await this.sdk.fetchTokenId(contractAddress);
    const encryptedBalance = await this.sdk.getEncryptedUserBalance(address, tokenId);
    
    const config = SDK_EERC_CIRCUIT_CONFIG.withdraw;
    const { proof, publicInputs } = await generateProofSnarkJs(
      config.wasm,
      config.zkey,
      {
        amount: amountBaseUnit.toString(),
        balance: encryptedBalance.balance.toString(),
        nullifier: generateRandomBigInt().toString()
      }
    );

    return this.sdk.withdraw(
      tokenId,
      [amountBaseUnit],
      encryptedBalance,
      proof.map((p: string) => BigInt(p)),
      publicInputs.map((p: string) => BigInt(p))
    );
  }

  async transfer(amount: string, decimals: number, recipient: string, address: string, contractAddress: string) {
    const amountBaseUnit = BigInt(parseUnits(amount, decimals));
    const tokenId = await this.sdk.fetchTokenId(contractAddress);
    const encryptedBalance = await this.sdk.getEncryptedUserBalance(address, tokenId);
    
    const config = SDK_EERC_CIRCUIT_CONFIG.transfer;
    const { proof, publicInputs } = await generateProofSnarkJs(
      config.wasm,
      config.zkey,
      {
        amount: amountBaseUnit.toString(),
        balance: encryptedBalance.balance.toString(),
        recipient,
        nullifier: generateRandomBigInt().toString()
      }
    );

    return this.sdk.transfer(
      recipient,
      tokenId,
      [amountBaseUnit],
      encryptedBalance,
      proof.map((p: string) => BigInt(p)),
      publicInputs.map((p: string) => BigInt(p))
    );
  }
} 