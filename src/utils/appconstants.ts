import React from 'react'
import { HeaderNextElement } from '../elements/HeaderNextElement'
import { config } from './config'

export const currentConfig = process.env.NEXT_PUBLIC_ENV
  ? config[process.env.NEXT_PUBLIC_ENV as keyof typeof config]
  : config['staging']

// TODO: we need to remove quotes from the keys
// when we configure the eslint rules again for typescript
export enum ECoinGeckoIdList {
  'ETH' = 'ethereum',
  'BTC' = 'bitcoin',
  'XRP' = 'ripple'
}

export type TCoinGeckoIdKeys = keyof typeof ECoinGeckoIdList

export const assetTableColumns = [
  {
    Header: 'Asset',
    accessor: 'asset'
  },
  {
    Header: 'Price',
    accessor: 'price'
  },
  {
    Header: React.createElement(HeaderNextElement),
    accessor: 'next'
  },
  {
    Header: 'Live',
    accessor: 'live'
  },
  {
    Header: 'History',
    accessor: 'history'
  },
  {
    Header: 'Subscription',
    accessor: 'subscription'
  }
]

export const getAllowedPredictions = () => {
  let allowedPredictions = [...currentConfig.opfProvidedPredictions]
  if (currentConfig.whiteListedPredictions) {
    allowedPredictions = allowedPredictions.concat(
      currentConfig.whiteListedPredictions
    )
  }
  return allowedPredictions
}
