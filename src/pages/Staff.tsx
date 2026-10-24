import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile, UserRole } from "../types";
import { motion } from "motion/react";
import { 
  Users, 
  Stethoscope, 
  Award, 
  Mail, 
  Phone, 
  Search, 
  ChevronRight,
  User as UserIcon,
  ShieldCheck
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Staff() {
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "executive" | "doctor" | "dsp">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStaff = async () => {
      const q = query(collection(db, "users"), where("role", "!=", UserRole.PATIENT));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => d.data() as UserProfile);
      setStaff(docs);
      setLoading(false);
    };
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === "all") return matchesSearch;
    if (filter === "executive") return matchesSearch && s.role === UserRole.ADMIN;
    if (filter === "doctor") return matchesSearch && s.role === UserRole.DOCTOR;
    if (filter === "dsp") return matchesSearch && s.role === UserRole.STAFF;
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-emerald-900 mb-4">Our Dedicated Personnel</h1>
        <p className="text-stone-600 max-w-2xl mx-auto">
          Meet the executive leadership, activity coordinators, and direct support professionals (DSPs) who make Genesis Revitalization Group a center of excellence.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12">
        <div className="flex bg-white p-1 rounded-2xl border border-emerald-50 shadow-sm overflow-x-auto w-full md:w-auto">
          {[
            { id: "all", label: "All Staff" },
            { id: "executive", label: "Executive Team" },
            { id: "doctor", label: "Activity Coordinators" },
            { id: "dsp", label: "DSP Listing" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                filter === tab.id ? "bg-emerald-600 text-white shadow-md" : "text-stone-500 hover:text-emerald-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white h-80 rounded-3xl animate-pulse border border-stone-100"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredStaff.map((person, i) => (
            <motion.div
              key={person.uid}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl overflow-hidden border border-emerald-50 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="h-48 bg-stone-100 relative overflow-hidden">
                {person.photoURL ? (
                  <img src={person.photoURL} alt={person.displayName} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <UserIcon className="h-20 w-20" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm",
                    person.role === UserRole.ADMIN ? "bg-purple-600 text-white" :
                    person.role === UserRole.DOCTOR ? "bg-emerald-600 text-white" :
                    "bg-amber-500 text-white"
                  )}>
                    {person.role === UserRole.ADMIN ? "Executive" : person.role === UserRole.DOCTOR ? "Coordinator" : "DSP"}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-emerald-900 mb-1">{person.displayName}</h3>
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-4">
                  {person.specialty || (person.role === UserRole.ADMIN ? "Administration" : "Direct Support")}
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-stone-500 text-xs">
                    <Mail className="h-3 w-3" />
                    {person.email}
                  </div>
                  {person.phoneNumber && (
                    <div className="flex items-center gap-2 text-stone-500 text-xs">
                      <Phone className="h-3 w-3" />
                      {person.phoneNumber}
                    </div>
                  )}
                </div>
                <button className="w-full bg-stone-50 text-emerald-700 py-2 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                  View Profile <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
          {filteredStaff.length === 0 && (
            <div className="col-span-full py-20 text-center text-stone-400">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No staff members found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Affiliations & Partnerships */}
      <div className="mt-32">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-emerald-900">Our Affiliations & Partnerships</h2>
          <p className="text-stone-500 text-sm">Collaborating with leading institutions to provide superior care.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-2 font-bold text-stone-400">
              <ShieldCheck className="h-8 w-8" />
              <span className="text-xl">PARTNER {i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
