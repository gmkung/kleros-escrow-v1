import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full py-4 px-6 transition-all duration-300 ${scrolled
        ? 'bg-tron-dark backdrop-blur-md border-b border-violet-500/20'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-2 no-tap-highlight"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <img
              src="/kleros-logo-symbol-fullwhite.png"
              alt="Kleros Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-violet-100">Escrowly</span>

          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-0.5 bg-violet-500/20 rounded-full text-violet-300">v1 · Mainnet</span>
            <a
              href="https://etherscan.io/address/0x0d67440946949fe293b45c52efd8a9b3d51e2522"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-0.5 bg-violet-500/10 hover:bg-violet-500/20 rounded-full text-violet-300/70 hover:text-violet-300 transition-colors flex items-center space-x-1"
            >
              <span>Contract</span>
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </Link>

        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-violet-300 hover:text-violet-100 text-sm font-medium transition-colors"
            >
              Transactions
            </Link>
            <a
              href="https://kleros.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-300 hover:text-violet-100 text-sm font-medium transition-colors"
            >
              About Kleros
            </a>
            <a
              href="https://kleros.io/escrow/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-300 hover:text-violet-100 text-sm font-medium transition-colors"
            >
              Documentation
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <WalletConnect />

            <a
              href="https://github.com/gmkung/kleros-escrow-v1/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-violet-300 transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.84 21.49C9.34 21.581 9.52 21.278 9.52 21.008C9.52 20.763 9.512 20.008 9.507 19.152C6.726 19.79 6.139 17.81 6.139 17.81C5.685 16.63 5.029 16.328 5.029 16.328C4.121 15.682 5.098 15.695 5.098 15.695C6.102 15.764 6.633 16.745 6.633 16.745C7.522 18.3 8.97 17.858 9.542 17.596C9.63 16.931 9.889 16.489 10.175 16.219C7.954 15.947 5.62 15.091 5.62 11.397C5.62 10.306 6.01 9.41 6.652 8.703C6.55 8.444 6.205 7.443 6.746 6.088C6.746 6.088 7.586 5.813 9.495 7.085C10.295 6.859 11.15 6.746 12 6.742C12.85 6.746 13.705 6.859 14.506 7.085C16.414 5.813 17.252 6.088 17.252 6.088C17.795 7.443 17.45 8.444 17.348 8.703C17.992 9.41 18.38 10.306 18.38 11.397C18.38 15.101 16.042 15.944 13.814 16.211C14.169 16.543 14.489 17.2 14.489 18.199C14.489 19.617 14.477 20.675 14.477 21.008C14.477 21.28 14.655 21.587 15.162 21.487C19.134 20.161 22 16.416 22 12C22 6.477 17.523 2 12 2Z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
