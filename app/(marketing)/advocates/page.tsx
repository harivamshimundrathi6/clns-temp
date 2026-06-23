"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Users,
  Scale,
  Building2,
  ChevronDown,
  User,
} from "lucide-react";
import Link from "next/link";
import { Footerdemo } from "@/components/ui/footer-section";

type Advocate = {
  name: string;
  city: string;
};

const advocatesData: Advocate[] = [
  { name: "Gudooru Sai Kumar Netha", city: "DD Colony" },
  { name: "Dharma Rajinikar Reddy", city: "N/A" },
  { name: "M. Gopal Rao", city: "N/A" },
  { name: "Rajashekar", city: "N/A" },
  { name: "Advocate Kumar", city: "Hyderabad" },
  { name: "Rama Krishna", city: "Chennai" },
  { name: "Raghavendra Reddy K", city: "Hyderabad" },
  { name: "Kandukuri Narasimha Chary", city: "Hyderabad" },
  { name: "Ramakrishna Reddy Nimmala", city: "Hyderabad" },
  { name: "Gottipamula Sharanya", city: "Bhongir" },
  { name: "Suresh Kumar K", city: "Hyderabad" },
  { name: "Suresh Kumar", city: "N/A" },
  { name: "Gopa Surya Praksh", city: "N/A" },
  { name: "Soumya Sree", city: "Ramagundam" },
  { name: "Ankani Abhishek", city: "Sircilla" },
  { name: "Baddam Sharannteja Goud", city: "Hyderabad" },
  { name: "Anil Babu Gajja", city: "Podili" },
  { name: "Sneha Gudikadi", city: "Hyderabad" },
  { name: "Yangala Mounika", city: "Ongole" },
  { name: "Shaik Irshad", city: "Rayachoty" },
  { name: "Sandadi Venkateswarlu", city: "Ongole" },
  { name: "Ramyagopika", city: "Vijayawada" },
  { name: "Ramesh Challa", city: "Hyderabad" },
  { name: "Harish Kuma", city: "Jjmkll" },
  { name: "Ananda Kumar Vejandla", city: "Vijayawada" },
  { name: "Vidyasagar Chettaboiena", city: "Hanmakonda" },
  { name: "Srinivas Nuthalapati", city: "Tenali" },
  { name: "Sudhakar Pedda Yammanuru", city: "Guntakal" },
  { name: "Hari K", city: "N/A" },
  { name: "J Narsing Rao", city: "Gajwel" },
  { name: "Shanthi Hari", city: "Hyderabad" },
  { name: "Talari Rajeswari", city: "Vijayawada" },
  { name: "Sandeep Pamarati", city: "Mangalagiri" },
  { name: "Sonti Gopikrishna", city: "Mangalagiri" },
  { name: "Kandula Rajyalaxmi", city: "Hayatnagar" },
  { name: "Talari Rajeswari", city: "Vijayawada" },
  { name: "Kommu Ramachandrudu", city: "Dhone" },
  { name: "Borampeta Sureshkumar", city: "Hyderabad" },
  { name: "Moiz Attari", city: "Hyderabad" },
  { name: "Satyanarayana Bodla", city: "Karimnagar" },
  { name: "Raghuveer Yashaswi", city: "Hyderabad" },
  { name: "Khijar Ali Khan", city: "Rayachoty" },
  { name: "Sanjeev Kumar", city: "Gajwel" },
  { name: "Venkat Bala", city: "Chennai" },
  { name: "Adarsh Kandika", city: "Hyderabad" },
  { name: "BPR Law Chambers", city: "Delhi" },
  { name: "Adepu Venu", city: "Sircilla" },
  { name: "Rajender P", city: "Hanumakonda" },
  { name: "Vijay Jyothula", city: "Vijayawada" },
  { name: "T Rajeswari", city: "Vijayawada" },
  { name: "Hazaratali Syed", city: "Kakinada" },
  { name: "Sandeep Kumar Goli", city: "Kothagudem" },
  { name: "Dr Syed Ussain Saheb", city: "Anantapur" },
  { name: "Chandra Sekhar", city: "Nandyal" },
  { name: "Ramesh Bhupathi", city: "N/A" },
  { name: "Satyanarayana Kethana", city: "Challapalli" },
  { name: "Sivaprasad BNV", city: "Vijayawada" },
  { name: "Mohan Akkam", city: "Vikarabad" },
  { name: "J Ashok", city: "Ieeja" },
  { name: "Rajashekar Reddy", city: "Hyderabad" },
  { name: "Mohan Goud", city: "Hyderabad" },
  { name: "Hari Babu", city: "Visakhapatnam" },
  { name: "Veligotla Srinivasu", city: "Kakinada" },
  { name: "Sree Charan", city: "Hyderabad" },
  { name: "Shobha Rani Tadem", city: "Hyderabad" },
  { name: "Brundavan Gentela", city: "Achampet" },
  { name: "Jagarapu Appalanaidu", city: "Visakhapatnam" },
  { name: "Kota Sambasiva Rao", city: "Narasaraopet" },
  { name: "Podamekala Mahesh", city: "Puttur" },
  { name: "Prasadarao Gondu", city: "Srikakulam" },
  { name: "Vijay Shankar Vumnabad", city: "Hyderabad" },
  { name: "Seetharamanjaneyulu Kalluri", city: "Guntur" },
  { name: "Budha Kusumanjali", city: "Vijayawada" },
  { name: "Naga Raju Lanke", city: "Repalle" },
  { name: "Kadam Vinayak Prasad Devrao", city: "Bhainsa" },
  { name: "Singaluri Venkatesh", city: "Vijayawada" },
  { name: "Villa N V S Dora Babu", city: "Visakhapatnam" },
  { name: "Koppaka Krishna", city: "Visakhapatnam" },
  { name: "Suma Latha", city: "Lingamplly" },
  { name: "Mudunuru Kethan Krishna", city: "Vijayawada" },
  { name: "Veerendranath Srirangam", city: "Hyderabad" },
  { name: "Suresh P", city: "Hyderabad" },
  { name: "Vishnu Reddy", city: "Guntur" },
  { name: "Venu Gopal", city: "Nirmal" },
  { name: "Venkat Rao", city: "Hyderabad" },
  { name: "Addagalla Sree Vidya", city: "Hyderabad" },
  { name: "Macha Raju", city: "Hyderabad" },
  { name: "Ganne Ravi Kiran", city: "Narasaraopet" },
  { name: "Bhanu Rekha", city: "Nandyal" },
  { name: "Bhavani Prasad", city: "Hanumakonda" },
  { name: "Jagannath Reddy Bhuma", city: "Allagadda" },
  { name: "Gorantala Narsing Rao", city: "Secunderabad" },
  { name: "Ravinder Reddy", city: "Hyderabad" },
  { name: "T Ramachandra", city: "Anantapur" },
  { name: "Chandra Sekhar", city: "Nuzvid" },
  { name: "Tirupati Medari", city: "Hyderabad" },
  { name: "Voleti Venkateswara Rao", city: "Kandukur" },
  { name: "Murali Vemula", city: "Bhimavaram" },
  { name: "Rajashekar Thogiti", city: "Metpally" },
  { name: "Shyamsundar K", city: "Ballari" },
  { name: "Thokala Mahender", city: "Hyderabad" },
  { name: "Narumolla Praveen Kumar", city: "Hyderabad" },
  { name: "Mouli Pasunuti", city: "Warangal" },
  { name: "Gottipamula Sharanya", city: "Bhongir" },
  { name: "Chandrasekhar Dhupam", city: "Repalle" },
  { name: "Pasula Giri", city: "Kurnool" },
  { name: "Ajay Kumar Mathangi", city: "Vijayawada" },
  { name: "Pavan Kumar", city: "Jangaon" },
  { name: "Satish Kumar P", city: "Kakinada" },
  { name: "Hari Shankar", city: "Hyderabad" },
  { name: "Kalingiri Ramanjaneyulu", city: "Nandyala" },
  { name: "Salim Malik", city: "Kadapa" },
  { name: "Vijay Naik", city: "Nandyala" },
  { name: "Bharath Reddy", city: "Anantapur" },
  { name: "Suresh Kumar Vemu", city: "Vijayawada" },
  { name: "Lakshmi Prasanna C", city: "Secunderabad" },
  { name: "Lalita Karira", city: "Hyderabad" },
  { name: "Balivada Venkateswara Rao", city: "Visakhapatnam" },
  { name: "Rajeshwar Raj", city: "Hyderabad" },
  { name: "Ramesh Banoth", city: "Hyderabad" },
  { name: "Rajesh K", city: "Velagapudi" },
  { name: "Sultan Mahmood Ali", city: "Hyderabad" },
  { name: "Sangeeta Mishra", city: "Hyderabad" },
  { name: "Pulukuri Raja Rathnam", city: "Adoni" },
  { name: "Sridhar M Ayyalvar Ayyori", city: "Hyderabad" },
  { name: "Venkata Pratap Kumar", city: "Vijayawada" },
  { name: "S Raja Srinath Rao", city: "Karimnagar" },
  { name: "Raghavendrahari Nakka", city: "Bengaluru" },
  { name: "Shabana Munawar", city: "Hyderabad" },
  { name: "Chandrasekhar Varma N", city: "Vijayawada" },
  { name: "Sravani Vemuri", city: "Hyderabad" },
  { name: "Srinivas Reddy Dodla", city: "Sangareddy" },
  { name: "Madhukar Eduru", city: "Gudur" },
  { name: "Mohammed Mehtab Alam", city: "Hyderabad" },
  { name: "Hari Rama Krishna Neelakantam", city: "Nalgonda" },
  { name: "Kondronpally Giri Babu", city: "Hyderabad" },
  { name: "Sujata Karmakar", city: "Secunderabad" },
  { name: "KVM Krishnamacharyulu", city: "Eluru" },
  { name: "Anjaneya Prasad", city: "Guntur" },
  { name: "Jagadeesh Talikota", city: "Nandyal" },
  { name: "Yeduru Rajesh Reddy", city: "Vijayawada" },
  { name: "Nabi Sab", city: "Adoni" },
  { name: "SaiRam Velisetti", city: "Rajahmundry" },
  { name: "M Nagendra Babu", city: "Penukonda" },
  { name: "Shodagiri Kiran", city: "Veerulapadu" },
  { name: "Penchala Praneeth Dornadula", city: "Nellore" },
  { name: "Ruth Sharon Naicker", city: "Karimnagar" },
  { name: "Vasantha Badugu", city: "Bhupalpally" },
  { name: "Keshav Rao", city: "Hyderabad" },
  { name: "Veerendranath Devaram", city: "Hyderabad" },
  { name: "Nagaveeranjaneyulu Kota", city: "Chilakaluripet" },
  { name: "P Hussain Sani", city: "Adoni" },
  { name: "Vinay Goud", city: "Sircilla" },
  { name: "Shashidhar G D", city: "Hyderabad" },
  { name: "Pochampally Giridhar", city: "Hyderabad" },
  { name: "Mohammed Mujeeb", city: "Hyderabad" },
  { name: "Ravindranath K", city: "Kainada" },
  { name: "Nimmala Chandrasekhar", city: "Kothuru" },
  { name: "Abdul Khader", city: "Hyderabad" },
  { name: "Prashant Kumar Potturi", city: "Hyderabad" },
  { name: "Adv Ankita Sonawale", city: "Aurangabad" },
  { name: "Sk Ummar", city: "Macherla" },
  { name: "Vamsi Krishna Reddy Bommireddy", city: "Nandyal" },
  { name: "Janagani Karthik Goud", city: "Hanumakonda" },
  { name: "Amulya Dasari", city: "Rajahmundry" },
  { name: "Anisetty Ravikishore", city: "N/A" },
  { name: "Tallapenta Rambabu", city: "Eluru" },
  { name: "Krishna Veni", city: "Vizag" },
  { name: "Adrian Shaikh", city: "Mumbai" },
  { name: "Sudheer J", city: "Hyderabad" },
  { name: "Rajashekhar Reddy", city: "Warangal" },
  { name: "Vishnu Reddy Chinthaguntla", city: "Guntur" },
  { name: "Zeus VJ", city: "Hyderabad" },
  { name: "P N N Tagore", city: "Rajahmundry" },
  { name: "V Raghava", city: "Hyderabad" },
  { name: "Rajaswamy Aldandi", city: "Hyderabad" },
  { name: "Santosh Sagar K", city: "Bangalore" },
  { name: "Govardhan Gyara", city: "Hyderabad" },
  { name: "Nizamkari Muralidhar", city: "Gadwal" },
  { name: "Penagadam Suresh Kumar", city: "Tirupati" },
  { name: "Naveen Kumar", city: "Hyderabad" },
  { name: "Ravinder Bheema", city: "Hyderabad" },
  { name: "Narendra Nathreddy Vennapusa", city: "Mydukur" },
];

const ITEMS_PER_PAGE = 24;

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const cardVariant = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Generate a consistent color from name
function getAvatarColor(name: string) {
  const colors = [
    "from-teal-500 to-cyan-600",
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-cyan-500 to-blue-600",
    "from-sky-500 to-blue-600",
    "from-indigo-500 to-purple-600",
    "from-violet-500 to-purple-600",
    "from-teal-400 to-emerald-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function AdvocatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Get unique cities sorted
  const cities = useMemo(() => {
    const citySet = new Set(advocatesData.map((a) => a.city));
    citySet.delete("N/A");
    return ["All", ...Array.from(citySet).sort()];
  }, []);

  // Filter advocates
  const filteredAdvocates = useMemo(() => {
    return advocatesData.filter((adv) => {
      const matchesSearch = adv.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCity =
        selectedCity === "All" || adv.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [searchQuery, selectedCity]);

  const visibleAdvocates = filteredAdvocates.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAdvocates.length;

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedCity]);

  // Stats
  const totalAdvocates = advocatesData.length;
  const uniqueCities = new Set(
    advocatesData.map((a) => a.city).filter((c) => c !== "N/A")
  ).size;

  const totalCount = useCountUp(totalAdvocates);
  const cityCount = useCountUp(uniqueCities);

  return (
    <main className="relative min-h-screen bg-[#020712] text-white">
      {/* HERO SECTION */}
      <section className="relative isolate flex min-h-[60vh] items-center justify-center px-6 py-28">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/30 via-navy-950/40 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.15),transparent_70%)] blur-[140px]" />

        {/* Shimmer Effect */}
        <motion.div
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(34,211,238,0.08)_50%,transparent_100%)] bg-[length:200%_100%] opacity-60"
        />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-8 flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-5 py-2 text-sm text-teal-300 backdrop-blur-sm"
          >
            <Scale className="h-4 w-4" />
            <span>CLNS Legal Network</span>
          </motion.div>

          <motion.h1
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Our{" "}
            <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Advocates
            </span>
          </motion.h1>

          {/* Neon Accent Line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.25, delay: 0.3 }}
            className="mt-8 h-px w-24 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.6)]"
          />

          <motion.p
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ duration: 0.25, delay: 0.2 }}
            className="mt-8 max-w-3xl text-lg leading-relaxed text-white/80 sm:text-xl"
          >
            A network of{" "}
            <span className="font-semibold text-teal-300">
              {totalAdvocates}+ verified advocates
            </span>{" "}
            across India, committed to making legal access simple,
            transparent, and affordable for everyone.
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-12 flex gap-8 sm:gap-16"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-white sm:text-5xl">
                {totalCount}
                <span className="text-teal-400">+</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-white/60">
                <Users className="h-4 w-4" />
                Advocates
              </div>
            </div>
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="text-center">
              <div className="text-4xl font-bold text-white sm:text-5xl">
                {cityCount}
                <span className="text-teal-400">+</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-white/60">
                <Building2 className="h-4 w-4" />
                Cities
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEARCH & FILTER SECTION */}
      <section className="relative px-6 py-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020712] to-[#030a16]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search advocates by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder-white/40 backdrop-blur-xl outline-none transition-all focus:border-teal-400/50 focus:bg-white/8 focus:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
              />
            </div>

            {/* City Filter */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40 pointer-events-none z-10" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="appearance-none rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-12 text-white backdrop-blur-xl outline-none transition-all focus:border-teal-400/50 cursor-pointer min-w-[200px]"
              >
                {cities.map((city) => (
                  <option
                    key={city}
                    value={city}
                    className="bg-[#0a1628] text-white"
                  >
                    {city === "All" ? "All Cities" : city}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
          </motion.div>

          {/* Results count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-sm text-white/50"
          >
            Showing{" "}
            <span className="text-teal-300 font-medium">
              {visibleAdvocates.length}
            </span>{" "}
            of{" "}
            <span className="text-teal-300 font-medium">
              {filteredAdvocates.length}
            </span>{" "}
            advocates
            {selectedCity !== "All" && (
              <span>
                {" "}
                in{" "}
                <span className="text-teal-300 font-medium">
                  {selectedCity}
                </span>
              </span>
            )}
          </motion.p>
        </div>
      </section>

      {/* ADVOCATES GRID */}
      <section className="relative px-6 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030a16] via-[#020712] to-[#010409]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {visibleAdvocates.map((advocate, index) => (
              <motion.div
                key={`${advocate.name}-${advocate.city}-${index}`}
                variants={cardVariant}
                transition={{
                  duration: 0.2,
                  ease: [0, 0, 0.2, 1],
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-200 hover:border-teal-400/30 hover:bg-white/[0.06] hover:shadow-[0_20px_60px_rgba(34,211,238,0.12)]"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative z-10 flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarColor(
                      advocate.name
                    )} text-sm font-bold text-white shadow-lg transition-transform group-hover:scale-110`}
                  >
                    {getInitials(advocate.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-white/90 group-hover:text-white">
                      {advocate.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 flex-shrink-0 text-teal-400/70" />
                      <span className="truncate text-xs text-white/50 group-hover:text-white/70">
                        {advocate.city === "N/A"
                          ? "India"
                          : advocate.city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Consult Button */}
                <div className="relative z-10 mt-4">
                  <Link
                    href="/signup"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-400/20 bg-teal-500/10 px-4 py-2 text-xs font-semibold text-teal-300 transition-all hover:border-teal-400/40 hover:bg-teal-500/20 hover:text-teal-200 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                  >
                    <Scale className="h-3.5 w-3.5" />
                    Consult
                  </Link>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-1/2 h-[1px] w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-teal-400 to-transparent transition-all duration-300 group-hover:w-3/4" />
              </motion.div>
            ))}
          </motion.div>

          {/* Empty state */}
          {filteredAdvocates.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <User className="h-8 w-8 text-white/30" />
              </div>
              <h3 className="text-xl font-semibold text-white/70">
                No advocates found
              </h3>
              <p className="mt-2 text-sm text-white/40">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          )}

          {/* Load More */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 flex justify-center"
            >
              <button
                onClick={() =>
                  setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
                }
                className="group relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white/80 backdrop-blur transition-all hover:border-teal-400/30 hover:bg-white/8 hover:text-white hover:shadow-[0_10px_40px_rgba(34,211,238,0.15)]"
              >
                <span>Load More Advocates</span>
                <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative px-6 py-24">
        <div className="absolute inset-0 bg-[#010307]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.2),transparent_70%)] blur-[120px]" />
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 0.25 }}
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center rounded-[40px] border border-white/10 bg-black/30 p-12 sm:p-16 text-center shadow-[0_50px_150px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          <Scale className="mb-6 h-12 w-12 text-teal-400" />
          <h2 className="text-3xl font-bold leading-tight text-transparent sm:text-4xl bg-gradient-to-r from-teal-300 via-sky-400 to-blue-400 bg-clip-text">
            Join Our Growing Legal Network
          </h2>
          <p className="mt-6 text-lg text-white/70 max-w-2xl">
            Are you an advocate looking to expand your practice? Join CLNS
            and connect with clients across India through our digital
            platform.
          </p>
          <a
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-4 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(34,211,238,0.3)] transition-all hover:shadow-[0_15px_50px_rgba(34,211,238,0.5)] hover:scale-105"
          >
            Get in Touch
          </a>
        </motion.div>
      </section>

      <Footerdemo />
    </main>
  );
}
