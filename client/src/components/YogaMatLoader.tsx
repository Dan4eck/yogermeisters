import styles from './YogaMatLoader.module.css';

interface YogaMatLoaderProps {
  readonly label: string;
  readonly variant?: 'page' | 'media' | 'heroMedia';
}

export default function YogaMatLoader({ label, variant = 'page' }: YogaMatLoaderProps) {
  return (
    <div className={`${styles.loader} ${styles[variant]}`} role='status' aria-label={label} aria-live='polite'>
      <img
        className={styles.animation}
        src='/assets/cabinet/yoga-mat-loader-beige.png'
        alt=''
        aria-hidden='true'
        decoding='async'
      />
    </div>
  );
}
