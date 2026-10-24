import React from "react";
import { motion } from "motion/react";
import { 
  Monitor, 
  Palette, 
  Briefcase, 
  Dumbbell, 
  Music, 
  Utensils, 
  Sparkles,
  Home,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

const DEPARTMENTS = [
  {
    id: "computer-science",
    name: "Computer Science Lab",
    description: "Room 1: Dedicated to digital literacy, coding basics, and assistive technology training.",
    icon: Monitor,
    color: "bg-blue-50 text-blue-600",
    features: ["Coding Basics", "Digital Literacy", "Assistive Tech"]
  },
  {
    id: "visual-arts",
    name: "Visual Arts Studio",
    description: "Room 2: A creative space for painting, sculpture, and multi-sensory artistic expression.",
    icon: Palette,
    color: "bg-purple-50 text-purple-600",
    features: ["Painting & Drawing", "Sculpture", "Therapeutic Art"]
  },
  {
    id: "workplace-readiness",
    name: "Workplace Readiness Center",
    description: "Room 3: Focused on vocational training, interview prep, and professional skill development.",
    icon: Briefcase,
    color: "bg-emerald-50 text-emerald-600",
    features: ["Vocational Training", "Resume Building", "Professional Etiquette"]
  },
  {
    id: "physical-training",
    name: "Physical Training Gym",
    description: "Room 4: Specialized equipment for adaptive fitness, mobility training, and physical therapy.",
    icon: Dumbbell,
    color: "bg-amber-50 text-amber-600",
    features: ["Adaptive Fitness", "Mobility Training", "Strength Building"]
  },
  {
    id: "music-performance",
    name: "Music & Performance Hall",
    description: "Room 5: A stage for musical exploration, dance therapy, and public speaking practice.",
    icon: Music,
    color: "bg-red-50 text-red-600",
    features: ["Instrumental Training", "Dance Therapy", "Performance Skills"]
  },
  {
    id: "culinary-arts",
    name: "Culinary Arts Kitchen",
    description: "Room 6: A fully accessible kitchen for learning nutrition, meal prep, and kitchen safety.",
    icon: Utensils,
    color: "bg-orange-50 text-orange-600",
    features: ["Nutrition Education", "Meal Preparation", "Kitchen Safety"]
  },
  {
    id: "sensory-integration",
    name: "Sensory Integration Room",
    description: "Room 7: A controlled environment designed to help clients manage sensory processing needs.",
    icon: Sparkles,
    color: "bg-cyan-50 text-cyan-600",
    features: ["Calming Environment", "Sensory Stimulation", "Self-Regulation"]
  },
  {
    id: "life-skills",
    name: "Life Skills Lab",
    description: "Room 8: Simulating home environments to teach independent living and daily management.",
    icon: Home,
    color: "bg-indigo-50 text-indigo-600",
    features: ["Independent Living", "Money Management", "Personal Care"]
  }
];

export default function Departments() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-emerald-900 mb-4">Our Activity Rooms</h1>
        <p className="text-stone-600 max-w-2xl mx-auto">
          Genesis Revitalization Group features 8 dedicated activity rooms, each designed to foster specific skills and personal growth for our clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DEPARTMENTS.map((dept, i) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl p-8 border border-emerald-50 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", dept.color)}>
              <dept.icon className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">{dept.name}</h2>
            <p className="text-stone-600 mb-6 text-sm leading-relaxed">
              {dept.description}
            </p>
            <ul className="space-y-3 mb-8">
              {dept.features.map((feature, j) => (
                <li key={j} className="flex items-center gap-2 text-stone-700 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  {feature}
                </li>
              ))}
            </ul>
            <Link 
              to="/booking" 
              className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm hover:gap-3 transition-all"
            >
              Book a session in this room <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 bg-emerald-900 rounded-3xl p-8 md:p-16 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">Not sure which room is right?</h2>
        <p className="text-emerald-100/80 mb-8 max-w-2xl mx-auto">
          Our activity coordinators can help match your interests and goals with the perfect room. Take a virtual tour or contact us for a consultation.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/forms" className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold transition-all">
            Start Intake Process
          </Link>
          <button className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-8 py-4 rounded-xl font-bold transition-all border border-white/20">
            Contact Main Line
          </button>
        </div>
      </div>
    </div>
  );
}
