import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, AlertTriangle, Map as MapIcon, TrendingUp, Users } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// ⚠️ Ensure this matches your Java Backend URL
const API_URL = "http://localhost:8080/api/cases/analytics";

// --- TYPES ---
interface PatientCase {
  id: number;
  patientName: string;
  villageName: string;
  latitude: number | null;
  longitude: number | null;
  coughDiagnosis: string;     // e.g. "Bacterial", "Viral"
  breathingDifficulty: string; // "Yes" or "No"
  temperature: string;
  hasPhlegm: string;
  createdAt: string;
}

interface Stats {
  total: number;
  bacterial: number;
  viral: number;
  critical: number;
}

// --- COMPONENT ---
export default function GovernmentDashboard() {
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, bacterial: 0, viral: 0, critical: 0 });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Live refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get<PatientCase[]>(API_URL);
      const data = res.data;
      setCases(data);

      // Calculate Stats
      const bacterial = data.filter(c => c.coughDiagnosis?.includes("Bacterial")).length;
      const viral = data.filter(c => c.coughDiagnosis?.includes("Viral")).length;
      const critical = data.filter(c => c.breathingDifficulty === "Yes").length;

      setStats({
        total: data.length,
        bacterial,
        viral,
        critical
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  // Chart Data Preparation
  const chartData = [
    { name: 'Viral (Safe)', value: stats.viral, color: '#3B82F6' },
    { name: 'Bacterial (Meds)', value: stats.bacterial, color: '#EF4444' },
    { name: 'Critical (ICU)', value: stats.critical, color: '#7F1D1D' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-900">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="text-blue-600" size={32} />
            National AMR Surveillance
          </h1>
          <p className="text-slate-500 mt-1">Real-time antibiotic usage and outbreak tracking</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-slate-700">Live System</span>
        </div>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users className="text-blue-600" />} label="Total Screenings" value={stats.total} />
        <StatCard icon={<AlertTriangle className="text-red-600" />} label="Bacterial Detected" value={stats.bacterial} color="text-red-600" />
        <StatCard icon={<Activity className="text-green-600" />} label="Viral (No Meds)" value={stats.viral} color="text-green-600" />
        <StatCard icon={<AlertTriangle className="text-purple-600" />} label="Critical / ICU" value={stats.critical} color="text-purple-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: OUTBREAK MAP */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <MapIcon className="text-slate-500" /> Live Outbreak Map
          </h3>
          <div className="flex-1 min-h-[500px] rounded-xl overflow-hidden border border-slate-100 relative z-0">
             {/* Default Center: India */}
             <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                
                {cases.map((c, idx) => (
                  c.latitude && c.longitude && (
                    <CircleMarker 
                      key={idx} 
                      center={[c.latitude, c.longitude]} 
                      radius={8}
                      pathOptions={{ 
                        color: c.coughDiagnosis?.includes("Bacterial") ? '#EF4444' : '#3B82F6',
                        fillColor: c.coughDiagnosis?.includes("Bacterial") ? '#EF4444' : '#3B82F6',
                        fillOpacity: 0.7 
                      }}
                    >
                      <Popup>
                        <div className="p-1">
                            <strong className="block text-base mb-1">{c.villageName}</strong>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${c.coughDiagnosis?.includes("Bacterial") ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {c.coughDiagnosis}
                            </span>
                            <div className="mt-2 text-sm text-slate-600 space-y-1">
                                <p>🌡️ Temp: {c.temperature}°F</p>
                                <p>🦠 Phlegm: {c.hasPhlegm}</p>
                                {c.breathingDifficulty === "Yes" && <p className="text-red-600 font-bold">⚠️ Breathing Difficulty</p>}
                            </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  )
                ))}
             </MapContainer>
          </div>
        </div>

        {/* RIGHT: ANALYTICS & ALERTS */}
        <div className="space-y-8 flex flex-col">
            
            {/* Charts */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="text-slate-500" /> Infection Trends
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" fontSize={12} tick={{fill: '#64748B'}} />
                            <YAxis fontSize={12} tick={{fill: '#64748B'}} />
                            <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Alerts Feed */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
                <h3 className="font-bold text-lg mb-4 text-red-700 flex items-center gap-2">
                    <AlertTriangle size={20} /> High Risk Alerts
                </h3>
                <div className="space-y-3 overflow-y-auto pr-2">
                    {cases
                        .filter(c => c.coughDiagnosis?.includes("Bacterial") || c.breathingDifficulty === "Yes")
                        .slice(0, 10) // Show last 10 alerts
                        .map((c, i) => (
                        <div key={i} className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-red-900 text-sm">{c.villageName}</span>
                                <span className="text-xs font-mono text-red-600 bg-white px-1 rounded">{c.temperature}°F</span>
                            </div>
                            <p className="text-sm text-red-700 mt-1 font-medium">{c.coughDiagnosis}</p>
                            <p className="text-xs text-red-500 mt-1">{c.patientName}</p>
                        </div>
                    ))}
                    {cases.length === 0 && <p className="text-slate-400 text-sm italic">Waiting for incoming data streams...</p>}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENT ---
function StatCard({ icon, label, value, color = "text-slate-900" }: { icon: React.ReactNode, label: string, value: number, color?: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
        </div>
    );
}