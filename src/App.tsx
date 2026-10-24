import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile, UserRole } from "./types";
import { cn } from "./lib/utils";
import { 
  LayoutGrid, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  GraduationCap, 
  ShieldAlert, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  MessageSquare,
  Building2,
  HeartPulse,
  PhoneCall,
  Settings,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Booking from "./pages/Booking";
import Departments from "./pages/Departments";
import Emergency from "./pages/Emergency";
import Staff from "./pages/Staff";
import Forms from "./pages/Forms";
import Education from "./pages/Education";
import LeadCapture from "./pages/LeadCapture";
import VirtualTour from "./pages/VirtualTour";

const Navbar = ({ user, profile }: { user: User | null, profile: UserProfile | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/", icon: Building2 },
    { name: "Activity Rooms", path: "/departments", icon: LayoutGrid },
    { name: "Emergency", path: "/emergency", icon: ShieldAlert },
    { name: "Staff", path: "/staff", icon: Users },
  ];

  if (user) {
    navLinks.push({ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard });
    if (profile?.role === UserRole.ADMIN) {
      navLinks.push({ name: "Admin", path: "/admin", icon: ShieldCheck });
    }
  }

  return (
    <nav className="bg-emerald-800 text-stone-50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <HeartPulse className="h-8 w-8 text-emerald-400" />
              <span className="font-bold text-xl tracking-tight">Genesis Revitalization</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                    location.pathname === link.path 
                      ? "bg-emerald-900 text-white" 
                      : "hover:bg-emerald-700 text-emerald-100"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 text-emerald-100 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-emerald-900"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-emerald-100 hover:text-white hover:bg-emerald-700 flex items-center gap-2"
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-emerald-100 hover:text-white hover:bg-emerald-700 flex items-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-emerald-500 hover:bg-emerald-400 flex items-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai", text: string }[]>([
    { role: "ai", text: "Hello! I'm your Genesis Revitalization assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const { generateMedicalResponse } = await import("./lib/gemini");
      const aiResponse = await generateMedicalResponse(userMsg);
      setMessages(prev => [...prev, { role: "ai", text: aiResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col mb-4 overflow-hidden border border-emerald-100"
          >
            <div className="bg-emerald-700 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span className="font-semibold">AI Medical Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-emerald-600 p-1 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-sm",
                  msg.role === "user" 
                    ? "bg-emerald-600 text-white ml-auto rounded-tr-none" 
                    : "bg-white text-stone-800 border border-emerald-100 rounded-tl-none"
                )}>
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="bg-white text-stone-800 border border-emerald-100 rounded-2xl rounded-tl-none p-3 text-sm max-w-[80%] animate-pulse">
                  Thinking...
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-white flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 disabled:opacity-50"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-emerald-600 text-white p-4 rounded-full shadow-xl hover:bg-emerald-700 transition-transform hover:scale-110"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Create default profile if not exists
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "User",
            role: UserRole.PATIENT,
            createdAt: new Date().toISOString(),
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
        <Navbar user={user} profile={profile} />
        <main className="pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/dashboard" element={<Dashboard user={user} profile={profile} />} />
            <Route path="/admin" element={<Admin user={user} profile={profile} />} />
            <Route path="/booking" element={<Booking user={user} profile={profile} />} />
            <Route path="/forms" element={<Forms user={user} profile={profile} />} />
            <Route path="/education" element={<Education user={user} profile={profile} />} />
            <Route path="/lead-capture" element={<LeadCapture />} />
            <Route path="/virtual-tour" element={<VirtualTour />} />
          </Routes>
        </main>
        <ChatBot />
        
        <footer className="bg-emerald-900 text-emerald-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <HeartPulse className="h-6 w-6 text-emerald-400" />
                <span className="font-bold text-lg">Genesis Revitalization</span>
              </div>
              <p className="text-sm opacity-80">
                Providing compassionate care and specialized activity programs for developmental disabilities in New Jersey.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/departments" className="hover:text-white">Activity Rooms</Link></li>
                <li><Link to="/emergency" className="hover:text-white">Emergency Services</Link></li>
                <li><Link to="/staff" className="hover:text-white">Our Staff</Link></li>
                <li><Link to="/education" className="hover:text-white">Continuing Education</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Patient Portal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/dashboard" className="hover:text-white">My Dashboard</Link></li>
                <li><Link to="/booking" className="hover:text-white">Book Appointment</Link></li>
                <li><Link to="/forms" className="hover:text-white">Intake Forms</Link></li>
                <li><Link to="/virtual-tour" className="hover:text-white">Virtual Tour</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><PhoneCall className="h-4 w-4" /> (555) 123-4567</li>
                <li className="flex items-center gap-2"><Building2 className="h-4 w-4" /> 123 Medical Plaza, NJ</li>
                <li className="flex items-center gap-2 text-emerald-400 font-bold"><ShieldAlert className="h-4 w-4" /> Emergency: 911</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-emerald-800 text-center text-xs opacity-60">
            © 2026 Genesis Revitalization Group. HIPAA Compliant. All Rights Reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}
