import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from '@/styles/EgonuxButton.module.css';

export type EgonuxButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type EgonuxButtonSize = 'sm' | 'md' | 'lg';
export type EgonuxButtonLabelStyle = 'plain' | 'parenthesized';

export interface EgonuxButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: EgonuxButtonVariant;
  size?: EgonuxButtonSize;
  labelStyle?: EgonuxButtonLabelStyle;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

/** Shared EGONUX action control. It never performs or confirms an operation. */
export function EgonuxButton({
  children, variant = 'primary', size = 'md', labelStyle = 'plain',
  startIcon, endIcon, loading = false, fullWidth = false, disabled,
  className, type = 'button', ...buttonProps
}: EgonuxButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], fullWidth ? styles.fullWidth : '', className ?? '']
    .filter(Boolean).join(' ');

  return (
    <button {...buttonProps} aria-busy={loading || undefined} className={classes}
      data-label-style={labelStyle} disabled={disabled || loading} type={type}>
      {loading ? <span aria-label="Loading" className={styles.spinner} role="status" /> :
        startIcon ? <span aria-hidden="true" className={styles.icon}>{startIcon}</span> : null}
      <span className={styles.label}>
        {labelStyle === 'parenthesized' ? <span aria-hidden="true">( </span> : null}
        {children}
        {labelStyle === 'parenthesized' ? <span aria-hidden="true"> )</span> : null}
      </span>
      {!loading && endIcon ? <span aria-hidden="true" className={styles.icon}>{endIcon}</span> : null}
    </button>
  );
}

export type EgonuxActionFeedbackStatus = 'success' | 'error' | 'info';
export interface EgonuxActionFeedbackProps {
  status: EgonuxActionFeedbackStatus;
  children: ReactNode;
  className?: string;
}

/** Show success only after the calling workflow has confirmed the outcome. */
export function EgonuxActionFeedback({ status, children, className }: EgonuxActionFeedbackProps) {
  const classes = [styles.feedback, styles['feedback_' + status], className ?? ''].filter(Boolean).join(' ');
  return (
    <p className={classes} role={status === 'error' ? 'alert' : 'status'}
      aria-live={status === 'error' ? 'assertive' : 'polite'}>
      <span aria-hidden="true" className={styles.feedbackMark}>
        {status === 'success' ? '✓' : status === 'error' ? '!' : 'i'}
      </span>
      <span>{children}</span>
    </p>
  );
}

export default EgonuxButton;
