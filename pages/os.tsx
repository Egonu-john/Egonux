import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import EgonuxOS from '@/components/os/EgonuxOS';
import { requirePrincipal } from '@/lib/auth/session';
import type { AuthenticatedPrincipal } from '@/types/backend';

interface OperatingSystemPageProps {
  principal: AuthenticatedPrincipal | null;
}

export default function OperatingSystemPage({ principal }: OperatingSystemPageProps) {
  const title = 'EGONUX OS v3.0.1 — Enterprise MVP Sandbox';
  const description =
    'Explore the EGONUX OS Enterprise MVP sandbox: one identity, wallet, marketplace, learning platform, community, intelligence, and command center.';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="theme-color" content="#080908" />
        <link rel="canonical" href="https://www.egonux.com/os" />
        <link
          rel="icon"
          href="/brand/egonux-primary-logo.png"
          type="image/png"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="EGONUX" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://www.egonux.com/os" />
        <meta
          property="og:image"
          content="https://www.egonux.com/brand/egonux-primary-logo.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <EgonuxOS principal={principal} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<OperatingSystemPageProps> = async (context) => {
  if (process.env.EGONUX_AUTH_REQUIRED !== 'true') {
    return { props: { principal: null } };
  }

  try {
    return { props: { principal: await requirePrincipal(context.req) } };
  } catch {
    const destination = `/login?next=${encodeURIComponent(context.resolvedUrl)}`;
    return { redirect: { destination, permanent: false } };
  }
};
