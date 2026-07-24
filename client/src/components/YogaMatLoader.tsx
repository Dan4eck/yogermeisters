import styles from './YogaMatLoader.module.css';

interface YogaMatLoaderProps {
  readonly label: string;
}

export default function YogaMatLoader({ label }: YogaMatLoaderProps) {
  return (
    <div className={styles.loader} role='status' aria-label={label} aria-live='polite'>
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
