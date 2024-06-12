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

  const faasRequests: string[] = ["PE"];

  const hashAndSig = await connection.sendKrnlTransactionRequest(faasRequests);

  console.log({ hashAndSig });

  const fromKeypair = Keypair.fromSecretKey(
    Uint8Array.from([
      175, 242, 193, 162, 71, 138, 145, 247, 230, 225, 88, 215, 28, 196, 28,
      177, 49, 155, 10, 197, 198, 23, 241, 102, 22, 17, 147, 3, 11, 146, 48,
      203, 109, 135, 146, 59, 33, 115, 4, 174, 36, 230, 242, 46, 107, 169, 45,
      81, 79, 137, 14, 139, 30, 30, 224, 94, 175, 81, 212, 71, 86, 240, 189,
      190,
    ])
  );
  // const fromKeypair = Keypair.generate();
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
