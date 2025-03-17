
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
    <div className="mt-6 border-t border-neutral-200 pt-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Arbitration Question</h3>
      <p className="text-neutral-600">{question}</p>
      
      {rulingOptions && rulingOptions.titles && rulingOptions.titles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-medium text-neutral-800 mb-2">Ruling Options</h4>
          <div className="space-y-3">
            {rulingOptions.titles.map((title: string, index: number) => (
              <div key={`ruling-${index}`} className="bg-neutral-50 rounded-lg p-3">
                <div className="font-medium text-neutral-900">{index + 1}. {title}</div>
                {rulingOptions.descriptions && rulingOptions.descriptions[index] && (
                  <div className="text-sm text-neutral-600 mt-1">{rulingOptions.descriptions[index]}</div>
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
