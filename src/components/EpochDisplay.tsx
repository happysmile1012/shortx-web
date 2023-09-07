import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { useSocketContext } from '@/contexts/SocketContext'
import {
  compareSplittedNames,
  splitContractName
} from '@/utils/splitContractName'
import { useEffect, useMemo, useState } from 'react'
import styles from '../styles/Epoch.module.css'
import { EpochPrediction } from './EpochDetails/EpochPrediction'
import { EpochPrice } from './EpochDetails/EpochPrice'
import { EpochStakedTokens } from './EpochDetails/EpochStakedTokens'

//TODO: Fix Eslint
export enum EEpochDisplayStatus {
  'NextEpoch' = 'next',
  'LiveEpoch' = 'live',
  'PastEpoch' = 'history'
}

export type TEpochDisplayProps = {
  status: EEpochDisplayStatus
  price: number
  market: string
  tokenName: string
  pairName: string
  epochStartTs: number
  secondsPerEpoch: number
}

export const EpochDisplay: React.FC<TEpochDisplayProps> = ({
  status,
  price,
  market,
  tokenName,
  pairName,
  epochStartTs,
  secondsPerEpoch
}) => {
  const { epochData } = useSocketContext()
  const [delta, setDelta] = useState<number>()
  const [initialPrice, setInitialPrice] = useState<number>()
  const [finalPrice, setFinalPrice] = useState<number>(0)
  const { fetchHistoricalPair } = useMarketPriceContext()
  const [isFetching, setIsFetching] = useState<boolean>(false)

  const isNextEpoch = useMemo<boolean>(
    () => status === EEpochDisplayStatus.NextEpoch,
    [status]
  )

  const relatedPredictionIndex = useMemo(() => {
    switch (status) {
      case EEpochDisplayStatus.NextEpoch:
        return 2
      case EEpochDisplayStatus.LiveEpoch:
        return 1
      case EEpochDisplayStatus.PastEpoch:
        return 0
    }
  }, [status])

  const relatedData = Array.isArray(epochData)
    ? epochData
        ?.find((data) =>
          compareSplittedNames(splitContractName(data.contractInfo.name), [
            tokenName,
            pairName
          ])
        )
        ?.predictions.sort((a, b) => a.epoch - b.epoch)[relatedPredictionIndex]
    : null

  useEffect(() => {
    if (!isNextEpoch || !relatedData || relatedData.stake == 0) return

    if (!initialPrice) {
      if (isFetching) return
      setIsFetching(true)
      fetchHistoricalPair(
        tokenName + pairName,
        epochStartTs - secondsPerEpoch
      ).then((historicalPair) => {
        if (!historicalPair) {
          setIsFetching(false)
          return
        }
        const startPrice = historicalPair[0].open
        setInitialPrice(parseFloat(startPrice))
        setDelta(parseFloat(startPrice) - price)
        setIsFetching(false)
      })
    } else {
      setDelta((100 * (price - initialPrice)) / ((price + initialPrice) / 2))
    }
  }, [price, isNextEpoch])

  const getHistoryEpochPriceDelta = async () => {
    const result = await fetchHistoricalPair(
      tokenName + pairName,
      epochStartTs - secondsPerEpoch
    )

    if (!result) return

    const { open: initialPrice } = result[0]
    const { close: finalPrice } = result[result.length - 1]

    setFinalPrice(parseFloat(finalPrice))
    const delta =
      (100 * (parseFloat(finalPrice) - parseFloat(initialPrice))) /
      ((parseFloat(finalPrice) + parseFloat(initialPrice)) / 2)
    setDelta(delta)
  }

  useEffect(() => {
    if (isNextEpoch || !secondsPerEpoch || !epochStartTs) return
    getHistoryEpochPriceDelta()
  }, [relatedData, secondsPerEpoch, epochStartTs, isNextEpoch])

  return (
    <div
      className={styles.container}
      style={{
        boxShadow: isNextEpoch ? '0px 0px 3px 1px var(--dark-grey)' : ''
      }}
    >
      {isNextEpoch ? (
        <EpochStakedTokens
          stakedUp={relatedData?.nom ? parseFloat(relatedData?.nom) : undefined}
          totalStaked={
            relatedData?.denom ? parseFloat(relatedData?.denom) : undefined
          }
          direction={relatedData?.dir}
          showLabel
        />
      ) : (
        <EpochPrice price={finalPrice} delta={delta} />
      )}
      <EpochPrediction
        stakedUp={relatedData?.nom ? parseFloat(relatedData?.nom) : undefined}
        totalStaked={
          relatedData?.nom ? parseFloat(relatedData?.denom) : undefined
        }
        status={status}
        direction={relatedData?.dir}
      />
    </div>
  )
}
