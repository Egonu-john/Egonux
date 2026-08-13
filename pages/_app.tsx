import type { AppProps } from 'next/app';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      {process.env.NEXT_PUBLIC_ENABLE_SPEED_INSIGHTS === 'true' ? <SpeedInsights /> : null}
    </>
  );
}
