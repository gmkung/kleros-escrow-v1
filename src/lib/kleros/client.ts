import { createKlerosEscrowEthClient, createKlerosEscrowTokenClient } from "kleros-escrow-data-service";
import { ethers } from "ethers";
import { klerosConfig, tokenConfig } from './contracts';

// This is needed to add ethereum property to the Window interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Create read-only clients
export const klerosClient = createKlerosEscrowEthClient(klerosConfig);
export const tokenClient = createKlerosEscrowTokenClient(tokenConfig);

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
    
    // Create both clients with signer
    const ethClient = createKlerosEscrowEthClient(klerosConfig, signer);
    const tokenClient = createKlerosEscrowTokenClient(tokenConfig, signer);
    
    // Debug: Log the structure of the clients to help diagnose issues
    console.log("ETH Client structure:", {
      actions: Object.keys(ethClient.actions || {}),
      transaction: Object.keys(ethClient.actions?.transaction || {}),
      dispute: Object.keys(ethClient.actions?.dispute || {}),
      evidence: Object.keys(ethClient.actions?.evidence || {})
    });
    
    // Ensure all expected methods exist
    if (!ethClient.actions || 
        !ethClient.actions.transaction || 
        !ethClient.actions.dispute || 
        !ethClient.actions.evidence ||
        !ethClient.actions.evidence.submitEvidence) {
      console.error("Missing expected methods in eth client:", ethClient);
      throw new Error("The ETH client is missing expected methods. Please check console for details.");
    }
    
    return { ethClient, tokenClient };
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
