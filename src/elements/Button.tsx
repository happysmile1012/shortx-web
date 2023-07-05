import styles from '../styles/Button.module.css'

interface ButtonProps {
  text: string
  disabled?: boolean
  className?: string
  onClick: () => void
}

export default function Button({
  text,
  disabled,
  onClick,
  className
}: ButtonProps) {
  return (
    <button
      onClick={() => onClick()}
      className={`${className ? className : styles.button}`}
      disabled={disabled}
    >
      {text}
    </button>
  )
}
