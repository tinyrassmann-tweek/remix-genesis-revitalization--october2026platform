import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile, Appointment, UserRole } from "../types";
import { motion } from "motion/react";
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  FileText, 
  GraduationCap, 
  ChevronRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Settings,
  Video
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Dashboard({ user, profile }: { user: User | null, profile: UserProfile | null }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      setAppointments(apps);
      setLoading(false);
    }, (error) => {
      console.error("Dashboard Error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  if (!user || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-emerald-900">Please log in to view your dashboard.</h2>
        <Link to="/login" className="mt-4 inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg">Login</Link>
      </div>
    );
  }

  const upcoming = appointments.filter(a => new Date(`${a.date} ${a.time}`) > new Date() && a.status !== "cancelled");
  const past = appointments.filter(a => new Date(`${a.date} ${a.time}`) <= new Date() || a.status === "cancelled");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Welcome, {profile.displayName}</h1>
          <p className="text-stone-500">Manage your health journey and appointments</p>
        </div>
        <Link 
          to="/booking" 
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10"
        >
          <Plus className="h-5 w-5" />
          Book Appointment
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
              <div className="text-stone-500 text-xs font-bold uppercase mb-2">Upcoming</div>
              <div className="text-3xl font-bold text-emerald-600">{upcoming.length}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
              <div className="text-stone-500 text-xs font-bold uppercase mb-2">Total Visits</div>
              <div className="text-3xl font-bold text-emerald-600">{appointments.length}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
              <div className="text-stone-500 text-xs font-bold uppercase mb-2">Forms Pending</div>
              <div className="text-3xl font-bold text-emerald-600">2</div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-emerald-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-emerald-900">Your Appointments</h2>
              <Link to="/booking" className="text-emerald-600 text-sm font-bold hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-emerald-50">
              {loading ? (
                <div className="p-12 text-center animate-pulse text-stone-400">Loading appointments...</div>
              ) : upcoming.length === 0 ? (
                <div className="p-12 text-center text-stone-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No upcoming appointments found.</p>
                </div>
              ) : (
                upcoming.map((app) => (
                  <div key={app.id} className="p-6 flex items-center justify-between hover:bg-emerald-50/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-emerald-900">{app.doctorName}</h3>
                        <p className="text-sm text-stone-500">{app.department}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-stone-400">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {app.date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {app.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        app.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                        app.status === "pending" ? "bg-amber-100 text-amber-700" :
                        "bg-stone-100 text-stone-700"
                      )}>
                        {app.status.toUpperCase()}
                      </span>
                      <ChevronRight className="h-5 w-5 text-stone-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-emerald-800 w-16 h-16 rounded-2xl flex items-center justify-center border border-emerald-700">
                <UserIcon className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{profile.displayName}</h3>
                <p className="text-emerald-300 text-xs uppercase tracking-widest">{profile.role}</p>
              </div>
            </div>
            <div className="space-y-4 text-sm opacity-80">
              <div className="flex justify-between">
                <span>Patient ID:</span>
                <span className="font-mono">{profile.uid.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Member Since:</span>
                <span>{new Date(profile.createdAt).getFullYear()}</span>
              </div>
            </div>
            <Link to="/forms" className="mt-8 w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
              <Settings className="h-4 w-4" />
              Edit Profile
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm">
            <h3 className="font-bold text-emerald-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link to="/forms" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-all group">
                <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-all">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">Fill Intake Forms</span>
              </Link>
              <Link to="/education" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-all group">
                <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-all">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">My Courses</span>
              </Link>
              <Link to="/virtual-tour" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-all group">
                <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-all">
                  <Video className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">Virtual Tour</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
