import React, { useState, useRef, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import Webcam from 'react-webcam';
import { 
  Mic, Camera, Activity, UploadCloud, 
  RefreshCw, LayoutDashboard, FileText, Settings, User, Loader2, Upload, Play,
  Thermometer, MapPin, AlertCircle 
} from 'lucide-react';
import axios from 'axios';

const DoctorView = () => {
  const [step, setStep] = useState(1);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('exam'); 
  const [isLoading, setIsLoading] = useState(false);
  
  // --- 1. NEW: ROBUST VITALS STATE ---
  const [temperature, setTemperature] = useState("98.6");
  const [symptomsDays, setSymptomsDays] = useState("2");
  const [hasPhlegm, setHasPhlegm] = useState("No");
  const [breathingDifficulty, setBreathingDifficulty] = useState("No");
  const [location, setLocation] = useState<{lat: number | null, long: number | null}>({ lat: null, long: null });

  // Upload State
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiResult, setAiResult] = useState({
    coughDiagnosis: "Pending...",
    coughConfidence: 0,
    visualDiagnosis: "Pending...",
    finalRecommendation: "Analyzing..."
  });

  const [patientData, setPatientData] = useState({
    name: '', age: '', gender: 'Male', village: 'Remote Village A'
  });
  
  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({ audio: true });
  const webcamRef = useRef<Webcam>(null);

  // --- 2. NEW: GET GPS LOCATION ON LOAD ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          long: position.coords.longitude
        });
      }, (error) => {
        console.log("GPS denied:", error);
      });
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedAudio(file);
      setUploadedAudioUrl(URL.createObjectURL(file));
      clearBlobUrl(); 
    }
  };

  const capture = React.useCallback(() => {
    if (webcamRef.current) {
      setImgSrc(webcamRef.current.getScreenshot());
    }
  }, [webcamRef]);

  const handleSubmit = async () => {
    const hasAudio = mediaBlobUrl || uploadedAudio;
    if (!imgSrc || !hasAudio) {
      alert("Please provide both Audio (Recorded or Uploaded) and Image.");
      return;
    }

    setIsLoading(true);
    
    try {
        // Prepare Files
        const imageBlob = await (await fetch(imgSrc)).blob();
        const imageFile = new File([imageBlob], "throat_scan.jpg", { type: "image/jpeg" });

        let audioFileToUpload;
        if (uploadedAudio) {
            audioFileToUpload = uploadedAudio;
        } else if (mediaBlobUrl) {
            const audioBlob = await (await fetch(mediaBlobUrl)).blob();
            audioFileToUpload = new File([audioBlob], "cough_audio.wav", { type: "audio/wav" });
        }

        // 3. SEND DATA (Includes New Vitals)
        const formData = new FormData();
        formData.append("audio", audioFileToUpload!);
        formData.append("image", imageFile);
        formData.append("patientName", patientData.name || "Anonymous");
        formData.append("age", patientData.age || "30");
        formData.append("gender", patientData.gender);
        formData.append("village", patientData.village);
        
        // --- NEW FIELDS ---
        formData.append("temperature", temperature);
        formData.append("symptomsDays", symptomsDays);
        formData.append("hasPhlegm", hasPhlegm);
        formData.append("breathingDifficulty", breathingDifficulty);
        if (location.lat) {
            formData.append("latitude", location.lat.toString());
            formData.append("longitude", location.long.toString());
        }
        // ------------------

        // ⚠️ Ensure this matches your Java Backend URL
        const response = await axios.post('http://localhost:8080/api/cases', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setAiResult({
            coughDiagnosis: response.data.coughDiagnosis,
            coughConfidence: response.data.coughConfidence,
            visualDiagnosis: response.data.visualDiagnosis,
            finalRecommendation: response.data.finalRecommendation
        });

        setStep(2); 
    } catch (e) {
        console.error(e);
        alert("Upload Failed. Check Java Console.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 relative">
      
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative">
                <div className="w-24 h-24 border-4 border-blue-100 rounded-full animate-spin"></div>
                <div className="w-24 h-24 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                <Activity className="w-10 h-10 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mt-8">Analyzing Clinical Vitals...</h2>
            <p className="text-slate-500 mt-2">Consulting AI Antibiotic Protocols</p>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Activity className="text-white w-5 h-5" /></div>
            <span className="font-bold text-xl text-blue-900">Bact-Trace</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => setActiveTab('exam')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'exam' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}><LayoutDashboard className="w-5 h-5" /> New Examination</button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50"><FileText className="w-5 h-5" /> Patient History</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="md:hidden bg-white p-4 flex justify-between items-center border-b sticky top-0 z-10">
            <div className="flex items-center gap-2"><Activity className="text-blue-600 w-6 h-6" /><span className="font-bold text-lg">Bact-Trace</span></div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-blue-600" /></div>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
            {step === 1 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 h-full">
                    
                    {/* LEFT COLUMN: DETAILS + VITALS */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* 1. PATIENT DETAILS */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><User className="w-5 h-5 text-blue-500" /> Patient Details</h3>
                            <div className="space-y-4">
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label><input type="text" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={patientData.name} onChange={e => setPatientData({...patientData, name: e.target.value})} placeholder="e.g. Rahul Kumar"/></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Age</label><input type="number" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={patientData.age} onChange={e => setPatientData({...patientData, age: e.target.value})} placeholder="45"/></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Gender</label><select className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500" value={patientData.gender} onChange={e => setPatientData({...patientData, gender: e.target.value})}><option>Male</option><option>Female</option></select></div>
                                </div>
                                {location.lat && (
                                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">
                                        <MapPin className="w-3 h-3" /> GPS Location Active
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. CLINICAL VITALS (NEW) */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Thermometer className="w-5 h-5 text-red-500" /> Clinical Signs</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Temp (°F)</label>
                                        <input type="number" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="98.6"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Days Sick</label>
                                        <input type="number" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={symptomsDays} onChange={e => setSymptomsDays(e.target.value)} placeholder="2"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Productive Cough (Phlegm)?</label>
                                    <select className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500" value={hasPhlegm} onChange={e => setHasPhlegm(e.target.value)}>
                                        <option>No</option>
                                        <option>Yes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-red-700 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Breathing Difficulty?</label>
                                    <select className={`w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-red-500 ${breathingDifficulty === 'Yes' ? 'border-red-500 bg-red-50 text-red-700' : ''}`} value={breathingDifficulty} onChange={e => setBreathingDifficulty(e.target.value)}>
                                        <option>No</option>
                                        <option>Yes (Emergency)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: DIAGNOSTIC TOOLS */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* 3. AUDIO SECTION */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2"><Mic className="w-5 h-5 text-purple-500" /> Audio Analysis</h3>
                                <div className="flex gap-2">
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />
                                    <button onClick={() => fileInputRef.current?.click()} className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full text-slate-600 font-medium transition-colors">
                                        <Upload className="w-3 h-3" /> Upload File
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-6 items-center">
                                <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${status === 'recording' ? 'bg-red-500 text-white shadow-red-300 shadow-lg scale-110' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                                    <Mic className="w-8 h-8" />
                                </button>
                                <div className="flex-1 w-full">
                                    <div className="h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center px-4 overflow-hidden relative">
                                        {status === 'recording' ? (
                                            <div className="w-full flex gap-1 justify-center">
                                                {[...Array(12)].map((_, i) => (<div key={i} className="w-1 bg-red-400 rounded-full animate-bounce" style={{height: `${Math.random() * 80 + 20}%`, animationDelay: `${i*0.1}s`}}></div>))}
                                            </div>
                                        ) : uploadedAudioUrl ? (
                                            <div className="w-full flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"><Play className="w-4 h-4 text-purple-600" /></div>
                                                <div className="flex-1"><p className="text-xs font-bold text-slate-700 truncate">{uploadedAudio?.name}</p><p className="text-[10px] text-slate-400">Ready for analysis</p></div>
                                                <audio src={uploadedAudioUrl} controls className="h-8 w-24" />
                                            </div>
                                        ) : mediaBlobUrl ? (
                                            <audio src={mediaBlobUrl} controls className="w-full h-8" />
                                        ) : (
                                            <span className="text-slate-400 text-sm">Record or Upload Audio...</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. VISION SECTION */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Camera className="w-5 h-5 text-indigo-500" /> Throat Imaging</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="aspect-video bg-black rounded-lg overflow-hidden relative group">
                                    {!imgSrc ? <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" /> : <img src={imgSrc} alt="captured" className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex flex-col justify-center gap-3">
                                    {!imgSrc ? <button onClick={capture} className="w-full py-3 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 flex items-center justify-center gap-2"><Camera className="w-4 h-4" /> Capture Photo</button> : <button onClick={() => setImgSrc(null)} className="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100">Retake</button>}
                                </div>
                            </div>
                        </div>

                        {/* SUBMIT */}
                        <div className="pt-4">
                            <button onClick={handleSubmit} disabled={(!mediaBlobUrl && !uploadedAudio && !imgSrc) || isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin" /> : <UploadCloud className="w-6 h-6" />} {isLoading ? "Processing..." : "Run AI Diagnosis"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* RESULT VIEW */
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-4xl mx-auto animate-fade-in">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                        <div className="flex items-center gap-3 mb-2"><div className="bg-white/20 p-2 rounded-lg"><Activity className="w-6 h-6" /></div><h2 className="text-2xl font-bold">Diagnostic Report</h2></div>
                        <p className="opacity-90">Case ID: #BT-{Math.floor(Math.random()*9000)+1000}</p>
                    </div>
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 mb-8">
                            <div className="flex-1 bg-red-50 border border-red-100 p-6 rounded-xl text-center"><span className="text-red-600 font-bold uppercase tracking-wider text-sm">Primary Diagnosis</span><h1 className="text-3xl font-extrabold text-blue-900 mt-2 mb-1">{aiResult.coughDiagnosis}</h1><p className="text-slate-600 font-medium">{(aiResult.coughConfidence * 100).toFixed(1)}% Confidence</p></div>
                             <div className="flex-1 bg-slate-50 border border-slate-100 p-6 rounded-xl"><span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Recommendation</span><p className="text-slate-800 text-lg font-medium mt-2 leading-relaxed">{aiResult.finalRecommendation}</p></div>
                        </div>
                        {/* VISUAL DIAGNOSIS ROW */}
                        <div className="mb-8 flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                             <span className="text-slate-600 font-medium">Visual Findings:</span>
                             <span className={`font-bold ${aiResult.visualDiagnosis?.includes("Healthy") ? "text-green-600" : "text-amber-600"}`}>{aiResult.visualDiagnosis}</span>
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
                            <button onClick={() => {setStep(1); setImgSrc(null); setUploadedAudio(null); setUploadedAudioUrl(null);}} className="flex items-center gap-2 text-blue-600 font-semibold hover:bg-blue-50 px-6 py-3 rounded-lg">
                                <RefreshCw className="w-4 h-4" /> Start New Case
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default DoctorView;