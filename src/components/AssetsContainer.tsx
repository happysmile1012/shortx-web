import { useEffect, useState } from 'react'

import { useSocketContext } from '@/contexts/SocketContext'
import { currentConfig } from '@/utils/appconstants'
import { getAllInterestingPredictionContracts } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import styles from '../styles/AssetsTable.module.css'
import { AssetList } from './AssetList'

type TContractsState = Awaited<
  ReturnType<typeof getAllInterestingPredictionContracts>
>

export const AssetsContainer: React.FC = () => {
  const [contracts, setContracts] = useState<TContractsState>()
  const { setInitialData } = useSocketContext()

  useEffect(() => {
    getAllInterestingPredictionContracts(currentConfig.subgraph).then(
      (contracts) => {
        setContracts(contracts)
      }
    )
  }, [])

  useEffect(() => {
    if (!setInitialData) return
    //getInitialData().then((data) => {
    //  setInitialData(data)
    //})
  }, [setInitialData])

  return (
    <div className={styles.container}>
      {contracts ? <AssetList contracts={contracts} /> : <div>Loading</div>}
    </div>
  )
}
