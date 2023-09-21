import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { calculateTimeRemaining } from '@/elements/CountdownComponent'
import Tooltip from '@/elements/Tooltip'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import styles from '../styles/SubscriptionDot.module.css'
import { SubscriptionStatus } from './Subscription'

export interface SubscriptionData {
  status: SubscriptionStatus
  assetName: string
  contractAddress: string
  secondsPerSubscription: number
}

export default function SubscriptionDot({
  status,
  assetName,
  contractAddress,
  secondsPerSubscription
}: SubscriptionData) {
  const { address } = useAccount()

  const { getPredictorInstanceByAddress, contractPrices } =
    usePredictoorsContext()
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | undefined>()
  const [message, setMessage] = useState<string>('')
  const [closeToExpiry, setCloseToExpiry] = useState<boolean>(false)

  const userSubscription = () => {
    if (!address || !contractPrices) return
    const predictorInstance = getPredictorInstanceByAddress(contractAddress)
    predictorInstance?.getSubscriptions(address).then((resp) => {
      setExpiryTimestamp(parseInt(ethers.utils.formatUnits(resp.expires, 0)))
    })
  }

  const getTooltipText = () => {
    const timeRemaining = expiryTimestamp
      ? calculateTimeRemaining(expiryTimestamp)
      : 0
    const minutes = Math.floor((timeRemaining / 1000 / 60) % 60)
    const hours = Math.floor((timeRemaining / 1000 / 3600) % 24)

    //time remaining smaller than 144 which is 10% of 1440(24h)
    const newCloseToExpiry =
      timeRemaining / 1000 / 60 < 0.1 * secondsPerSubscription
    setCloseToExpiry(newCloseToExpiry)
    switch (status) {
      case SubscriptionStatus.FREE:
        return setMessage('Free \n\nSubscription')
      case SubscriptionStatus.ACTIVE:
        return setMessage(
          `Subscribed \n\n ${hours}h ${minutes}min left ${
            newCloseToExpiry ? '(<10%)' : ''
          }`
        )
    }
    return ''
  }

  useEffect(() => {
    getTooltipText()
  }, [expiryTimestamp])

  useEffect(() => {
    userSubscription()
  }, [address, contractPrices, status])

  return status !== SubscriptionStatus.INACTIVE ? (
    <div className={styles.container} id={assetName}>
      <div
        className={styles.image}
        style={{
          backgroundColor:
            status === SubscriptionStatus.ACTIVE && closeToExpiry
              ? 'orange'
              : 'green'
        }}
      >
        {' '}
      </div>
      {message && (
        <Tooltip selector={assetName} text={message} hideIcon textAlignCenter />
      )}
    </div>
  ) : (
    <></>
  )
}
