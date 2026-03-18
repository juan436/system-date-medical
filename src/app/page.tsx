import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ServicesCatalog } from "@/components/landing/services-catalog";
import { AboutDoctor } from "@/components/landing/about-doctor";
import { Reviews } from "@/components/landing/reviews";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ServicesCatalog />
        <AboutDoctor />
        <Reviews />
      </main>
      <Footer />
    </>
  );
}
