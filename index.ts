import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  const token = process.env.ACCESS_TOKEN;
  const krnlEndpoint = process.env.KRNL_ENDPOINT as string;
  const krnlWsEndpoint = process.env.KRNL_WS_ENDPOINT as string;

  const connection = new Connection(
    krnlEndpoint,
    { commitment: "confirmed", wsEndpoint: krnlWsEndpoint },
    token
  );

  const faasRequests: string[] = ["KYT", "KYC"];

  const hashAndSig = await connection.sendKrnlTransactionRequest(faasRequests);

  console.log({ hashAndSig });

  const fromKeypair = Keypair.generate();
  const toKeypair = Keypair.generate();

  const airdropSignature = await connection.requestAirdrop(
    fromKeypair.publicKey,
    LAMPORTS_PER_SOL
  );

  await connection.confirmTransaction(airdropSignature);

  const lamportsToSend = 1_000_000;

  const transferTransaction = new Transaction({ messages: faasRequests }).add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toKeypair.publicKey,
      lamports: lamportsToSend,
    })
  );

  await sendAndConfirmTransaction(connection, transferTransaction, [
    fromKeypair,
  ]);
})();
