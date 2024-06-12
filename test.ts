import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as BufferLayout from "@solana/buffer-layout";
import * as borsh from "borsh";
import { createHash } from "crypto";
import dotenv from "dotenv";
dotenv.config();

const programId = new PublicKey("9TRhu4fGB2nPXFGWQUj9sLZdte5bpPucNVcAgLeKXE96");

const allowListAccount = Keypair.fromSecretKey(
  Uint8Array.from([
    89, 46, 93, 63, 161, 1, 242, 90, 173, 64, 51, 254, 222, 17, 176, 112, 18,
    19, 30, 184, 90, 143, 136, 17, 144, 34, 253, 14, 165, 133, 102, 199, 187,
    197, 53, 229, 43, 125, 148, 22, 169, 252, 234, 240, 199, 97, 62, 47, 181,
    21, 90, 41, 163, 175, 9, 77, 121, 175, 121, 155, 95, 220, 38, 232,
  ])
);

interface AllowList {
  discriminator: Uint8Array[];
  length: number;
  allowed_receivers: Uint8Array[];
}

// Define the layout of the AllowList account
const ALLOW_LIST_LAYOUT = BufferLayout.struct<AllowList>([
  BufferLayout.seq(BufferLayout.blob(8), 1, "discriminator"), // The discriminator for Anchor accounts (8 bytes)
  BufferLayout.u32("length"),
  BufferLayout.seq(BufferLayout.blob(32), 10, "allowed_receivers"),
]);

// Function to get the instruction discriminator
function getInstructionDiscriminator(instructionName: string): Buffer {
  const hash = createHash("sha256").update(instructionName).digest();
  return hash.slice(0, 8); // Get the first 8 bytes
}

(async () => {
  const connection = new Connection("http://localhost:8899", "confirmed");

  // const faasRequests: string[] = ["PE"];

  // const hashAndSig = await connection.sendKrnlTransactionRequest(faasRequests);

  // console.log({ hashAndSig });

  // const fromKeypair = Keypair.fromSecretKey(
  //   Uint8Array.from([
  //     238, 236, 132, 46, 124, 160, 34, 97, 178, 46, 63, 223, 108, 210, 62, 163,
  //     246, 38, 181, 130, 102, 164, 142, 81, 197, 115, 137, 237, 217, 224, 200,
  //     95, 140, 67, 41, 211, 251, 201, 61, 92, 132, 79, 238, 207, 47, 241, 125,
  //     94, 179, 242, 210, 82, 37, 120, 17, 102, 225, 4, 183, 158, 229, 162, 244,
  //     186,
  //   ])
  // );
  const fromKeypair = Keypair.generate();
  // const toKeypair = Keypair.generate();

  const airdropSignature = await connection.requestAirdrop(
    fromKeypair.publicKey,
    LAMPORTS_PER_SOL
  );

  await connection.confirmTransaction(airdropSignature);

  // const lamportsToSend = 1_000_000;

  // const transferTransaction = new Transaction({ messages: faasRequests }).add(
  //   SystemProgram.transfer({
  //     fromPubkey: fromKeypair.publicKey,
  //     toPubkey: toKeypair.publicKey,
  //     lamports: lamportsToSend,
  //   })
  // );

  // await sendAndConfirmTransaction(connection, transferTransaction, [
  //   fromKeypair,
  // ]);

  const test = new PublicKey("7JHmX8mUb3M2ugzTfPWsvTLAc8WzefHK5TpQEiqXUgNe");

  const isAllowedDiscriminator = getInstructionDiscriminator("is_allowed");
  const initializeDiscriminator = getInstructionDiscriminator("initialize");
  const addDiscriminator = getInstructionDiscriminator("add_to_allow_list");
  const removeDiscriminator = getInstructionDiscriminator(
    "remove_from_allow_list"
  );

  console.log({
    isAllowedDiscriminator,
    initializeDiscriminator,
    addDiscriminator,
    removeDiscriminator,
  });

  // // Create the instruction data
  // const data = Buffer.concat([isAllowedDiscriminator, test.toBuffer()]);

  // const instruction = new TransactionInstruction({
  //   keys: [
  //     {
  //       pubkey: allowListAccount.publicKey,
  //       isSigner: false,
  //       isWritable: false,
  //     },
  //   ],
  //   programId,
  //   data, // Assuming `0` is the discriminator for `isAllowed`
  // });

  // const transaction = new Transaction().add(instruction);

  // await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);

  // const { value } = await connection.simulateTransaction(
  //   transaction,
  //   [fromKeypair],
  //   [allowListAccount.publicKey]
  // );

  // console.log({ value });

  const accountInfo = await connection.getAccountInfo(
    allowListAccount.publicKey
  );

  console.log(accountInfo);
  if (accountInfo) {
    // Decode the data using BufferLayout
    const data = Buffer.from(accountInfo.data);
    const decodedData = ALLOW_LIST_LAYOUT.decode(data);

    console.log(decodedData.length);

    const allowRecievers = decodedData.allowed_receivers.map(
      (item) => new PublicKey(item)
    );

    console.log(allowRecievers);
  }
})();
