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
  return (
    <>
      <Head>
        <title>EGONUX — Empowering the Next Generation of Digital Wealth</title>
        <meta
          name="description"
          content="EGONUX: The wealth central hub for education, enterprise, and earning. Learn, build, grow, and lead with our integrated platform."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
