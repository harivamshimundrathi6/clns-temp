"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  MapPin,
  Users,
  Scale,
  Building2,
  ChevronDown,
  User,
  BadgeCheck,
  Landmark,
} from "lucide-react";
import { Footerdemo } from "@/components/ui/footer-section";

type Advocate = {
  name: string;
  city: string;
  barId?: string;
  court?: string;
  verified?: boolean;
};

// ── VERIFIED ADVOCATES (with Bar Council ID & Court) ── ON TOP ──
const verifiedAdvocates: Advocate[] = [
  { name: "Gudooru Sai Kumar Netha", city: "Hyderabad", barId: "TS/3268/2021", court: "High Court", verified: true },
  { name: "Dharma Rajinikar Reddy", city: "Hyderabad", barId: "TS/3268/2021", court: "High Court", verified: true },
  { name: "M. Gopal Rao", city: "Hyderabad", barId: "TS/2002/2013", court: "High Court", verified: true },

  { name: "Raghavendra Reddy K", city: "Hyderabad", barId: "TS/2187/2016", court: "High Court", verified: true },
  { name: "Kandukuri Narasimha Chary", city: "Hyderabad", barId: "TS/2234/2008", court: "High Court", verified: true },
  { name: "Gottipamula Sharanya", city: "Bhongir", barId: "TS/1548/2024", court: "District Court Bhongir", verified: true },
  { name: "Suresh Kumar K", city: "Hyderabad", barId: "TS/2646/2015", court: "High Court", verified: true },
  { name: "Soumya Sree", city: "Ramagundam", barId: "TS/1678/2024", court: "High Court of Telangana", verified: true },
  { name: "Ankani Abhishek", city: "Sircilla", barId: "3155/23", court: "Rajanna Sircilla", verified: true },
  { name: "Baddam Sharannteja Goud", city: "Hyderabad", barId: "2295/2023", court: "High Court, RR Dist Court", verified: true },
  { name: "Anil Babu Gajja", city: "Podili", barId: "AP/2090/2021", court: "Podili, Darsi, Kanigiri, Markapur", verified: true },
  { name: "Sneha Gudikadi", city: "Hyderabad", barId: "2365/2023", court: "Ranga Reddy District Court & High Court", verified: true },
  { name: "Yangala Mounika", city: "Ongole", barId: "AP/167/2021", court: "District Court, Prakasam", verified: true },
  { name: "Sandadi Venkateswarlu", city: "Ongole", barId: "AP/2206/2018", court: "District Court Ongole", verified: true },
  { name: "Ramyagopika", city: "Vijayawada", barId: "AP/2974/2023", court: "Vijayawada", verified: true },
  { name: "Ananda Kumar Vejandla", city: "Vijayawada", barId: "AP/681/2022", court: "High Court of Andhra Pradesh", verified: true },
  { name: "Vidyasagar Chettaboiena", city: "Hanmakonda", barId: "3695", court: "Warangal", verified: true },
  { name: "Srinivas Nuthalapati", city: "Tenali", barId: "AP460/2023", court: "High Court", verified: true },
  { name: "Sudhakar Pedda Yammanuru", city: "Guntakal", barId: "AP/161/2024", court: "Guntakal", verified: true },
  { name: "Shanthi Hari", city: "Hyderabad", barId: "18109", court: "High Court", verified: true },
  { name: "Talari Rajeswari", city: "Vijayawada", barId: "AP676/2022", court: "AP High Court", verified: true },
  { name: "Sandeep Pamarati", city: "Mangalagiri", barId: "AP/646/2022", court: "AP High Court", verified: true },
  { name: "Sonti Gopikrishna", city: "Mangalagiri", barId: "AP/1479", court: "High Court of Andhra Pradesh", verified: true },
  { name: "Kandula Rajyalaxmi", city: "Hayatnagar", barId: "TS/3216/2017", court: "Rangareddy", verified: true },
  { name: "Kommu Ramachandrudu", city: "Dhone", barId: "AP/1075/2025", court: "Prl JCJ Court, Dhone, Nandyal", verified: true },
  { name: "Borampeta Sureshkumar", city: "Hyderabad", barId: "TS/152/2021", court: "All Courts", verified: true },
  { name: "Moiz Attari", city: "Hyderabad", barId: "23666", court: "City Civil Court", verified: true },
  { name: "Satyanarayana Bodla", city: "Karimnagar", barId: "TS/2446/2024", court: "Karimnagar Court", verified: true },
  { name: "Raghuveer Yashaswi", city: "Hyderabad", barId: "TS289/2019", court: "Warangal", verified: true },
  { name: "Khijar Ali Khan", city: "Rayachoty", barId: "AP/27/2019", court: "Courts", verified: true },
  { name: "Sanjeev Kumar", city: "Gajwel", barId: "AP/930/2011", court: "High Court", verified: true },
  { name: "Venkat Bala", city: "Chennai", barId: "Bar125", court: "High Court", verified: true },
  { name: "Adarsh Kandika", city: "Hyderabad", barId: "TS/2024", court: "Consultant", verified: true },
  { name: "BPR Law Chambers", city: "Delhi", barId: "R/4850/2023", court: "Delhi", verified: true },
  { name: "Adepu Venu", city: "Sircilla", barId: "TS/901/2010", court: "District Court Rajanna Sircilla", verified: true },
  { name: "Vijay Jyothula", city: "Vijayawada", barId: "AP/3663/2018", court: "High Court of AP", verified: true },
  { name: "Dr Syed Ussain Saheb", city: "Anantapur", barId: "AP/1230/2006", court: "Kurnool & High Court of AP", verified: true },
  { name: "Chandra Sekhar", city: "Nandyal", barId: "AP/13/1060", court: "Nandyal", verified: true },
  { name: "Ramesh Bhupathi", city: "Hyderabad", barId: "TS/1521/2011", court: "High Court", verified: true },
  { name: "Sivaprasad BNV", city: "Vijayawada", barId: "AP/1057-2013", court: "Civil Courts", verified: true },
  { name: "Mohan Akkam", city: "Vikarabad", barId: "TS/3131/2022", court: "Vikarabad District Court", verified: true },
  { name: "J Ashok", city: "Gadwal", barId: "TS/2097/2022", court: "Gadwal", verified: true },
  { name: "Rajashekar Reddy", city: "Hyderabad", barId: "TS/1643/2019", court: "All Courts", verified: true },
  { name: "Mohan Goud", city: "Hyderabad", barId: "TS/2642/2013", court: "Telangana High Court", verified: true },
  { name: "Hari Babu", city: "Visakhapatnam", barId: "AP/666/2024", court: "High Court", verified: true },
  { name: "Jagarapu Appalanaidu", city: "Visakhapatnam", barId: "AP/2688/2024", court: "Visakhapatnam", verified: true },
  { name: "Prasadarao Gondu", city: "Srikakulam", barId: "AP/1886/2009", court: "Srikakulam", verified: true },
  { name: "Vijay Shankar Vumnabad", city: "Hyderabad", barId: "TS/1428/2023", court: "Rangareddy District Court & High Court", verified: true },
  { name: "Seetharamanjaneyulu Kalluri", city: "Guntur", barId: "AP/3015/2016", court: "Guntur", verified: true },
  { name: "Budha Kusumanjali", city: "Vijayawada", barId: "AP/354/2023", court: "AP High Court", verified: true },
  { name: "Naga Raju Lanke", city: "Repalle", barId: "AP/1235/2022", court: "AP High Court", verified: true },
  { name: "Kadam Vinayak Prasad Devrao", city: "Bhainsa", barId: "TS 2165/2019", court: "Nirmal", verified: true },
  { name: "Singaluri Venkatesh", city: "Vijayawada", barId: "AP/894/2006", court: "Vijayawada", verified: true },
  { name: "Villa N V S Dora Babu", city: "Visakhapatnam", barId: "1129/2002", court: "High Court", verified: true },
  { name: "Koppaka Krishna", city: "Visakhapatnam", barId: "AP/4117/1999", court: "Visakhapatnam", verified: true },
  { name: "Suma Latha", city: "Lingamplly", barId: "TS/2773/2018", court: "Kukatpally Court", verified: true },
  { name: "Mudunuru Kethan Krishna", city: "Vijayawada", barId: "AP/3393/2024", court: "Vijayawada", verified: true },
  { name: "Veerendranath Srirangam", city: "Hyderabad", barId: "TS/604/2009", court: "Rangareddy Court, LB Nagar", verified: true },
  { name: "Suresh P", city: "Hyderabad", barId: "TS/1730/2022", court: "TS High Court", verified: true },
  { name: "Macha Raju", city: "Hyderabad", barId: "TS/1206/2023", court: "High Court of Telangana", verified: true },
  { name: "Ganne Ravi Kiran", city: "Narasaraopet", barId: "AP 685/2025", court: "Narasaraopet", verified: true },
  { name: "Bhanu Rekha", city: "Nandyal", barId: "1096/2025", court: "3rd Additional District Court", verified: true },
  { name: "Bhavani Prasad", city: "Hanumakonda", barId: "TS/1100/2021", court: "Hanumakonda", verified: true },
  { name: "Jagannath Reddy Bhuma", city: "Allagadda", barId: "AP/1003/2008", court: "Allagadda", verified: true },
  { name: "Gorantala Narsing Rao", city: "Secunderabad", barId: "TS/3382/2001", court: "All Courts — Secunderabad & Hyderabad", verified: true },
  { name: "Ravinder Reddy", city: "Hyderabad", barId: "TS1548/2020", court: "City Civil Court", verified: true },
  { name: "T Ramachandra", city: "Anantapur", barId: "1987", court: "Anantapur", verified: true },
  { name: "Chandra Sekhar", city: "Nuzvid", barId: "AP/3243/2018", court: "Nuzvid", verified: true },
  { name: "Tirupati Medari", city: "Hyderabad", barId: "TS/1680/2016", court: "City Civil & Criminal Court, Secunderabad", verified: true },
  { name: "Voleti Venkateswara Rao", city: "Kandukur", barId: "AP/1052/2021", court: "Kandukur", verified: true },
  { name: "Murali Vemula", city: "Bhimavaram", barId: "AP/1349/2021", court: "AP High Court", verified: true },
  { name: "Rajashekar Thogiti", city: "Metpally", barId: "TS/2594/2007", court: "SCJ & JCJ Metpally", verified: true },
  { name: "Shyamsundar K", city: "Ballari", barId: "Kar/2535/98", court: "Ballari District Court", verified: true },
  { name: "Thokala Mahender", city: "Hyderabad", barId: "TS/2961/2022", court: "Rangareddy", verified: true },
  { name: "Chandrasekhar Dhupam", city: "Repalle", barId: "AP/3200/2024", court: "High Court of Andhra Pradesh", verified: true },
  { name: "Pasula Giri", city: "Kurnool", barId: "AP/1533/2022", court: "Anantapur", verified: true },
  { name: "Ajay Kumar Mathangi", city: "Vijayawada", barId: "AP/792/2018", court: "Vijayawada", verified: true },
  { name: "Pavan Kumar", city: "Jangaon", barId: "TS/1366/2020", court: "Jangaon", verified: true },
  { name: "Satish Kumar P", city: "Kakinada", barId: "AP/270/2011", court: "Kakinada", verified: true },
  { name: "Hari Shankar", city: "Hyderabad", barId: "TS/2036/2020", court: "Kukatpally Court, Hyderabad", verified: true },
  { name: "Kalingiri Ramanjaneyulu", city: "Nandyala", barId: "AP/2568/2012", court: "Kurnool & Nandyal", verified: true },
  { name: "Vijay Naik", city: "Nandyala", barId: "AP/3053/2016", court: "Nandyala", verified: true },
  { name: "Bharath Reddy", city: "Anantapur", barId: "AP/2390/2018", court: "AP High Court", verified: true },
  { name: "Suresh Kumar Vemu", city: "Vijayawada", barId: "AP/1312/2019", court: "Vijayawada", verified: true },
  { name: "Lalita Karira", city: "Hyderabad", barId: "TS/1463-A/2015", court: "High Court & District Court", verified: true },
  { name: "Balivada Venkateswara Rao", city: "Visakhapatnam", barId: "1223/2025", court: "Bheemunipatnam", verified: true },
  { name: "Ramesh Banoth", city: "Hyderabad", barId: "TS/240/22", court: "Sangareddy, Kukatpally, LB Nagar, Medchal", verified: true },
  { name: "Sangeeta Mishra", city: "Hyderabad", barId: "MAH/183/1997", court: "High Court", verified: true },
  { name: "Pulukuri Raja Rathnam", city: "Adoni", barId: "AP/56/2013", court: "District Court", verified: true },
  { name: "Sridhar M Ayyalvar Ayyori", city: "Hyderabad", barId: "TS/2874/2012", court: "High Court", verified: true },
  { name: "Venkata Pratap Kumar", city: "Vijayawada", barId: "AP/433/2019", court: "AP HC & Vijayawada District Court", verified: true },
  { name: "S Raja Srinath Rao", city: "Karimnagar", barId: "TS1216/2019", court: "Karimnagar", verified: true },
  { name: "Raghavendrahari Nakka", city: "Bengaluru", barId: "AP/1255/2025", court: "Anantapur", verified: true },
  { name: "Shabana Munawar", city: "Hyderabad", barId: "TS/579/2018", court: "High Court of Telangana", verified: true },
  { name: "Chandrasekhar Varma N", city: "Vijayawada", barId: "AP/283/2023", court: "High Court of AP", verified: true },
  { name: "Sravani Vemuri", city: "Hyderabad", barId: "AP/2972/2024", court: "Ranga Reddy Court", verified: true },
  { name: "Srinivas Reddy Dodla", city: "Sangareddy", barId: "2943/2021", court: "Sangareddy", verified: true },
  { name: "Madhukar Eduru", city: "Gudur", barId: "AP/3062/2023", court: "Gudur", verified: true },
  { name: "Mohammed Mehtab Alam", city: "Hyderabad", barId: "2415/2024", court: "Rangareddy District Court", verified: true },
  { name: "Hari Rama Krishna Neelakantam", city: "Nalgonda", barId: "TS/138/2022", court: "Telangana High Court", verified: true },
  { name: "Kondronpally Giri Babu", city: "Hyderabad", barId: "9993", court: "Ranga Reddy District Court", verified: true },
  { name: "Sujata Karmakar", city: "Secunderabad", barId: "TS 785/1993", court: "All Courts in Telangana", verified: true },
  { name: "KVM Krishnamacharyulu", city: "Eluru", barId: "1263/2003", court: "District Court", verified: true },
  { name: "Jagadeesh Talikota", city: "Nandyal", barId: "AP/746/2016", court: "Nandyal, Kurnool, Allagadda Courts", verified: true },
  { name: "Yeduru Rajesh Reddy", city: "Vijayawada", barId: "AP/1922/2024", court: "AP High Court & District Courts", verified: true },
  { name: "Nabi Sab", city: "Adoni", barId: "KAR(P)/586/2024", court: "Siruguppa", verified: true },
  { name: "SaiRam Velisetti", city: "Rajahmundry", barId: "AP/729/2024", court: "Rajahmundry", verified: true },
  { name: "M Nagendra Babu", city: "Penukonda", barId: "AP/1414/2020", court: "Penukonda Bar Association", verified: true },
  { name: "Penchala Praneeth Dornadula", city: "Nellore", barId: "AP/84/2017", court: "Nellore", verified: true },
  { name: "Ruth Sharon Naicker", city: "Karimnagar", barId: "TS/526/2024", court: "Karimnagar", verified: true },
  { name: "Veerendranath Devaram", city: "Hyderabad", barId: "TS/2941/2015", court: "Telangana High Court", verified: true },
  { name: "Nagaveeranjaneyulu Kota", city: "Chilakaluripet", barId: "AP/2213/2019", court: "Chilakaluripet", verified: true },
  { name: "P Hussain Sani", city: "Adoni", barId: "AP/377/2021", court: "Adoni", verified: true },
  { name: "Shashidhar G D", city: "Hyderabad", barId: "309/1994", court: "All Courts — Hyderabad & Secunderabad", verified: true },
  { name: "Pochampally Giridhar", city: "Hyderabad", barId: "TS/3586/2001", court: "Ranga Reddy Court", verified: true },
  { name: "Mohammed Mujeeb", city: "Hyderabad", barId: "TS/1731/2016", court: "Criminal Court Hyderabad", verified: true },
  { name: "Nimmala Chandrasekhar", city: "Kothuru", barId: "AP/637/2021", court: "Kothuru", verified: true },
  { name: "Prashant Kumar Potturi", city: "Hyderabad", barId: "TS/2065/2005", court: "Medchal Malkajgiri District Court", verified: true },
  { name: "Adv Ankita Sonawale", city: "Aurangabad", barId: "MAH/13476/2025", court: "Aurangabad", verified: true },
  { name: "Janagani Karthik Goud", city: "Hanumakonda", barId: "TS 3052/2021", court: "All Courts in Telangana", verified: true },
  { name: "Amulya Dasari", city: "Rajahmundry", barId: "AP/613/2011", court: "Rajahmundry District Court", verified: true },
  { name: "Tallapenta Rambabu", city: "Eluru", barId: "AP/3647/2025", court: "Eluru", verified: true },
  { name: "Adrian Shaikh", city: "Mumbai", barId: "MAH/1650/2020", court: "High Court", verified: true },
  { name: "Sudheer J", city: "Hyderabad", barId: "TS/1688/2017", court: "Telangana High Court", verified: true },
  { name: "Rajashekhar Reddy", city: "Warangal", barId: "TS/1643/2018", court: "Warangal", verified: true },
  { name: "Zeus VJ", city: "Hyderabad", barId: "11223344556677", court: "Govt", verified: true },
  { name: "P N N Tagore", city: "Rajahmundry", barId: "AP/488/1999", court: "East Godavari", verified: true },
  { name: "Rajaswamy Aldandi", city: "Hyderabad", barId: "AP/784/2025", court: "Medchal-Malkajgiri District Court", verified: true },
  { name: "Santosh Sagar K", city: "Bangalore", barId: "TS/558/2020", court: "TS, AP, Karnataka", verified: true },
  { name: "Govardhan Gyara", city: "Hyderabad", barId: "TS/2387/2024", court: "RR Court", verified: true },
  { name: "Nizamkari Muralidhar", city: "Gadwal", barId: "TS/2909/2015", court: "Principal District Court, Gadwal", verified: true },
  { name: "Penagadam Suresh Kumar", city: "Tirupati", barId: "AP/4629/2026", court: "Tirupati", verified: true },
  { name: "Naveen Kumar", city: "Hyderabad", barId: "TS/2611/2025", court: "Ranga Reddy", verified: true },
  { name: "Ravinder Bheema", city: "Hyderabad", barId: "TS/2931/2022", court: "Hyderabad", verified: true },
  { name: "Narendra Nathreddy Vennapusa", city: "Mydukur", barId: "AP/2506/2016", court: "Proddatur", verified: true },
];

// ── REMAINING ADVOCATES (from original list, no Bar ID yet) ──
const otherAdvocates: Advocate[] = [
  { name: "Rajashekar", city: "Hyderabad" },
  { name: "Advocate Kumar", city: "Hyderabad" },
  { name: "Ramakrishna Reddy Nimmala", city: "Hyderabad" },
  { name: "Suresh Kumar", city: "Hyderabad" },
  { name: "Gopa Surya Praksh", city: "Hyderabad" },
  { name: "Shaik Irshad", city: "Rayachoty" },
  { name: "Ramesh Challa", city: "Hyderabad" },
  { name: "Harish Kuma", city: "Hyderabad" },
  { name: "Hari K", city: "Hyderabad" },
  { name: "J Narsing Rao", city: "Gajwel" },
  { name: "Rajender P", city: "Hanumakonda" },
  { name: "T Rajeswari", city: "Vijayawada" },
  { name: "Hazaratali Syed", city: "Kakinada" },
  { name: "Sandeep Kumar Goli", city: "Kothagudem" },
  { name: "Satyanarayana Kethana", city: "Challapalli" },
  { name: "Veligotla Srinivasu", city: "Kakinada" },
  { name: "Sree Charan", city: "Hyderabad" },
  { name: "Shobha Rani Tadem", city: "Hyderabad" },
  { name: "Brundavan Gentela", city: "Achampet" },
  { name: "Kota Sambasiva Rao", city: "Narasaraopet" },
  { name: "Podamekala Mahesh", city: "Puttur" },
  { name: "Vishnu Reddy", city: "Guntur" },
  { name: "Venu Gopal", city: "Nirmal" },
  { name: "Venkat Rao", city: "Hyderabad" },
  { name: "Addagalla Sree Vidya", city: "Hyderabad" },
  { name: "Narumolla Praveen Kumar", city: "Hyderabad" },
  { name: "Mouli Pasunuti", city: "Warangal" },
  { name: "Salim Malik", city: "Kadapa" },
  { name: "Lakshmi Prasanna C", city: "Secunderabad" },
  { name: "Rajeshwar Raj", city: "Hyderabad" },
  { name: "Rajesh K", city: "Velagapudi" },
  { name: "Sultan Mahmood Ali", city: "Hyderabad" },
  { name: "Shodagiri Kiran", city: "Veerulapadu" },
  { name: "Vasantha Badugu", city: "Bhupalpally" },
  { name: "Keshav Rao", city: "Hyderabad" },
  { name: "Vinay Goud", city: "Sircilla" },
  { name: "Ravindranath K", city: "Kainada" },
  { name: "Abdul Khader", city: "Hyderabad" },
  { name: "Sk Ummar", city: "Macherla" },
  { name: "Vamsi Krishna Reddy Bommireddy", city: "Nandyal" },
  { name: "Anisetty Ravikishore", city: "Hyderabad" },
  { name: "Krishna Veni", city: "Vizag" },
  { name: "Vishnu Reddy Chinthaguntla", city: "Guntur" },
  { name: "V Raghava", city: "Hyderabad" },
];

// Combined: verified on top, others below
// Combined: verified on top, others below
// Removed the static advocatesData global so it can be dynamically generated inside the component

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

function getEnrollmentYear(barId?: string): number {
  if (!barId) return 9999;
  
  // Look for all 4-digit years (19xx or 20xx)
  const matches = barId.match(/(19|20)\d{2}(?!\d)/g);
  if (matches) {
    // If multiple, the year of enrollment is usually the last one (e.g. AP/1922/2024 -> 2024)
    return parseInt(matches[matches.length - 1], 10);
  }
  
  // Look for 2-digit year at the end (e.g. /98, /23)
  const match2 = barId.match(/\/(\d{2})$/);
  if (match2) {
    const y = parseInt(match2[1], 10);
    return y < 50 ? 2000 + y : 1900 + y;
  }
  
  // If no year found, put them at the end
  return 9999;
}

export default function AdvocatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [dbAdvocates, setDbAdvocates] = useState<Advocate[]>([]);

  useEffect(() => {
    async function loadDbAdvocates() {
      try {
        const res = await fetch("/api/advocates");
        const data = await res.json();
        if (data.success && data.advocates) {
          setDbAdvocates(data.advocates);
        }
      } catch (err) {
        console.error("Failed to load db advocates", err);
      }
    }
    loadDbAdvocates();
  }, []);

  const advocatesData = useMemo(() => {
    // Get DB names to filter out duplicates from static lists
    const dbNames = new Set(dbAdvocates.map(a => a.name.toLowerCase()));

    const staticList = [...verifiedAdvocates, ...otherAdvocates].filter(
      (a) => a.name !== "T Ramachandra" && !dbNames.has(a.name.toLowerCase())
    );

    const combinedOriginal = [...dbAdvocates, ...staticList];

    // Sort a copy by experience to find the top most experienced
    const sortedByExperience = [...combinedOriginal].sort((a, b) => {
      const yearA = getEnrollmentYear(a.barId);
      const yearB = getEnrollmentYear(b.barId);
      
      if (yearA !== yearB) {
        return yearA - yearB;
      }
      if (a.verified !== b.verified) {
        return a.verified ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    // Take the first page's worth of advocates (24)
    const top24 = sortedByExperience.slice(0, ITEMS_PER_PAGE);
    const top24Names = new Set(top24.map(a => a.name));

    // The rest of the advocates
    const rest = combinedOriginal.filter(a => !top24Names.has(a.name));

    // Deterministic pseudo-random shuffle for the rest to avoid hydration errors but appear random
    rest.sort((a, b) => {
      const hash = (str: string) => str.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0);
      return hash(a.name) - hash(b.name);
    });

    return [...top24, ...rest];
  }, [dbAdvocates]);

  const cities = useMemo(() => {
    const citySet = new Set(advocatesData.map((a) => a.city));
    return ["All", ...Array.from(citySet).sort()];
  }, [advocatesData]);

  const filteredAdvocates = useMemo(() => {
    return advocatesData.filter((adv) => {
      const matchesSearch =
        adv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (adv.barId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (adv.court?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCity =
        selectedCity === "All" || adv.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [searchQuery, selectedCity, advocatesData]);

  const visibleAdvocates = filteredAdvocates.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAdvocates.length;

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedCity]);

  const totalCount = useCountUp(200);
  const cityCount = useCountUp(70);

  return (
    <main className="relative min-h-screen bg-[#020712] text-white">
      {/* HERO SECTION */}
      <section className="relative isolate flex min-h-[60vh] items-center justify-center px-6 py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/30 via-navy-950/40 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.15),transparent_70%)] blur-[140px]" />

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
              200+ verified advocates
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
                100
                <span className="text-teal-400">%</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-white/60">
                <BadgeCheck className="h-4 w-4" />
                Verified
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
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search by name, bar ID, or court..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder-white/40 backdrop-blur-xl outline-none transition-all focus:border-teal-400/50 focus:bg-white/8 focus:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
              />
            </div>

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
                className={`group relative overflow-hidden rounded-2xl border p-5 backdrop-blur-sm transition-all duration-200 hover:shadow-[0_20px_60px_rgba(34,211,238,0.12)] ${
                  advocate.verified
                    ? "border-teal-400/15 bg-white/[0.04] hover:border-teal-400/40 hover:bg-white/[0.07]"
                    : "border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

                {/* Verified badge glow */}
                {advocate.verified && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-teal-400/10 to-transparent rounded-bl-3xl" />
                )}

                <div className="relative z-10">
                  {/* Header row */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarColor(
                        advocate.name
                      )} text-sm font-bold text-white shadow-lg transition-transform group-hover:scale-110`}
                    >
                      {getInitials(advocate.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate text-sm font-semibold text-white/90 group-hover:text-white">
                          {advocate.name}
                        </h3>
                        {advocate.verified && (
                          <BadgeCheck className="h-4 w-4 flex-shrink-0 text-teal-400" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 flex-shrink-0 text-teal-400/70" />
                        <span className="truncate text-xs text-white/50 group-hover:text-white/70">
                          {advocate.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bar ID & Court info */}
                  {advocate.barId && (
                    <div className="mt-3 space-y-1.5 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Scale className="h-3 w-3 flex-shrink-0 text-cyan-400/70" />
                        <span className="truncate text-[11px] font-medium text-cyan-300/80">
                          {advocate.barId}
                        </span>
                      </div>
                      {advocate.court && (
                        <div className="flex items-center gap-2">
                          <Landmark className="h-3 w-3 flex-shrink-0 text-white/40" />
                          <span className="truncate text-[11px] text-white/40">
                            {advocate.court}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Consult Button */}
                  <div className="mt-4">
                    <Link
                      href="/signup"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-400/20 bg-teal-500/10 px-4 py-2 text-xs font-semibold text-teal-300 transition-all hover:border-teal-400/40 hover:bg-teal-500/20 hover:text-teal-200 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                    >
                      <Scale className="h-3.5 w-3.5" />
                      Consult
                    </Link>
                  </div>
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
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center rounded-[40px] border border-teal-500/50 bg-gradient-to-b from-teal-900/30 to-black/50 p-12 sm:p-16 text-center shadow-[0_0_80px_rgba(20,184,166,0.25)] backdrop-blur-xl ring-1 ring-teal-400/20"
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
            Register as a CLNS Advocate
          </a>
        </motion.div>
      </section>

      <Footerdemo />
    </main>
  );
}
