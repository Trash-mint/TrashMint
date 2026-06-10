import {
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Contract,
  Keypair,
  Address,
  nativeToScVal,
} from "@stellar/stellar-sdk";

const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC || "https://soroban-testnet.stellar.org";
const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ID!;
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY!;

/** Server-side mint: uses admin keypair to sign and submit */
export async function mintReward(recipientAddress: string, amount: bigint): Promise<string> {
  const rpc = new SorobanRpc.Server(RPC_URL, { allowHttp: false });
  const adminKeypair = Keypair.fromSecret(ADMIN_SECRET);
  const adminAddress = adminKeypair.publicKey();

  const account = await rpc.getAccount(adminAddress);
  const contract = new Contract(TOKEN_CONTRACT);

  const toVal = Address.fromString(recipientAddress).toScVal();
  const amountVal = nativeToScVal(amount, { type: "i128" });

  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK })
    .addOperation(contract.call("mint", toVal, amountVal))
    .setTimeout(30)
    .build();

  const prepared = await rpc.prepareTransaction(tx);
  prepared.sign(adminKeypair);

  const result = await rpc.sendTransaction(prepared);
  if (result.status === "ERROR") throw new Error(`Mint failed: ${JSON.stringify(result.errorResult)}`);

  // Poll
  let response = await rpc.getTransaction(result.hash);
  let tries = 0;
  while (response.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND && tries < 20) {
    await new Promise((r) => setTimeout(r, 2000));
    response = await rpc.getTransaction(result.hash);
    tries++;
  }
  if (response.status !== SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Mint tx failed: ${response.status}`);
  }
  return result.hash;
}
