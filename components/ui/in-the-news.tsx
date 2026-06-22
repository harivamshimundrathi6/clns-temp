import { motion } from "framer-motion";
import { ExternalLink, Newspaper } from "lucide-react";
import Image from "next/image";

const newsArticles = [
  {
    source: "ABP Live (Telugu)",
    title: "Legal advice for one rupee with Centralised Legal Network Solutions (CLNS)",
    url: "https://telugu.abplive.com/telangana/warangal/legal-advice-for-one-rupee-with-centralised-legal-network-solutions-clns-213741",
    date: "Recent",
    domain: "abplive.com",
    logoUrl: "https://www.google.com/s2/favicons?domain=abplive.com&sz=128",
  },
  {
    source: "Samayam (Telugu)",
    title: "Legal advice for just one rupee with CLNS special app in Telangana",
    url: "https://telugu.samayam.com/telangana/warangal/legal-advice-for-just-one-rupee-with-clns-special-app-in-telangana/articleshow/122480809.cms",
    date: "Recent",
    domain: "samayam.com",
    logoUrl: "https://www.google.com/s2/favicons?domain=samayam.com&sz=128",
  },
  {
    source: "OneIndia (Telugu)",
    title: "Jangaon law students offer legal advice for just ₹1 via CLNS platform",
    url: "https://telugu.oneindia.com/news/telangana/jangaon-law-students-offer-legal-advice-for-just-1-via-clns-platform-443655.html",
    date: "Recent",
    domain: "oneindia.com",
    logoUrl: "https://www.google.com/s2/favicons?domain=oneindia.com&sz=128",
  },
  {
    source: "Eenadu",
    title: "Legal advice for just one rupee",
    url: "https://www.eenadu.net/telugu-news/andhra-pradesh/legal-advice-for-just-one-rupee/1702/125127057",
    date: "Recent",
    domain: "eenadu.net",
    logoUrl: "https://www.google.com/s2/favicons?domain=eenadu.net&sz=128",
    highlight: true,
  },
  {
    source: "Tupaki",
    title: "Justice for one rupee CLNS legal app",
    url: "https://www.tupaki.com/latest-news/justice-for-one-rupee-clns-legal-app-1437567",
    date: "Recent",
    domain: "tupaki.com",
    logoUrl: "https://www.google.com/s2/favicons?domain=tupaki.com&sz=128",
  },
  {
    source: "NTNews",
    title: "Kandika Adarsh success story",
    url: "https://www.ntnews.com/success-story/kandika-adarsh-success-story-2124292",
    date: "Recent",
    domain: "ntnews.com",
    logoUrl: "https://www.google.com/s2/favicons?domain=ntnews.com&sz=128",
  },
  {
    source: "Deccan Chronicle",
    title: "Telangana HC disposal rate improves but pendency remains high",
    url: "https://www.deccanchronicle.com/southern-states/telangana/telangana-hc-disposal-rate-improves-but-pendency-remains-high-1875523",
    date: "Recent",
    domain: "deccanchronicle.com",
    logoUrl: "https://www.google.com/s2/favicons?domain=deccanchronicle.com&sz=128",
    highlight: true,
  }
];

export function InTheNewsSection() {
  return (
    <section className="w-full bg-[#030914] py-24 text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 relative z-10">
        <div className="flex items-center gap-2 mb-4 text-blue-400 font-medium tracking-wider uppercase text-sm">
          <Newspaper className="h-5 w-5" />
          <span>In The News</span>
        </div>
        <h2 className="text-3xl font-semibold md:text-4xl tracking-tight text-center mb-12 pb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Recent News
        </h2>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden mt-8">
          <div className="group flex flex-row overflow-hidden p-4 [--duration:40s] [--gap:2rem] [gap:var(--gap)] w-full">
            <div className="flex shrink-0 flex-row justify-around [gap:var(--gap)] animate-marquee group-hover:[animation-play-state:paused]">
              {Array.from({ length: 2 }).map((_, setIndex) =>
                newsArticles.map((article, index) => (
                  <motion.a
                    key={`${setIndex}-${index}`}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -5 }}
                    className={`shrink-0 group flex flex-col justify-between rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                      article.highlight 
                        ? 'w-[450px] md:w-[550px] p-10 bg-gradient-to-br from-amber-500/10 via-white/5 to-transparent border-amber-500/50 hover:border-amber-400 shadow-[0_0_40px_-10px_rgba(251,191,36,0.2)] hover:shadow-[0_0_60px_-10px_rgba(251,191,36,0.4)]' 
                        : 'w-[320px] md:w-[360px] p-6 bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/30 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)]'
                    }`}
                  >
                    {article.highlight && (
                      <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[10px] font-extrabold uppercase tracking-widest rounded-bl-xl shadow-lg">
                        Featured
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-4 mt-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={article.logoUrl} 
                            alt={article.source} 
                            className="w-8 h-8 rounded-full bg-white object-contain border border-white/10" 
                          />
                          <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
                            article.highlight ? 'text-amber-400 bg-amber-400/10' : 'text-blue-400 bg-blue-400/10'
                          }`}>
                            {article.source}
                          </span>
                        </div>
                        <ExternalLink className={`h-4 w-4 transition-colors ${
                          article.highlight ? 'text-white/30 group-hover:text-amber-400' : 'text-white/30 group-hover:text-blue-400'
                        }`} />
                      </div>
                      <h3 className={`font-medium group-hover:text-white/90 leading-snug mb-4 ${
                        article.highlight ? 'text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-white' : 'text-lg md:text-xl text-white'
                      }`}>
                        {article.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/40 border-t border-white/5 pt-4 mt-2">
                      <span>{article.domain}</span>
                      <span>Read Article</span>
                    </div>
                  </motion.a>
                ))
              )}
            </div>
          </div>
          
          {/* Gradient edges for smooth scroll fade-out effect */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#030914] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#030914] to-transparent" />
        </div>
      </div>
    </section>
  );
}
