import Head from 'next/head';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Academy from '@/components/Academy';
import Services from '@/components/Services';
import Community from '@/components/Community';
import Resources from '@/components/Resources';
import Footer from '@/components/Footer';

export default function Home() {
  const title = 'EGONUX — Empowering the Next Generation of Digital Wealth';
  const description =
    'EGONUX is the wealth central hub for education, enterprise, and earning. Learn, build, grow, and lead with one integrated platform.';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="canonical" href="https://www.egonux.com/" />
        <link
          rel="icon"
          href="/brand/egonux-primary-logo.png"
          type="image/png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="EGONUX" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://www.egonux.com/" />
        <meta
          property="og:image"
          content="https://www.egonux.com/brand/egonux-primary-logo.png"
        />
        <meta property="og:image:width" content="2007" />
        <meta property="og:image:height" content="784" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta
          name="twitter:image"
          content="https://www.egonux.com/brand/egonux-primary-logo.png"
        />
      </Head>

      <Header />
      <Hero />
      <About />
      <Academy />
      <Services />
      <Community />
      <Resources />
      <Footer />
    </>
  );
}
