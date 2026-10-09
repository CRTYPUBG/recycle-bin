import React from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'ghost' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  as?: 'button' | 'a';
  href?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  as: Tag = 'button',
  href,
  target,
  rel,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const cls = `${styles.btn} ${styles[variant]} ${className}`;

  if (Tag === 'a') {
    return (
      <a href={href} target={target} rel={rel} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
