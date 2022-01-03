import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export const SOLANA_NETWORK = process.env.CLUSTER === 'mainnet' ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet;