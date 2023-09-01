import styles from '../../styles/Epoch.module.css'

export type TEpochStakedTokensProps = {
  showLabel?: boolean | undefined
  stakedUp?: number | undefined
  direction?: number | undefined
  totalStaked?: number | undefined
}

export const EpochStakedTokens: React.FC<TEpochStakedTokensProps> = ({
  stakedUp,
  totalStaked,
  direction,
  showLabel
}) => {
  return !showLabel ? (
    <div className={styles.stekesContainer}>
      <div className={styles.stake}>
        <span className={styles.stakeAmount}>{stakedUp ? stakedUp : 0}</span>
        <img
          className={styles.stakeDirectionArrow}
          alt="stakedArrow"
          src="/assets/icons/arrowUp.png"
        ></img>
      </div>
      <div className={`${styles.stake} ${styles.stakeMarginLeft}`}>
        <span className={styles.stakeAmount}>
          {totalStaked && stakedUp !== undefined ? totalStaked - stakedUp : 0}
        </span>
        <img
          className={styles.stakeDirectionArrow}
          alt="stakedArrow"
          src="/assets/icons/arrowDown.png"
        ></img>
      </div>
    </div>
  ) : (
    <div
      className={styles.stake}
      style={{
        background: `${
          direction == undefined
            ? '#cbcbcb'
            : direction === 1
            ? '#BEFFC1'
            : '#FFB0B0'
        }`,
        height: '25px',
        width: '100%',
        paddingTop: '5px'
      }}
    >
      <img
        className={styles.tokenImage}
        src={'oceanToken.png'}
        alt="Coin symbol image"
      />
      <span className={styles.stakeText}>
        {`${
          direction == undefined
            ? '?'
            : totalStaked
            ? totalStaked.toLocaleString()
            : 0
        } ${showLabel ? 'staked' : ''}`}
      </span>
    </div>
  )
}
