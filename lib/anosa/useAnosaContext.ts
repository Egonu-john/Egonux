import { useState, useEffect } from 'react';

export type AnosaContextState =
  | { status: 'loading' }
  | { status: 'unauthorized'; message: string }
  | { status: 'forbidden'; message: string }
  | { status: 'error'; message: string }
  | {
      status: 'success';
      data: {
        sources: string[];
        execution: string;
        capabilities: string[];
        control: Record<string, unknown>;
        evidence: Record<string, unknown>;
      };
    };

export function useAnosaContext() {
  const [state, setState] = useState<AnosaContextState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    async function fetchAnosaContext() {
      try {
        const response = await fetch('/api/anosa/context', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!isMounted) return;

        if (response.status === 401) {
          setState({
            status: 'unauthorized',
            message: 'Zero-trust authentication required. Access locked.',
          });
          return;
        }

        if (response.status === 403) {
          setState({
            status: 'forbidden',
            message: 'Founder privileges required for ANOSA runtime.',
          });
          return;
        }

        if (!response.ok) {
          setState({
            status: 'error',
            message: `HTTP Error: ${response.status} ${response.statusText}`,
          });
          return;
        }

        const data = await response.json();
        setState({
          status: 'success',
          data,
        });
      } catch (err: Record<string, unknown>) {
        if (isMounted) {
          setState({
            status: 'error',
            message: err?.message || 'Failed to connect to ANOSA context engine.',
          });
        }
      }
    }

    fetchAnosaContext();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
