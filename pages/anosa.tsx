import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import AnosaMobile from '@/components/anosa/AnosaMobile';
import { AuthenticationError, AuthorizationError, requirePrincipal } from '@/lib/auth/session';
import type { AuthenticatedPrincipal } from '@/types/backend';

interface AnosaPageProps {
  principal: AuthenticatedPrincipal | null;
  previewMode: boolean;
}

export default function AnosaPage({ principal, previewMode }: AnosaPageProps) {
  return (
    <>
      <Head>
        <title>ANOSA Personal — Founder Mobile</title>
        <meta name="description" content="The private EGONUX founder workspace for reading, preparing, and approving decisions." />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="theme-color" content="#080808" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ANOSA" />
        <link rel="manifest" href="/anosa.webmanifest" />
        <link rel="icon" href="/brand/egonux-primary-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/anosa-icon-192.png" />
      </Head>
      <AnosaMobile principal={principal} previewMode={previewMode} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<AnosaPageProps> = async (context) => {
  if (process.env.EGONUX_AUTH_REQUIRED !== 'true') {
    return { props: { principal: null, previewMode: true } };
  }

  try {
    const principal = await requirePrincipal(context.req, ['founder']);
    return { props: { principal, previewMode: false } };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { redirect: { destination: '/os?access=founder-required', permanent: false } };
    }
    if (error instanceof AuthenticationError) {
      const destination = `/login?next=${encodeURIComponent(context.resolvedUrl)}`;
      return { redirect: { destination, permanent: false } };
    }
    throw error;
  }
};
