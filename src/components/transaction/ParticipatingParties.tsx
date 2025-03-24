import { formatAddress } from '../../lib/kleros';

interface ParticipatingPartiesProps {
  aliases?: Record<string, string>;
}

const ParticipatingParties = ({ aliases }: ParticipatingPartiesProps) => {
  if (!aliases || Object.keys(aliases).length === 0) return null;

  return (
    <div className="mt-6 border-t border-violet-500/20 pt-6">
      <h3 className="text-lg font-semibold text-violet-100 mb-4">Participating Parties</h3>
      <div className="space-y-4">
        {Object.entries(aliases).map(([address, role]) => (
          <div key={role} className="flex items-center">
            <span className="font-medium text-violet-300 mr-2 capitalize">{role}:</span>
            <a
              href={`https://etherscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              {formatAddress(address)}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipatingParties;
