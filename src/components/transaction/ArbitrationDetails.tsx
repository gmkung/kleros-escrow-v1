
interface ArbitrationDetailsProps {
  question: string;
  rulingOptions?: {
    titles?: string[];
    descriptions?: string[];
  };
}

const ArbitrationDetails = ({ question, rulingOptions }: ArbitrationDetailsProps) => {
  if (!question) return null;
  
  return (
    <div className="mt-6 border-t border-violet-500/20 pt-6">
      <h3 className="text-lg font-semibold text-violet-100 mb-2">Arbitration Question</h3>
      <p className="text-violet-200/80">{question}</p>
      
      {rulingOptions && rulingOptions.titles && rulingOptions.titles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-medium text-violet-100 mb-2">Ruling Options</h4>
          <div className="space-y-3">
            {rulingOptions.titles.map((title: string, index: number) => (
              <div key={`ruling-${index}`} className="bg-violet-900/30 rounded-lg p-3 border border-violet-500/20">
                <div className="font-medium text-violet-100">{index + 1}. {title}</div>
                {rulingOptions.descriptions && rulingOptions.descriptions[index] && (
                  <div className="text-sm text-violet-200/80 mt-1">{rulingOptions.descriptions[index]}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArbitrationDetails;
