
import { createKlerosEscrowClient } from "kleros-escrow-data-service";
import { ethers } from "ethers";
import { klerosConfig } from './contracts';

// This is needed to add ethereum property to the Window interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Create a read-only client
export const klerosClient = createKlerosEscrowClient(klerosConfig);

// This function creates a connected client with a signer when needed
export const createSignerClient = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    return createKlerosEscrowClient(klerosConfig, signer);
  }
  throw new Error("Ethereum provider not available");
};

// Safe IPFS Loading
export const safeLoadIPFS = async (uri: string) => {
  try {
    return await klerosClient.services.ipfs.fetchFromIPFS(uri);
  } catch (error) {
    console.error(`Failed to load IPFS content for ${uri}:`, error);
    return {
      title: 'Failed to load',
      description: 'Content unavailable',
      category: 'Unknown',
      amount: '0',
      sender: 'Unknown',
      receiver: 'Unknown',
    };
  }
};
