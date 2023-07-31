export type TRunEnvironments = 'staging' | 'production' | 'barge' | 'mock'
export type TRuntimeConfig = Record<
  TRunEnvironments,
  {
    chainId: string
    subgraph: string
    tokenPredictions: Array<{
      tokenName: string
      pairName: string
      market: string
    }>
    opfProvidedPredictions: Array<string>
    opfOwnerAddress: string
  }
>

export const config: TRuntimeConfig = {
  staging: {
    chainId: '23295',
    subgraph:
      'https://v4.subgraph.goerli.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        market: 'univ3'
      }
    ],
    opfProvidedPredictions: [],
    opfOwnerAddress: ''
  },
  production: {
    chainId: '23295',
    subgraph:
      'https://v4.subgraph.mainnet.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph',
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        market: 'univ3'
      }
    ],
    opfProvidedPredictions: [],
    opfOwnerAddress: ''
  },
  barge: {
    chainId: '8996',
    subgraph: `${process.env.NEXT_PUBLIC_DEV_GRAPHQL_HOST}:9000/subgraphs/name/oceanprotocol/ocean-subgraph`,
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDT',
        market: 'binance'
      },
      {
        tokenName: 'BTC',
        pairName: 'TUSD',
        market: 'binance'
      },
      {
        tokenName: 'XRP',
        pairName: 'USDT',
        market: 'kraken'
      }
    ],
    opfProvidedPredictions: ['0x003b23b92e84bf16f576b4c5c1664c2c801f3172'],
    opfOwnerAddress: '0xe2dd09d719da89e5a3d0f2549c7e24566e947260'
  },
  mock: {
    chainId: '23295',
    subgraph: `${process.env.NEXT_PUBLIC_DEV_GRAPHQL_HOST}:9000/subgraphs/name/oceanprotocol/ocean-subgraph`,
    tokenPredictions: [
      {
        tokenName: 'ETH',
        pairName: 'USDC',
        market: 'univ3'
      }
    ],
    opfProvidedPredictions: [],
    opfOwnerAddress: ''
  }
}
