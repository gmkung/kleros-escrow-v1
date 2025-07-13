import { createKlerosEscrowEthClient } from "kleros-escrow-data-service";
import { ethers } from "ethers";
import { klerosConfig } from './contracts';

// This is needed to add ethereum property to the Window interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Create a read-only client
export const klerosClient = createKlerosEscrowEthClient(klerosConfig);

// This function creates a connected client with a signer when needed
export const createSignerClient = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    // Check if the user is connected to the correct network (Ethereum mainnet)
    const provider = new ethers.providers.Web3Provider(window.ethereum, {
      name: 'unknown',
      chainId: 1,
      ensAddress: null // This disables ENS lookups
    });
    
    // Get the current network
    const network = await provider.getNetwork();
    
    // Verify that we're on Ethereum mainnet
    if (network.chainId !== 1) {
      throw new Error(
        `Please connect to Ethereum mainnet. You are currently connected to ${network.name} (chainId: ${network.chainId}).`
      );
    }
    
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    
    // Create the client with signer and verify that all methods exist
    const client = createKlerosEscrowEthClient(klerosConfig, signer);
    
    // Debug: Log the structure of the client to help diagnose issues
    console.log("Client structure:", {
      actions: Object.keys(client.actions || {}),
      transaction: Object.keys(client.actions?.transaction || {}),
      dispute: Object.keys(client.actions?.dispute || {}),
      evidence: Object.keys(client.actions?.evidence || {})
    });
    
    // Ensure all expected methods exist
    if (!client.actions || 
        !client.actions.transaction || 
        !client.actions.dispute || 
        !client.actions.evidence ||
        !client.actions.evidence.submitEvidence) {
      console.error("Missing expected methods in kleros client:", client);
      throw new Error("The Kleros client is missing expected methods. Please check console for details.");
    }
    
    return client;
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

// Function to convert a file to Uint8Array (binary data)
export const fileToBase64 = (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      resolve(buffer);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

// Function to upload evidence to IPFS
export const uploadEvidenceToIPFS = async (
  title: string,
  description: string,
  file?: File
) => {
  try {
    let fileURI = undefined;
    let fileTypeExtension = undefined;
    
    // Upload the file to IPFS if provided
    if (file) {
      const fileData = await fileToBase64(file);
      const cid = await klerosClient.services.ipfs.uploadToIPFS(fileData, file.name);
      // Use the CID directly as it already includes the correct prefix
      fileURI = cid;
      fileTypeExtension = file.name.split('.').pop() || '';
    }
    
    // Create and upload the evidence JSON
    // Note: The Kleros API expects 'name' rather than 'title'
    const evidenceData = {
      name: title, // Using title as name to match API expectations
      description,
      ...(fileURI && { fileURI }),
      ...(fileTypeExtension && { fileTypeExtension })
    };
    
    // The uploadEvidence function may also be returning paths with /ipfs/ prefix
    const evidenceUri = await klerosClient.services.ipfs.uploadEvidence(evidenceData);
    console.log("Evidence URI before return:", evidenceUri);
    return evidenceUri;
  } catch (error) {
    console.error("Error uploading evidence to IPFS:", error);
    throw new Error("Failed to upload evidence to IPFS");
  }
};
