import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile, Appointment, UserRole, FormSubmission } from "../types";
import { motion } from "motion/react";
import { 
  Users, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Search, 
  Filter, 
  Printer, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  ArrowUpRight,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { AnimatePresence } from "motion/react";

export default function Admin({ user, profile }: { user: User | null, profile: UserProfile | null }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "users" | "forms">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);

  useEffect(() => {
    if (!user || profile?.role !== UserRole.ADMIN) return;

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => d.data() as UserProfile));
    });

    const unsubApps = onSnapshot(query(collection(db, "appointments"), orderBy("createdAt", "desc")), (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    });

    const unsubForms = onSnapshot(query(collection(db, "formSubmissions"), orderBy("submittedAt", "desc")), (snap) => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as FormSubmission)));
    });

    setLoading(false);
    return () => {
      unsubUsers();
      unsubApps();
      unsubForms();
    };
  }, [user, profile]);

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "appointments", id), { status });
  };

  const handleBulkUpdateStatus = async (status: Appointment["status"]) => {
    if (selectedAppointments.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      selectedAppointments.forEach((id) => {
        const appRef = doc(db, "appointments", id);
        batch.update(appRef, { status });
      });
      await batch.commit();
      setSelectedAppointments([]);
    } catch (error) {
      console.error("Error updating appointments:", error);
      alert("Failed to update appointments. Please try again.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedAppointments.length === filteredAppointments.length) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(filteredAppointments.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedAppointments(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string, coll: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      await deleteDoc(doc(db, coll, id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user || profile?.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShieldCheck className="h-20 w-20 text-red-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-emerald-900">Access Denied</h2>
        <p className="text-stone-500">You do not have administrative privileges to view this page.</p>
      </div>
    );
  }

  const filteredAppointments = appointments.filter(a => 
    a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsData = [
    { name: "Confirmed", value: appointments.filter(a => a.status === "confirmed").length },
    { name: "Pending", value: appointments.filter(a => a.status === "pending").length },
    { name: "Cancelled", value: appointments.filter(a => a.status === "cancelled").length },
    { name: "Completed", value: appointments.filter(a => a.status === "completed").length },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Admin Command Center</h1>
          <p className="text-stone-500">Manage patients, staff, and hospital operations</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="bg-white border border-stone-200 text-stone-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-stone-50 transition-all shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print Audit Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-8 overflow-x-auto print:hidden">
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "appointments", label: "Appointments", icon: Calendar },
          { id: "users", label: "Users & Staff", icon: Users },
          { id: "forms", label: "Form Submissions", icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
              activeTab === tab.id ? "border-emerald-600 text-emerald-600" : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
                <div className="text-stone-500 text-xs font-bold uppercase mb-2">Total Patients</div>
                <div className="text-3xl font-bold text-emerald-600">{users.filter(u => u.role === UserRole.PATIENT).length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
                <div className="text-stone-500 text-xs font-bold uppercase mb-2">Active Staff</div>
                <div className="text-3xl font-bold text-emerald-600">{users.filter(u => u.role !== UserRole.PATIENT).length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
                <div className="text-stone-500 text-xs font-bold uppercase mb-2">Appointments</div>
                <div className="text-3xl font-bold text-emerald-600">{appointments.length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
                <div className="text-stone-500 text-xs font-bold uppercase mb-2">Forms Received</div>
                <div className="text-3xl font-bold text-emerald-600">{submissions.length}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm h-[400px]">
                <h3 className="font-bold text-emerald-900 mb-6">Appointment Status Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statsData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm h-[400px]">
                <h3 className="font-bold text-emerald-900 mb-6">Recent Activity</h3>
                <div className="space-y-4 overflow-y-auto h-[300px] pr-2">
                  {appointments.slice(0, 10).map((app, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>{app.patientName} booked with {app.doctorName}</span>
                      </div>
                      <span className="text-xs text-stone-400">{format(new Date(app.createdAt), "MMM d, HH:mm")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "appointments" && (
          <motion.div 
            key="appointments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center print:hidden">
              <div className="flex flex-1 gap-4 items-center w-full">
                <div className="relative flex-1 md:max-w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="Search patients, doctors, or departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                
                {selectedAppointments.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100"
                  >
                    <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">
                      {selectedAppointments.length} selected
                    </span>
                    <div className="h-4 w-[1px] bg-emerald-200 mx-1" />
                    <select 
                      onChange={(e) => handleBulkUpdateStatus(e.target.value as any)}
                      className="text-xs font-bold bg-white border border-emerald-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
                      defaultValue=""
                    >
                      <option value="" disabled>Update Status...</option>
                      <option value="pending">PENDING</option>
                      <option value="confirmed">CONFIRMED</option>
                      <option value="completed">COMPLETED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                    <button 
                      onClick={() => setSelectedAppointments([])}
                      className="text-stone-400 hover:text-stone-600 p-1"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50"><Filter className="h-5 w-5 text-stone-500" /></button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-10">
                      <input 
                        type="checkbox" 
                        checked={filteredAppointments.length > 0 && selectedAppointments.length === filteredAppointments.length}
                        onChange={toggleSelectAll}
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {filteredAppointments.map((app) => (
                    <tr 
                      key={app.id} 
                      className={cn(
                        "hover:bg-emerald-50/20 transition-colors",
                        selectedAppointments.includes(app.id) && "bg-emerald-50/40"
                      )}
                    >
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedAppointments.includes(app.id)}
                          onChange={() => toggleSelect(app.id)}
                          className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-900">{app.patientName}</td>
                      <td className="px-6 py-4 text-stone-600">{app.doctorName}</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-semibold">
                          {app.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">
                        <div>{app.date}</div>
                        <div className="text-xs">{app.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full border-none focus:ring-0 cursor-pointer print:appearance-none",
                            app.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                            app.status === "pending" ? "bg-amber-100 text-amber-700" :
                            app.status === "cancelled" ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          )}
                        >
                          <option value="pending">PENDING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right print:hidden">
                        <button 
                          onClick={() => handleDelete(app.id, "appointments")}
                          className="text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
