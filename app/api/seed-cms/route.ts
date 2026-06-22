import { NextResponse } from "next/server";
import { servicesCMS } from "@/lib/firebase-cms";
import { addAffiliation } from "@/lib/firebase-affiliations";

// Hardcoded affiliations from affiliation/page.tsx
const affiliations = [
  {
    name: "T-Hub",
    logoUrl: "/affiliations/thub-logo.png",
    description: "India's largest innovation ecosystem and one of the world's leading startup incubators. CLNS partners with T-Hub to connect legal-tech startups and advocates within a thriving innovation network.",
    websiteLink: "https://t-hub.co/",
    isFeatured: true,
  },
  {
    name: "WE Hub",
    logoUrl: "/affiliations/wehub-logo.png",
    description: "Telangana's premier state-led incubator dedicated to empowering women entrepreneurs. CLNS collaborates with WE Hub to support women-led legal startups through mentorship and systemic networks.",
    websiteLink: "https://wehub.telangana.gov.in/",
    isFeatured: true,
  },
  {
    name: "United Nations",
    logoUrl: "/affiliations/un-logo.jpeg",
    description: "Affiliation for NGOs, international organizations, and global legal-tech startups. Access joint initiatives on sustainable development aligned with UN standards.",
    websiteLink: "https://www.un.org/",
    isFeatured: false,
  },
  {
    name: "UIA – Union of International Associations",
    logoUrl: "/affiliations/uia-logo.jpg",
    description: "Affiliation for international associations and cross-border legal networks. Benefit from referral networks, collaborative research, and shared best practices.",
    websiteLink: "https://uia.org/",
    isFeatured: false,
  },
  {
    name: "FICL – Federation of Indian Corporate Lawyers",
    logoUrl: "/affiliations/ficl-logo.jpeg",
    description: "Affiliation for law firms and corporate legal departments across India. Access referral networks, joint training programs, and co-branded corporate legal initiatives.",
    websiteLink: "https://ficl.org.in/",
    isFeatured: false,
  },
  {
    name: "Woxsen University",
    logoUrl: "/partners/woxen-university.jpeg",
    description: "Affiliation bridging legal education with practice. Internship pipelines, joint research projects, and co-branded legal tech programs for students and institutions.",
    websiteLink: "https://woxsen.edu.in/",
    isFeatured: false,
  },
  {
    name: "National Law University",
    logoUrl: "/partners/law-universities.png",
    description: "Affiliation committed to legal education excellence. Internship pipelines, legal technology initiatives, and referral networks preparing the next generation.",
    websiteLink: "#",
    isFeatured: false,
  },
];

// Hardcoded services from services/page.tsx
const clientServices = [
  { iconName: "Coins", title: "Transparent pricing & accessibility", description: "Clear, upfront pricing with no hidden costs", category: "Clients" },
  { iconName: "MessageCircle", title: "The ₹1 One-Rupee Consultation initiative", description: "Affordable legal guidance starting at just ₹1", category: "Clients" },
  { iconName: "UserCheck", title: "Verified advocates & deep legal network", description: "Connect with trusted, verified legal professionals", category: "Clients" },
  { iconName: "TrendingUp", title: "Real-time case tracking via personal dashboard", description: "Monitor your case progress in real-time", category: "Clients" },
  { iconName: "MessageSquare", title: "Real-time Legal AI Chatbox", description: "Instant answers to your legal questions", category: "Clients" },
  { iconName: "Smartphone", title: "Mobile-first legal access", description: "Access all services from your mobile device", category: "Clients" },
  { iconName: "Briefcase", title: "One-stop legal workflow for all categories", description: "Complete legal solutions in one platform", category: "Clients" },
  { iconName: "Clock", title: "24/7 Emergency Legal Support", description: "Round-the-clock assistance for urgent legal matters", category: "Clients" },
];

const studentServices = [
  { iconName: "Briefcase", title: "Internship tracking", description: "Track and manage your internship applications", category: "Students" },
  { iconName: "CheckCircle", title: "Real case exposure", description: "Gain hands-on experience with real legal cases", category: "Students" },
  { iconName: "UserCheck", title: "Mentorship from experienced advocates", description: "Learn from industry experts and senior lawyers", category: "Students" },
  { iconName: "Laptop", title: "Learning dashboard", description: "Centralized hub for all your learning resources", category: "Students" },
  { iconName: "Users", title: "Community access & events", description: "Connect with peers and attend exclusive events", category: "Students" },
  { iconName: "MessageCircle", title: "Interactive legal workshops", description: "Participate in hands-on legal skill workshops", category: "Students" },
  { iconName: "Search", title: "Access to exclusive internships", description: "Discover verified internship opportunities", category: "Students" },
  { iconName: "BookOpen", title: "Free legal resources (ebooks, case studies, docs)", description: "Access comprehensive legal learning materials", category: "Students" },
  { iconName: "Zap", title: "Immediate advocate experience from Day 1 of LLB", description: "Start building your legal career from day one", category: "Students" },
];

const advocateServices = [
  { iconName: "TrendingUp", title: "Lead generation", description: "Connect with potential clients automatically", category: "Advocates" },
  { iconName: "Laptop", title: "Digital case management", description: "Manage all your cases from one dashboard", category: "Advocates" },
  { iconName: "FileText", title: "Paperless workflow", description: "Go completely digital with document management", category: "Advocates" },
  { iconName: "MessageCircle", title: "Client communication tools", description: "Seamless communication with clients", category: "Advocates" },
  { iconName: "Briefcase", title: "Centralized dashboard", description: "All your practice tools in one place", category: "Advocates" },
  { iconName: "Zap", title: "Practice automation tools", description: "Automate repetitive tasks and boost productivity", category: "Advocates" },
  { iconName: "Users", title: "Talent & intern hiring access", description: "Find and hire talented students and interns", category: "Advocates" },
  { iconName: "Network", title: "Digital marketplace visibility", description: "Increase your visibility in the legal marketplace", category: "Advocates" },
  { iconName: "Smartphone", title: "Mobile-first workflow", description: "Manage your practice on the go", category: "Advocates" },
];

const startupServices = [
  { iconName: "Rocket", title: "Fast company registration", description: "Quick registration support for startups and new businesses", category: "Startups" },
  { iconName: "FileText", title: "Compliance documentation", description: "Streamlined compliance processes and documentation support", category: "Startups" },
  { iconName: "Shield", title: "Government benefits access", description: "Navigate and access government schemes and startup benefits", category: "Startups" },
  { iconName: "Coins", title: "Startup-friendly pricing", description: "Affordable legal packages designed for early-stage founders", category: "Startups" },
  { iconName: "Briefcase", title: "Early-stage legal guidance", description: "Expert advice tailored for startup founders and entrepreneurs", category: "Startups" },
  { iconName: "CheckCircle", title: "Registration support", description: "Complete assistance with business registration and setup", category: "Startups" },
  { iconName: "TrendingUp", title: "Growth compliance support", description: "Ongoing compliance support as your startup grows", category: "Startups" },
  { iconName: "MessageCircle", title: "Startup advisory services", description: "Dedicated advisory for startup legal and business needs", category: "Startups" },
];

const msmeServices = [
  { iconName: "Building2", title: "MSME registration", description: "Quick MSME registration with complete documentation support", category: "MSME" },
  { iconName: "FileText", title: "Compliance assistance", description: "Ongoing compliance support and certificate handling", category: "MSME" },
  { iconName: "CheckCircle", title: "Certificate handling", description: "Complete certificate procurement and management", category: "MSME" },
  { iconName: "Coins", title: "Subsidies & credit support", description: "Advisory services to leverage government subsidies and credit", category: "MSME" },
  { iconName: "Briefcase", title: "Ongoing advisory services", description: "Continuous support for MSME business legal needs", category: "MSME" },
  { iconName: "Shield", title: "Government scheme access", description: "Access to government schemes and benefits for MSMEs", category: "MSME" },
  { iconName: "TrendingUp", title: "Business growth support", description: "Legal support for MSME business expansion and growth", category: "MSME" },
  { iconName: "MessageCircle", title: "MSME consultation", description: "Expert consultation for MSME registration and compliance", category: "MSME" },
];

export async function GET() {
  try {
    let count = 0;
    
    // Seed Affiliations
    for (const aff of affiliations) {
      await addAffiliation(aff);
      count++;
    }

    // Seed Services
    const allServices = [...clientServices, ...studentServices, ...advocateServices, ...startupServices, ...msmeServices];
    for (const service of allServices) {
      await servicesCMS.add(service);
      count++;
    }

    return NextResponse.json({ success: true, message: `Seeded ${count} items successfully.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
