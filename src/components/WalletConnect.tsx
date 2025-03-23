import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 transition-colors"
      >
        <span className="text-sm font-medium text-violet-100">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="text-violet-300"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium transition-colors"
    >
      Connect Wallet
    </button>
  )
} 