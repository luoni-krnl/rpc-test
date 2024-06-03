import {
  Connection,
  Keypair,
  // LAMPORTS_PER_SOL,
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

  const fromKeypair = Keypair.fromSecretKey(
    Uint8Array.from([
      238, 236, 132, 46, 124, 160, 34, 97, 178, 46, 63, 223, 108, 210, 62, 163,
      246, 38, 181, 130, 102, 164, 142, 81, 197, 115, 137, 237, 217, 224, 200,
      95, 140, 67, 41, 211, 251, 201, 61, 92, 132, 79, 238, 207, 47, 241, 125,
      94, 179, 242, 210, 82, 37, 120, 17, 102, 225, 4, 183, 158, 229, 162, 244,
      186,
    ])
  );
  // const fromKeypair = Keypair.generate();
  const toKeypair = Keypair.generate();

  // const airdropSignature = await connection.requestAirdrop(
  //   fromKeypair.publicKey,
  //   LAMPORTS_PER_SOL
  // );

  // await connection.confirmTransaction(airdropSignature);

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
