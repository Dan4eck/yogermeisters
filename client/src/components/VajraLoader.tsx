import styles from './VajraLoader.module.css';

interface VajraLoaderProps {
  readonly label: string;
  readonly variant?: 'page' | 'overlay';
}

export default function VajraLoader({ label, variant = 'page' }: VajraLoaderProps) {
  return (
    <div className={`${styles.loader} ${styles[variant]}`} role='status' aria-label={label} aria-live='polite'>
      <img
        className={styles.animation}
        src='/assets/cabinet/vajra-rotation-aligned.gif'
        alt=''
        aria-hidden='true'
        decoding='async'
      />
    </div>
  );
}
