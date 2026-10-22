import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import type { EgonuxButtonLabelStyle, EgonuxButtonSize, EgonuxButtonVariant } from './EgonuxButton';
import styles from '@/styles/EgonuxButton.module.css';

export type EgonuxActionLinkProps = Omit<ComponentProps<typeof Link>, 'children' | 'className'> & {
  children: ReactNode;
  variant?: EgonuxButtonVariant;
  size?: EgonuxButtonSize;
  labelStyle?: EgonuxButtonLabelStyle;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
};

/** Link navigation with the shared EGONUX action-button visual language. */
export function EgonuxActionLink({
  children,
  variant = 'primary',
  size = 'md',
  labelStyle = 'plain',
  startIcon,
  endIcon,
  fullWidth = false,
  className,
  ...linkProps
}: EgonuxActionLinkProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  return (
    <Link {...linkProps} className={classes} data-label-style={labelStyle}>
      {startIcon ? <span aria-hidden="true" className={styles.icon}>{startIcon}</span> : null}
      <span className={styles.label}>
        {labelStyle === 'parenthesized' ? <span aria-hidden="true">( </span> : null}
        {children}
        {labelStyle === 'parenthesized' ? <span aria-hidden="true"> )</span> : null}
      </span>
      {endIcon ? <span aria-hidden="true" className={styles.icon}>{endIcon}</span> : null}
    </Link>
  );
}

export default EgonuxActionLink;
