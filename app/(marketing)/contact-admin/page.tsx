import Link from "next/link";
import { Mail, Phone, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Contact Admin | CLNS",
  description: "Contact admin for Startups and MSME services",
};

export default function ContactAdminPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/#services"
          className="inline-flex items-center text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Contact Administration
          </h1>
          <p className="mx-auto mb-12 max-w-xl text-lg text-white/70">
            For Startups and MSME services, please contact our administrative team directly. We will provide tailored assistance for your specific business needs.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col items-center rounded-2xl bg-white/5 p-8 text-center border border-white/10 transition-colors hover:bg-white/10">
            <div className="mb-4 rounded-full bg-teal-500/20 p-4">
              <Mail className="h-8 w-8 text-teal-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Email Us</h3>
            <p className="text-white/70">
              <a href="mailto:office@clns.in" className="hover:text-teal-400 transition-colors">
                office@clns.in
              </a>
            </p>
          </div>

          <div className="flex flex-col items-center rounded-2xl bg-white/5 p-8 text-center border border-white/10 transition-colors hover:bg-white/10">
            <div className="mb-4 rounded-full bg-teal-500/20 p-4">
              <Phone className="h-8 w-8 text-teal-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Call Us</h3>
            <p className="text-white/70">
              <a href="tel:+918465958825" className="hover:text-teal-400 transition-colors">
                8465958825
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
