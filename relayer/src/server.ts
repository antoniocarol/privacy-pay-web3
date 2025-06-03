// ============================ server.ts ============================
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z, ZodError } from 'zod';
import { callPrivateTransfer, callUnshield, publicClient } from './signer';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json());

/* ---------------------- helpers ---------------------- */
const hex64 = /^(0x)?[0-9a-fA-F]{64}$/;
const hex40 = /^(0x)?[0-9a-fA-F]{40}$/;
const base64NonEmpty = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const normalize = (s: string) => (s.startsWith('0x') ? s : `0x${s}`);

/* ------------------ Encrypted Note Store (In-Memory) ------------------ */
interface StoredEncryptedNote {
  commitment: string;
  encryptedData: string;
  recipientAddress: string; // Para referência, embora a chave principal do mapa seja o recipientAddress
  timestamp: number;
}
let encryptedNoteStore: Record<string, StoredEncryptedNote[]> = {};


/* --------------------------- Schemas ---------------------------- */
const oldTransferSchema = z.object({ // Renomeado para evitar conflito
  nullifier: z.string().regex(hex64).transform(normalize),
  newCommitment: z.string().regex(hex64).transform(normalize),
  converterAddress: z.string().regex(hex40).transform(normalize),
});

const unshieldSchema = z.object({
  nullifier: z.string().regex(hex64).transform(normalize),
  recipient: z.string().regex(hex40).transform(normalize),
  amount: z.string().regex(/^\d+$/),
  converterAddress: z.string().regex(hex40).transform(normalize),
});

// Novo schema para o endpoint /sendEncryptedNote
const sendEncryptedNoteSchema = z.object({
  recipientWalletAddress: z.string().regex(hex40).transform(normalize),
  encryptedNotePayload: z.string().regex(base64NonEmpty, { message: "Encrypted payload must be a valid Base64 string." }),
  commitmentForRecipient: z.string().regex(hex64).transform(normalize),
  nullifierToSpend: z.string().regex(hex64).transform(normalize),
  converterAddress: z.string().regex(hex40).transform(normalize),
});

// Schema para o endpoint /getEncryptedNotes (parâmetro de query)
const getEncryptedNotesSchema = z.object({
  userWalletAddress: z.string().regex(hex40).transform(normalize),
});


// Endpoint antigo, pode ser deprecado ou mantido para testes sem encriptação
app.post('/privateTransfer', async (req, res) => {
  try {
    const { nullifier, newCommitment, converterAddress } = oldTransferSchema.parse(req.body);
    const hash = await callPrivateTransfer(converterAddress as `0x${string}`, nullifier as any, newCommitment as any);
    res.json({ hash });
  } catch (e) {
    const msg = e instanceof ZodError ? e.issues.map(i => i.message).join('; ') : (e as Error).message;
    console.error('❌ privateTransfer (old)', msg);
    res.status(400).json({ error: msg });
  }
});

// Novo endpoint para lidar com a transferência privada e o armazenamento da nota encriptada
app.post('/sendEncryptedNote', async (req, res) => {
  try {
    const { 
      recipientWalletAddress, 
      encryptedNotePayload, 
      commitmentForRecipient, 
      nullifierToSpend, 
      converterAddress 
    } = sendEncryptedNoteSchema.parse(req.body);

    // 1. Executar a transação on-chain (privateTransfer)
    const txHash = await callPrivateTransfer(
      converterAddress as `0x${string}`,
      nullifierToSpend as `0x${string}`,
      commitmentForRecipient as `0x${string}`
    );

    // 2. Armazenar a nota encriptada se a transação foi enviada (não esperamos o recibo aqui)
    if (!encryptedNoteStore[recipientWalletAddress]) {
      encryptedNoteStore[recipientWalletAddress] = [];
    }
    encryptedNoteStore[recipientWalletAddress].push({
      commitment: commitmentForRecipient,
      encryptedData: encryptedNotePayload,
      recipientAddress: recipientWalletAddress,
      timestamp: Date.now(),
    });
    
    res.json({ hash: txHash });

  } catch (e) {
    const msg = e instanceof ZodError ? e.issues.map(i => i.message).join('; ') : (e as Error).message;
    console.error('❌ sendEncryptedNote', msg, req.body);
    res.status(400).json({ error: msg });
  }
});

// Novo endpoint para o destinatário buscar suas notas encriptadas
app.get('/getEncryptedNotes', (req, res) => {
  try {
    // A validação será feita no userWalletAddress do query params
    const { userWalletAddress } = getEncryptedNotesSchema.parse({ userWalletAddress: req.query.userWalletAddress });

    const notes = encryptedNoteStore[userWalletAddress] || [];
    
    // Para a demo, removemos as notas após serem consultadas para evitar re-entrega.
    // Em um sistema real, pode haver uma flag "lida" ou o cliente gerencia por commitment.
    if (notes.length > 0) {
      delete encryptedNoteStore[userWalletAddress];
    }
    
    res.json({ notes: notes.map(n => ({ commitment: n.commitment, encryptedData: n.encryptedData })) }); // Retorna apenas o necessário

  } catch (e) {
    const msg = e instanceof ZodError ? e.issues.map(i => i.message).join('; ') : (e as Error).message;
    console.error('❌ getEncryptedNotes', msg, req.query);
    res.status(400).json({ error: msg });
  }
});


app.post('/unshield', async (req, res) => {
  try {
    const { nullifier, recipient, amount, converterAddress } = unshieldSchema.parse(req.body);
    const hash = await callUnshield(converterAddress as `0x${string}`, nullifier as any, recipient as any, BigInt(amount));
    res.json({ hash });
  } catch (e) {
    const msg = e instanceof ZodError ? e.issues.map(i => i.message).join('; ') : (e as Error).message;
    console.error('❌ unshield', msg);
    res.status(400).json({ error: msg });
  }
});

app.get('/status/:hash', async (req, res) => {
  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: req.params.hash as `0x${string}`,
    });
    res.json(receipt);
  } catch {
    res.status(404).json({ error: 'tx not found' });
  }
});

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => console.log(`⚡ Relayer listening on :${PORT}`));
