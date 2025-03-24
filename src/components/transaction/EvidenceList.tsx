import { useState, useEffect } from 'react';
import { safeLoadIPFS } from '../../lib/kleros';
import { formatAddress } from '../../lib/kleros';

interface Evidence {
  title: string;
  description: string;
  fileURI?: string;
  submitter: string;
}

interface EvidenceListProps {
  evidences: Array<{
    _party: string;
    _evidence: string;
    blockNumber: string;
    transactionHash: string;
  }>;
}

const EvidenceList = ({ evidences }: EvidenceListProps) => {
  const [loadedEvidences, setLoadedEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvidenceData = async () => {
      try {
        const evidencePromises = evidences.map(async (evidence) => {
          const data = await safeLoadIPFS(evidence._evidence);
          return {
            title: data.name || 'Untitled Evidence',
            description: data.description || 'No description provided',
            fileURI: data.fileURI,
            submitter: evidence._party
          };
        });

        const loadedData = await Promise.all(evidencePromises);
        setLoadedEvidences(loadedData);
      } catch (error) {
        console.error('Error loading evidence:', error);
      } finally {
        setLoading(false);
      }
    };

    if (evidences.length > 0) {
      loadEvidenceData();
    } else {
      setLoading(false);
    }
  }, [evidences]);

  if (loading) {
    return (
      <div className="mt-6 border-t border-violet-500/20 pt-6">
        <h3 className="text-lg font-semibold text-violet-100 mb-4">Evidence</h3>
        <p className="text-violet-300/70">Loading evidence...</p>
      </div>
    );
  }

  if (loadedEvidences.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-violet-500/20 pt-6">
      <h3 className="text-lg font-semibold text-violet-100 mb-4">Evidences</h3>
      <div className="space-y-4">
        {loadedEvidences.map((evidence, index) => (
          <div key={index} className="bg-violet-900/20 border border-violet-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-violet-100">{evidence.title}</h4>
              <span className="text-sm text-violet-300/70">
                Submitted by {formatAddress(evidence.submitter)}
              </span>
            </div>
            <p className="text-violet-300 text-sm mb-2">{evidence.description}</p>
            {evidence.fileURI && (
              <a
                href={`https://ipfs.kleros.io${evidence.fileURI}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 transition-colors text-sm inline-flex items-center"
              >
                View Attachment
                <svg
                  className="w-4 h-4 ml-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvidenceList; 