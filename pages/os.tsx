import Head from 'next/head';
import EgonuxOS from '@/components/os/EgonuxOS';

export default function OperatingSystemPage() {
  return (
    <>
      <Head>
        <title>EGONUX OS v3.0 — Enterprise MVP</title>
        <meta
          name="description"
          content="Explore the EGONUX OS v3.0 Enterprise MVP: one identity, wallet, marketplace, learning platform, community, intelligence and command center."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <EgonuxOS />
    </>
  );
}
