import { TokenData } from '@/utils/asset'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { Pair } from '@/contexts/MarketPriceContext.types'
import { getSpecificPairFromContextData } from '@/contexts/MarketPriceContextHelpers'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useSocketContext } from '@/contexts/SocketContext'
import { TableRowWrapper } from '@/elements/TableRowWrapper'
import styles from '@/styles/Table.module.css'
import { currentConfig } from '@/utils/appconstants'
import { calculateSlotStats } from '@/utils/subgraphs/getAssetAccuracy'
import { SECONDS_IN_24_HOURS } from '@/utils/subgraphs/queries/getPredictSlots'
import Accuracy from './Accuracy'
import Asset from './Asset'
import { TAssetData } from './AssetTable'
import { EEpochDisplayStatus, EpochDisplay } from './EpochDisplay'
import Price from './Price'
import Stake from './Stake'
import Subscription, { SubscriptionStatus } from './Subscription'

export type TAssetFetchedInfo = {
  tokenData: TokenData | undefined
  price: string
}

export type TAssetRowProps = {
  assetData: TAssetData
}

export type TAssetRowState = {
  FetchedInfo: TAssetFetchedInfo | undefined
  tokenAccuracyStake: {
    accuracy: number
    totalStake: number
    totalStakePreviousDay: number
  }
}

export const AssetRow: React.FC<TAssetRowProps> = ({ assetData }) => {
  const { epochData } = useSocketContext()
  const [tokenAccuracyStake, setTokenAccuracyStake] = useState<
    TAssetRowState['tokenAccuracyStake']
  >({
    accuracy: 0,
    totalStake: 0,
    totalStakePreviousDay: 0
  })

  const { currentEpoch, secondsPerEpoch } = usePredictoorsContext()
  const currentEpochRef = useRef<number>(currentEpoch)
  const loadAccuracyArgsRef = useRef<string | undefined>(undefined)
  //const testLoadCountRef = useRef<number>(0)

  const [tokenData, setTokenData] = useState<TokenData>({
    name: '',
    symbol: '',
    pair: '',
    price: 0,
    market: ''
  })
  const { allPairsData } = useMarketPriceContext()

  const {
    tokenName,
    pairName,
    subscription,
    subscriptionPrice,
    secondsPerSubscription,
    market,
    baseToken,
    quoteToken,
    //interval,
    contract
  } = assetData

  const loadData = useCallback<(pairsData: Array<Pair>) => void>(
    (pairsData) => {
      const pairSymbol = `${baseToken}${quoteToken}`

      const price = getSpecificPairFromContextData({
        allPairsData: pairsData,
        pairSymbol: pairSymbol
      })

      const name = `${baseToken}-${quoteToken}`
      setTokenData({
        price: parseFloat(price),
        name,
        pair: pairSymbol,
        symbol: baseToken,
        market: market
      })
    },
    [baseToken, market, quoteToken]
  )

  const getAssetPairStatsForRow = useCallback<
    (args: {
      contract: string
      lastSlotTS: number
      firstSlotTS: number
    }) => Promise<[number, number, number]>
  >(async ({ contract, lastSlotTS, firstSlotTS }) => {
    if (!lastSlotTS) return Promise.resolve([0, 0, 0])
    const [accuracyRecord, totalStakeYesterdayRecord, totalStakedTodayRecord] =
      await calculateSlotStats(
        currentConfig.subgraph,
        [contract],
        lastSlotTS,
        firstSlotTS
      )
    return [
      accuracyRecord[contract],
      totalStakeYesterdayRecord[contract],
      totalStakedTodayRecord[contract]
    ]
  }, [])

  const renewPrice = useCallback<() => Promise<void>>(async () => {
    if (!allPairsData) return
    loadData(allPairsData)
  }, [allPairsData, loadData])

  useEffect(() => {
    const priceInterval = setInterval(() => {
      renewPrice()
    }, 10000)

    return () => {
      clearInterval(priceInterval)
    }
  }, [epochData, renewPrice])

  // Calculate accuracy and set state
  const loadAccuracy = useCallback<(args: { currentEpoch: number }) => void>(
    async ({ currentEpoch }) => {
      if (!currentEpoch) return

      const args = {
        contract: contract.address,
        lastSlotTS: currentEpoch,
        firstSlotTS: currentEpoch - 2 * SECONDS_IN_24_HOURS
      }

      if (loadAccuracyArgsRef.current === JSON.stringify(args)) return

      loadAccuracyArgsRef.current = JSON.stringify(args)
      //testLoadCountRef.current += 1

      const [accuracy, totalStakeYesterdayBefore, totalTodayStake] =
        await getAssetPairStatsForRow(args)

      setTokenAccuracyStake({
        accuracy,
        totalStake: totalTodayStake || 0,
        totalStakePreviousDay: totalStakeYesterdayBefore || 0
      })
    },
    [getAssetPairStatsForRow, contract.address]
  )

  useEffect(() => {
    if (currentEpochRef.current === currentEpoch) return

    currentEpochRef.current = currentEpoch
    loadAccuracy({ currentEpoch })
  }, [loadAccuracy, currentEpoch])

  const slotProps = useMemo(
    () =>
      tokenName && pairName && subscription
        ? {
            tokenName,
            pairName,
            subscription,
            market
          }
        : null,
    [tokenName, pairName, subscription]
  )

  useEffect(() => {
    if (!allPairsData) return
    //loadAccuracy()
    loadData(allPairsData)
  }, [allPairsData, loadData, loadAccuracy])

  if (!tokenData || !slotProps) return null

  return (
    <TableRowWrapper
      className={styles.tableRow}
      cellProps={{
        className: styles.tableRowCell
      }}
    >
      <Asset
        assetData={tokenData}
        contractAddress={contract.address}
        subscription={subscription}
        secondsPerSubscription={assetData.secondsPerSubscription}
      />
      <EpochDisplay
        status={EEpochDisplayStatus.PastEpoch}
        price={tokenData.price}
        {...slotProps}
        subscription={subscription}
        address={contract.address}
        epochStartTs={currentEpoch - secondsPerEpoch}
        secondsPerEpoch={secondsPerEpoch}
      />
      <EpochDisplay
        status={EEpochDisplayStatus.LiveEpoch}
        price={tokenData.price}
        {...slotProps}
        epochStartTs={currentEpoch}
        address={contract.address}
        subscription={subscription}
        secondsPerEpoch={secondsPerEpoch}
      />
      <Price assetData={tokenData} />
      {subscription !== SubscriptionStatus.INACTIVE ? (
        <EpochDisplay
          status={EEpochDisplayStatus.NextEpoch}
          price={tokenData.price}
          {...slotProps}
          subscription={subscription}
          address={contract.address}
          epochStartTs={currentEpoch + secondsPerEpoch}
          secondsPerEpoch={secondsPerEpoch}
        />
      ) : (
        <Subscription
          subscriptionData={{
            price: parseInt(subscriptionPrice),
            status: subscription,
            secondsPerSubscription: secondsPerSubscription
          }}
          contractAddress={contract.address}
        />
      )}
      <Accuracy accuracy={tokenAccuracyStake.accuracy} />
      <Stake
        totalStake={tokenAccuracyStake.totalStake}
        totalStakePreviousDay={tokenAccuracyStake.totalStakePreviousDay}
      />
    </TableRowWrapper>
  )
}
