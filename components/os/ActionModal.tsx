import { useEffect, useState } from 'react';
import type { ActionRequest } from '@/types/egonux';
import Icon from './Icon';
import styles from '@/styles/OS.module.css';

interface ActionModalProps {
  action: ActionRequest['type'] | null;
  onClose: () => void;
  onSubmit: (request: ActionRequest) => void;
}

const actionCopy = {
  Deposit: {
    eyebrow: 'Add money',
    title: 'Deposit to your wallet',
    description: 'Choose an amount to create a sandbox deposit request.',
    button: 'Review deposit',
  },
  Transfer: {
    eyebrow: 'Send securely',
    title: 'Transfer with EGONUX ID',
    description: 'Transfers require recipient verification and risk screening.',
    button: 'Review transfer',
  },
  Withdraw: {
    eyebrow: 'Move money out',
    title: 'Withdraw from your wallet',
    description: 'A step-up approval is required before a withdrawal can proceed.',
    button: 'Review withdrawal',
  },
} as const;

export default function ActionModal({ action, onClose, onSubmit }: ActionModalProps) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!action) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [action, onClose]);

  if (!action) return null;

  const copy = actionCopy[action];

  const submit = () => {
    const numericAmount = Number(amount.replace(/,/g, ''));
    if (!Number.isFinite(numericAmount) || numericAmount < 1_000) {
      setError('Enter an amount of at least UGX 1,000.');
      return;
    }
    if (action === 'Transfer' && recipient.trim().length < 4) {
      setError('Enter a valid recipient EGONUX ID or phone number.');
      return;
    }
    onSubmit({ type: action, amount, recipient: recipient.trim() || undefined });
    setAmount('');
    setRecipient('');
    setError('');
  };

  return (
    <div aria-labelledby="action-modal-title" aria-modal="true" className={styles.modalLayer} role="dialog">
      <button aria-label="Close action dialog" className={styles.modalBackdrop} onClick={onClose} type="button" />
      <div className={styles.modalCard}>
        <div className={styles.modalTop}>
          <span className={styles.modalIcon}>
            <Icon name={action === 'Deposit' ? 'arrow-down' : action === 'Transfer' ? 'send' : 'arrow-up'} />
          </span>
          <button aria-label="Close" className={styles.modalClose} onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>
        <span className={styles.eyebrow}>{copy.eyebrow}</span>
        <h2 id="action-modal-title">{copy.title}</h2>
        <p>{copy.description}</p>

        <div className={styles.formStack}>
          <label htmlFor="action-amount">Amount</label>
          <div className={styles.amountInput}>
            <span>UGX</span>
            <input
              id="action-amount"
              inputMode="numeric"
              onChange={(event) => {
                setAmount(event.target.value.replace(/[^0-9,]/g, ''));
                setError('');
              }}
              placeholder="0"
              value={amount}
            />
          </div>
          {action === 'Transfer' ? (
            <>
              <label htmlFor="action-recipient">Recipient</label>
              <input
                className={styles.textInput}
                id="action-recipient"
                onChange={(event) => {
                  setRecipient(event.target.value);
                  setError('');
                }}
                placeholder="EGX ID or mobile number"
                value={recipient}
              />
            </>
          ) : null}
          {error ? <p className={styles.formError}>{error}</p> : null}
        </div>

        <div className={styles.policyNotice}>
          <Icon name="lock" size={17} />
          <span>This Enterprise MVP is a sandbox. No real funds will move.</span>
        </div>
        <button className={styles.primaryButton} onClick={submit} type="button">
          {copy.button}
          <Icon name="chevron-right" size={17} />
        </button>
      </div>
    </div>
  );
}
