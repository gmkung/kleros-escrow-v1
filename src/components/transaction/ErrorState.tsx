
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  error: string | null;
}

const ErrorState = ({ error }: ErrorStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold text-neutral-800 mb-4">Transaction Not Found</h2>
      <p className="text-neutral-600 mb-6">{error || "The transaction you're looking for doesn't exist or has been removed."}</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Back to Transactions
      </button>
    </div>
  );
};

export default ErrorState;
