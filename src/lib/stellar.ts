import {
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
  Address,
  nativeToScVal,
  scValToNative,
  Contract,
  Keypair,
  Transaction,
} from "@stellar/stellar-sdk";

const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC || "https://soroban-testnet.stellar.org";
const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

export const rpc = new SorobanRpc.Server(RPC_URL, { allowHttp: false });

export async function buildContractCall(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  sourceAddress: string
): Promise<Transaction> {
  const account = await rpc.getAccount(sourceAddress);
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();
  const prepared = await rpc.prepareTransaction(tx);
  return prepared as Transaction;
}

export async function submitSignedTx(signedXdr: string): Promise<{ hash: string; response: SorobanRpc.Api.GetSuccessfulTransactionResponse }> {
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK);
  const sent = await rpc.sendTransaction(tx);
  if (sent.status === "ERROR") throw new Error(`TX error: ${JSON.stringify(sent.errorResult)}`);
  const { hash } = sent;
  let response = await rpc.getTransaction(hash);
  let tries = 0;
  while (response.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND && tries < 20) {
    await new Promise((r) => setTimeout(r, 2000));
    response = await rpc.getTransaction(hash);
    tries++;
  }
  if (response.status !== SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Transaction failed: ${response.status}`);
  }
  return { hash, response: response as SorobanRpc.Api.GetSuccessfulTransactionResponse };
}

export async function readContract<T>(
  contractId: string,
  method: string,
  args: xdr.ScVal[] = []
): Promise<T> {
  const contract = new Contract(contractId);
  // Use a zero-sequence dummy account for simulation (read-only, never submitted)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dummyAccount = {
    accountId: () => contractId,
    sequenceNumber: () => "0",
    incrementSequenceNumber: () => {},
  } as any;
  const tx = new TransactionBuilder(dummyAccount, { fee: BASE_FEE, networkPassphrase: NETWORK })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();
  const sim = await rpc.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) throw new Error((sim as SorobanRpc.Api.SimulateTransactionErrorResponse).error);
  const result = (sim as SorobanRpc.Api.SimulateTransactionSuccessResponse).result;
  return scValToNative(result!.retval) as T;
}

// Address ScVal helper
export const addressVal = (addr: string) => Address.fromString(addr).toScVal();
export const u32Val = (n: number) => nativeToScVal(n, { type: "u32" });
export const i128Val = (n: bigint) => nativeToScVal(n, { type: "i128" });
export const u64Val = (n: bigint) => nativeToScVal(n, { type: "u64" });
export const stringVal = (s: string) => nativeToScVal(s, { type: "string" });
