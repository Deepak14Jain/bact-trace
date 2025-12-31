import React from 'react';
import { Activity, ShieldCheck, Cpu, Globe, ArrowRight, CheckCircle, BarChart3, Mic, Thermometer, MapPin } from 'lucide-react';

export default function LandingPage({ onEnterApp, onEnterGov }: { onEnterApp: () => void, onEnterGov: () => void }) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Activity className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Bact-Trace</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* GOV BUTTON */}
            <button 
              onClick={onEnterGov}
              className="hidden md:flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition px-4 py-2 rounded-lg hover:bg-slate-50"
            >
              <Globe size={18} /> National Surveillance
            </button>

            {/* DOCTOR BUTTON */}
            <button 
              onClick={onEnterApp}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
            >
              Launch Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-60"></div>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wide mb-8">
            <ShieldCheck size={14} /> Official Imagine Cup Entry
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8">
            Stop the Superbugs.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Before they start.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bact-Trace is the world's first <strong>Multimodal AI Surveillance System</strong> designed to distinguish viral vs. bacterial infections in rural populations—preventing antibiotic misuse at the source.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={onEnterApp} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-200">
              Deploy Solution <ArrowRight size={20} />
            </button>
            <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-50 transition">
              Watch the Demo
            </button>
          </div>
        </div>
      </header>

      {/* 3. THE PROBLEM (Why we built this) */}
      <section id="problem" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">The "Silent Pandemic"</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Antimicrobial Resistance (AMR) is driven by unnecessary prescriptions. Without data, doctors in rural areas are flying blind.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StatCard 
              number="10 Million" 
              label="Annual deaths by 2050 due to AMR if unchecked."
              color="text-red-600"
            />
            <StatCard 
              number="50%+" 
              label="Of antibiotics prescribed in rural clinics are unnecessary (Viral cases)."
              color="text-orange-600"
            />
            <StatCard 
              number="$100 Trillion" 
              label="Projected cost to the global economy by 2050."
              color="text-slate-900"
            />
          </div>
        </div>
      </section>

      {/* 4. THE SOLUTION (Robust AI) */}
      <section id="solution" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Not just an app.<br/>A Medical Decision Engine.</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                We don't guess. We combine <strong>Audio Spectrograms</strong>, <strong>Visual Imaging</strong>, and <strong>Clinical Vitals</strong> (Temperature, Duration) to give field workers a lab-grade triage tool.
              </p>
              
              <div className="space-y-6">
                <FeatureRow 
                  icon={<Mic className="text-purple-600" />} 
                  title="Acoustic Biomarkers" 
                  desc="Detects specific lung sounds (crackles vs. wheezes) using Azure OpenAI." 
                />
                <FeatureRow 
                  icon={<Thermometer className="text-red-600" />} 
                  title="Clinical Context Fusion" 
                  desc="Combines fever trends and symptom duration to rule out viral flu." 
                />
                <FeatureRow 
                  icon={<MapPin className="text-green-600" />} 
                  title="Geospatial Outbreak Tracking" 
                  desc="Live heatmaps alert governments to hotspots instantly." 
                />
              </div>
            </div>
            
            {/* Visual Representation of the "Robust AI" */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl rotate-3 opacity-20 blur-xl"></div>
              <div className="relative bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-2xl">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-400 text-sm font-mono ml-auto">ai_core_v2.py</span>
                </div>
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex gap-4">
                    <span className="text-blue-400">INPUT &gt;</span>
                    <span className="text-slate-300">Audio: <span className="text-yellow-400">Cough_Wet.wav</span></span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-blue-400">INPUT &gt;</span>
                    <span className="text-slate-300">Temp: <span className="text-red-400">102.5°F</span> (High)</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-blue-400">INPUT &gt;</span>
                    <span className="text-slate-300">Phlegm: <span className="text-green-400">Yes (Green)</span></span>
                  </div>
                  <div className="h-px bg-slate-800 my-4"></div>
                  <div className="flex gap-4">
                    <span className="text-purple-400">AI_REASONING &gt;</span>
                    <span className="text-slate-400">"High fever + Wet Cough matches Bacterial Pneumonia profile."</span>
                  </div>
                  <div className="p-4 bg-green-900/20 border border-green-900/50 rounded mt-4">
                    <span className="text-green-400 font-bold">RECOMMENDATION: ANTIBIOTICS APPROVED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="text-slate-400" size={20} />
            <span className="font-bold text-slate-700">Bact-Trace Project</span>
          </div>
          <p className="text-slate-500 text-sm">
            Built for <strong>Microsoft Imagine Cup 2025</strong>. Powered by Azure AI.
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ number, label, color }: { number: string, label: string, color: string }) {
  return (
    <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition">
      <div className={`text-5xl font-extrabold mb-4 ${color}`}>{number}</div>
      <p className="text-slate-600 font-medium leading-relaxed">{label}</p>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
        <p className="text-slate-600">{desc}</p>
      </div>
    </div>
  );
}