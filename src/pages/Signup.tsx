import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserRole, UserProfile } from "../types";
import { motion } from "motion/react";
import { UserPlus, Mail, Lock, User, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName });
      
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName,
        role,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, "users", user.uid), profile);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-50 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-900">Create Account</h1>
          <p className="text-stone-500 text-sm">Join the NJ D&D Medical community</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700">I am a...</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole(UserRole.PATIENT)}
                className={cn(
                  "py-2 rounded-xl text-sm font-bold border transition-all",
                  role === UserRole.PATIENT ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                )}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.STAFF)}
                className={cn(
                  "py-2 rounded-xl text-sm font-bold border transition-all",
                  role === UserRole.STAFF ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                )}
              >
                Staff
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-stone-500">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
