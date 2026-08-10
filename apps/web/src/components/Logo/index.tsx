import styles from './Logo.module.css';

interface LogoProps {
  size?: number;
  withText?: boolean;
}

export default function Logo({ size = 32, withText = true }: LogoProps) {
  return (
    <div className={styles.root}>
      <img
        src="/logo.svg"
        alt="Recycle Bin"
        width={size}
        height={size}
        className={styles.img}
      />
      {withText && (
        <span className={styles.text}>
          Recycle<span className={styles.accent}>Bin</span>
        </span>
      )}
    </div>
  );
}
