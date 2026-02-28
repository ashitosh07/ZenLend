// ─── Deployed Contract Addresses — Starknet Sepolia ───────────────────────────

export const NETWORK = 'sepolia'
export const RPC_URL = 'https://api.cartridge.gg/x/starknet/sepolia'

export const CONTRACTS = {
  // PrivateUSD ERC-20 stablecoin
  PUSD: {
    address: '0xa023bb6fda7d2753e8c6806b889c8b9a37b3c41784997bf24c6f2202cc9611',
    classHash:
      '0x003546e07e4149ffb2fcfbd4c37404d7001ce216959378e8412dd74041a8cc9e',
  },
  // Privacy-preserving BTC lending protocol
  LENDING: {
    address:
      '0x6cd464fd97a0a48e203fff57bb4e550f50d92bd2903538dd639ed924f1635c8',
    classHash:
      '0x063d08572f95b0869e8e72fa13c4addf7935f487591cd6b1d38e9d061705055b',
  },
}

export const VOYAGER_BASE = 'https://sepolia.voyager.online'

export const voyagerContract = (addr) => `${VOYAGER_BASE}/contract/${addr}`
export const voyagerTx = (hash) => `${VOYAGER_BASE}/tx/${hash}`
