import React from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { Activity, ShieldCheck, Globe, ArrowRight, Mic, Thermometer, MapPin } from 'lucide-react';

export default function LandingPage({ onEnterApp, onEnterGov }: { onEnterApp: () => void, onEnterGov: () => void }) {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18next.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* 1. NAVBAR - Restored to original tight spacing */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Activity className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">{t('nav.title')}</span>
          </div>
          
          <div className="flex items-center gap-6">
            {/* LANGUAGE DROPDOWN - Clean, minimal design */}
            <div className="relative group">
               <select 
                 aria-label="Select language"
                 onChange={(e) => changeLanguage(e.target.value)}
                 value={i18n.language}
                 className="appearance-none bg-slate-100 text-slate-600 font-bold text-xs py-2 pl-3 pr-8 rounded-lg cursor-pointer hover:bg-slate-200 transition focus:outline-none border-none">
                 <option value="en">🇺🇸 English</option>
                 <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                 <option value="bn">🇮🇳 Bengali (বাংলা)</option>
                 <option value="te">🇮🇳 Telugu (తెలుగు)</option>
                 <option value="mr">🇮🇳 Marathi (मराठी)</option>
                 <option value="ta">🇮🇳 Tamil (தமிழ்)</option>
                 <option value="gu">🇮🇳 Gujarati (ગુજરાતી)</option>
                 <option value="kn">🇮🇳 Kannada (ಕನ್ನಡ)</option>
                 <option value="ml">🇮🇳 Malayalam (മലയാളം)</option>
                 <option value="pa">🇮🇳 Punjabi (ਪੰਜਾਬੀ)</option>
                 <option value="es">🇪🇸 Spanish (Español)</option>
                 <option value="fr">🇫🇷 French (Français)</option>
                 <option value="de">🇩🇪 German (Deutsch)</option>
                 <option value="zh-CN">🇨🇳 Chinese (简体中文)</option>
                 <option value="ar">🇦🇪 Arabic (العربية)</option>
                 <option value="pt">🇧🇷 Portuguese (Português)</option>
                 <option value="ru">🇷🇺 Russian (Русский)</option>
                 <option value="ja">🇯🇵 Japanese (日本語)</option>
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                 <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
               </div>
            </div>

            <button 
              onClick={onEnterGov}
              className="hidden md:flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition text-sm"
            >
              <Globe size={18} /> {t('nav.surveillance')}
            </button>

            <button 
              onClick={onEnterApp}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
            >
              {t('nav.launch')}
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION - Restored Original Spacing & Proportions */}
      <header className="relative pt-20 pb-32 overflow-hidden">
        {/* Original Background Blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-60"></div>
        
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wide mb-8">
            <ShieldCheck size={14} /> {t('hero.badge')}
          </div>
          
          {/* Dynamic Scaling for Indian Scripts to avoid distortion */}
          <h1 className={`font-extrabold text-slate-900 leading-tight mb-8 tracking-tight break-words pb-4
            ${i18n.language === 'en' ? 'text-5xl md:text-7xl' : 'text-4xl md:text-6xl'}`}>
            {t('hero.title')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 py-2">
                {t('hero.subtitle')}
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('hero.desc')}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={onEnterApp} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-200">
              {t('hero.btn_deploy')} <ArrowRight size={20} />
            </button>
            <button onClick={onEnterGov} className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-50 transition shadow-sm">
              <MapPin size={20} className="text-red-500" /> {t('hero.btn_map')}
            </button>
          </div>
        </div>
      </header>

      {/* 3. THE PROBLEM SECTION */}
      <section id="problem" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('solution.title')}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">{t('solution.desc')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StatCard number="10 Million" label={t('stats.deaths')} color="text-red-600" />
            <StatCard number="50%+" label={t('stats.unnecessary')} color="text-orange-600" />
            <StatCard number="$100T" label={t('stats.cost')} color="text-slate-900" />
          </div>
        </div>
      </section>

      {/* 4. THE SOLUTION (ROBUST AI) */}
      <section id="solution" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">{t('solution.subtitle')}</h2>
              <div className="space-y-6">
                <FeatureRow icon={<Mic className="text-purple-600" />} title={t('solution.feature1')} desc={t('solution.feature1_desc')} />
                <FeatureRow icon={<Thermometer className="text-red-600" />} title={t('solution.feature2')} desc={t('solution.feature2_desc')} />
                <FeatureRow icon={<MapPin className="text-green-600" />} title={t('solution.feature3')} desc={t('solution.feature3_desc')} />
              </div>
            </div>
            
            {/* Visual AI Logic Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl rotate-3 opacity-20 blur-xl"></div>
              <div className="relative bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-2xl">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-400 text-sm font-mono ml-auto">ai_core_v2.py</span>
                </div>
                <div className="space-y-4 font-mono text-sm leading-relaxed">
                  <p><span className="text-blue-400">INPUT &gt;</span> <span className="text-slate-300">Audio: Cough_Wet.wav</span></p>
                  <p><span className="text-blue-400">INPUT &gt;</span> <span className="text-slate-300">Temp: 102.5°F</span> (High)</p>
                  <p><span className="text-blue-400">INPUT &gt;</span> <span className="text-slate-300">Phlegm: Yes (Green)</span></p>
                  <div className="h-px bg-slate-800 my-4"></div>
                  <div className="p-4 bg-green-900/20 border border-green-900/50 rounded text-green-400 font-bold">
                    RECOMMENDATION: BACTERIAL PROFILE DETECTED
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
          <div className="flex items-center gap-2 text-slate-400">
            <Activity size={20} />
            <span className="font-bold">{t('nav.title')} Project</span>
          </div>
          <p className="text-slate-500 text-sm italic">Built for Microsoft Imagine Cup 2025. Powered by Azure AI.</p>
        </div>
      </footer>
    </div>
  );
}

// Fixed-height Sub-components to prevent distortion
function StatCard({ number, label, color }: { number: string, label: string, color: string }) {
  return (
    <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[220px] transition-shadow hover:shadow-md">
      <div className={`text-5xl font-extrabold mb-4 ${color}`}>{number}</div>
      <p className="text-slate-600 font-medium leading-relaxed">{label}</p>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 items-start group">
      <div className="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}