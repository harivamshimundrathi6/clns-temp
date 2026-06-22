"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { VideoHero } from "@/components/ui/video-hero";

// Lazy load below-the-fold components
const ServiceCategoriesSection = dynamic(
  () => import("@/components/ui/service-categories-section").then((mod) => ({ default: mod.ServiceCategoriesSection })),
  { loading: () => <div className="min-h-[600px] bg-[#030914]" /> }
);
const AboutSection = dynamic(() => import("@/components/ui/about-section"), {
  loading: () => <div className="min-h-[400px] bg-[#030914]" />,
});
const MarqueePartners = dynamic(
  () => import("@/components/ui/marquee-partners").then((mod) => ({ default: mod.MarqueePartners })),
  { loading: () => <div className="min-h-[200px] bg-[#030914]" /> }
);
const TestimonialsSection = dynamic(
  () => import("@/components/ui/testimonials-with-marquee").then((mod) => ({ default: mod.TestimonialsSection })),
  { loading: () => <div className="min-h-[300px] bg-[#030914]" /> }
);
const HandWrittenTitle = dynamic(
  () => import("@/components/ui/hand-writing-text").then((mod) => ({ default: mod.HandWrittenTitle })),
  { ssr: false }
);
const Footerdemo = dynamic(
  () => import("@/components/ui/footer-section").then((mod) => ({ default: mod.Footerdemo })),
  { loading: () => <div className="min-h-[200px] bg-[#030914]" /> }
);
const CTAContactSection = dynamic(
  () => import("@/components/ui/cta-contact-section").then((mod) => ({ default: mod.CTAContactSection })),
  { loading: () => <div className="min-h-[200px] bg-[#030914]" /> }
);
const InTheNewsSection = dynamic(
  () => import("@/components/ui/in-the-news").then((mod) => ({ default: mod.InTheNewsSection })),
  { loading: () => <div className="min-h-[300px] bg-[#030914]" /> }
);
const LeadershipVideosSection = dynamic(
  () => import("@/components/ui/leadership-videos").then((mod) => ({ default: mod.LeadershipVideosSection })),
  { loading: () => <div className="min-h-[400px] bg-[#030914]" /> }
);

export default function Home() {
  const marqueeTestimonials = [
    {
      author: {
        name: "Ishita Rao",
        handle: "@ishita.rao",
        avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
      },
      text: "CLNS gave our clients a transparent channel to follow every filing. The trust impact has been massive.",
    },
    {
      author: {
        name: "Neeraj Singh",
        handle: "@neeraj.law",
        avatar: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
      },
      text: "As a student, having internships, briefs, and mentors in one dashboard keeps me laser focused.",
      href: "https://twitter.com/neeraj",
    },
    {
      author: {
        name: "Rhea Kapur",
        handle: "@rhea.clns",
        avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80",
      },
      text: "₹1 consults with verified advocates changed how our startup approaches compliance.",
    },
    {
      author: {
        name: "Aarav Mehta",
        handle: "@aarav.chambers",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
      },
      text: "Diary sync and cause-list alerts removed last-minute surprises inside the chambers.",
    },
  ];

  return (
    <main className="relative min-h-screen bg-[#030914] text-white overflow-hidden">
      <VideoHero />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <ServiceCategoriesSection excludeAdminCards />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <AboutSection />
      </motion.div>

      <motion.section 
        id="partners" 
        className="w-full bg-[#030914] py-32 transition-standard"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 text-center text-white">
          <h2 className="mt-4 text-3xl font-semibold md:text-4xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Trusted by these institutions
          </h2>
        </div>
        <div className="mt-12 px-6">
          <MarqueePartners />
        </div>
      </motion.section>

      <InTheNewsSection />

      <LeadershipVideosSection />

      <TestimonialsSection
        title="What our users say"
        description="See how clients, students, and advocates rely on CLNS to stay fast, transparent, and compliant."
        testimonials={marqueeTestimonials}
        className="bg-[#030914] text-white"
      />

      <motion.section 
        id="download" 
        className="relative w-full bg-[#020712] px-6 py-28 text-white transition-standard overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center z-10">
          <HandWrittenTitle
            title="Access CLNS On The Go"
            subtitle="Manage cases, connect with lawyers, and stay updated anywhere."
            className="mb-10"
          />
          <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <motion.a
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              href="https://play.google.com/store/apps/details?id=com.clns.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full max-w-xs items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-left shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 ease-out hover:border-white/30 hover:bg-white/10 sm:w-auto hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.3)]"
            >
              <Image src="/play-store.jpg" alt="Google Play" width={32} height={32} className="h-8 w-8 object-contain" loading="lazy" />
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.3em] text-white/50 font-medium">Get it on</span>
                <span className="text-lg font-semibold text-white tracking-tight">Google Play</span>
              </div>
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              href="https://apps.apple.com/in/app/clns-law-services-made-easy/id6741812022"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full max-w-xs items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-left shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 ease-out hover:border-white/30 hover:bg-white/10 sm:w-auto hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.3)]"
            >
              <Image src="/app-store.jpg" alt="App Store" width={32} height={32} className="h-8 w-8 object-contain" loading="lazy" />
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.3em] text-white/50 font-medium">Download on the</span>
                <span className="text-lg font-semibold text-white tracking-tight">App Store</span>
              </div>
            </motion.a>
          </div>
          <p className="mt-8 max-w-2xl text-sm text-white/50 tracking-wide">
            The CLNS mobile app keeps your briefs, hearings, and legal network synced in real time across every device.
          </p>
        </div>
      </motion.section>

      <CTAContactSection />
      <Footerdemo />
    </main>
  );
}

