import { Connection, clusterApiUrl } from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  const token = process.env.ACCESS_TOKEN;
  const krnlValidator = process.env.KRNL_VALIDATOR as string;

  const connection = new Connection(krnlValidator, "confirmed", token);

  const faasRequests: string[] = ["KYT", "KYC"];

  const hashAndSig = await connection.sendKrnlTransactionRequest(faasRequests);

  console.log({ hashAndSig });
})();
