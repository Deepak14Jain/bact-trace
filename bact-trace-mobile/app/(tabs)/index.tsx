import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, Modal, Animated } from 'react-native';
// 1. UPDATED IMPORTS 
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Activity, Mic, Camera as CameraIcon, UploadCloud, User, RefreshCw, Play, Square, SwitchCamera } from 'lucide-react-native';

// ⚠️ REPLACE WITH YOUR LAPTOP IP (192.168.29.165 based on your screenshot)
const API_URL = 'http://192.168.29.165:8080/api/cases'; 

export default function BactTraceApp() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation State (Pulsing Opacity)
  const fadeAnim = useRef(new Animated.Value(1)).current; 

  // Form Data
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');

  // Media State
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  
  // Permissions
  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const cameraRef = useRef<CameraView>(null);

  const [aiResult, setAiResult] = useState({
    coughDiagnosis: "Pending",
    coughConfidence: 0,
    visualDiagnosis: "Pending",
    finalRecommendation: "Analyzing..."
  });

  useEffect(() => {
    if (!permission?.granted) requestPermission();
    if (!audioPermission?.granted) requestAudioPermission();
  }, []);

  // --- ANIMATION LOGIC (THE PULSE) ---
  useEffect(() => {
    if (isLoading) {
      // Loop: Fade Out -> Fade In -> Repeat
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3, // Dim to 30%
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1, // Back to 100%
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset when not loading
      fadeAnim.setValue(1);
    }
  }, [isLoading]);

  // --- AUDIO LOGIC ---
  async function startRecording() {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      Alert.alert('Failed to start recording', 'Check microphone permissions.');
    }
  }

  async function stopRecording() {
    if (!recording) return;
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setAudioUri(uri);
  }

  // --- CAMERA LOGIC ---
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, skipProcessing: true });
            setImageUri(photo?.uri ?? null);
        } catch (e) {
            console.error(e);
            Alert.alert("Camera Error", "Could not take photo");
        }
    }
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async () => {
    if (!imageUri || !audioUri) {
      Alert.alert("Missing Data", "Please capture both photo and audio.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    const cleanAudioUri = audioUri.startsWith('file://') ? audioUri : `file://${audioUri}`;
    
    // @ts-ignore
    formData.append('audio', { uri: cleanAudioUri, name: `cough.m4a`, type: `audio/m4a` });

    const cleanImageUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
    const imageName = cleanImageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(imageName || '');
    const type = match ? `image/${match[1]}` : `image/jpeg`;
    
    // @ts-ignore
    formData.append('image', { uri: cleanImageUri, name: imageName || 'photo.jpg', type: type });

    formData.append("patientName", name || "Mobile User");
    formData.append("age", age || "30");
    formData.append("gender", gender);
    formData.append("village", "Mobile Clinic");

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 20000 
      });

      setAiResult({
        coughDiagnosis: response.data.coughDiagnosis,
        coughConfidence: response.data.coughConfidence,
        visualDiagnosis: response.data.visualDiagnosis,
        finalRecommendation: response.data.finalRecommendation
      });
      setStep(2);

    } catch (error: any) {
      console.error("Upload Error:", error);
      Alert.alert("Upload Failed", "Could not reach server. Check 50MB limit or IP.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{textAlign:'center', marginTop: 100, fontSize: 16}}>We need permission to use camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.submitBtn}><Text style={styles.submitText}>Grant Permission</Text></TouchableOpacity>
      </View>
    );
  }

  // --- RENDER ---
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Activity color="#2563EB" size={28} />
          <Text style={styles.logoText}>Bact-Trace Mobile</Text>
        </View>
        <User color="#2563EB" size={24} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Patient Details</Text>
            <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
            <View style={styles.row}>
              <TextInput style={[styles.input, {flex: 1, marginRight: 10}]} placeholder="Age" keyboardType="numeric" value={age} onChangeText={setAge} />
              <TextInput style={[styles.input, {flex: 1}]} placeholder="Gender" value={gender} onChangeText={setGender} />
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Mic color="#A855F7" size={24} />
                <Text style={styles.cardTitle}>Audio Analysis</Text>
              </View>
              <View style={styles.recordRow}>
                <TouchableOpacity onPress={recording ? stopRecording : startRecording} style={[styles.recordBtn, recording ? styles.recordingActive : null]}>
                  {recording ? <Square color="white" size={32} /> : <Mic color="#2563EB" size={32} />}
                </TouchableOpacity>
                <View style={styles.statusBox}>
                  {recording ? <Text style={styles.recordingText}>Recording...</Text> : audioUri ? (
                    <View style={styles.playbackRow}><Play color="#2563EB" size={20} /><Text style={styles.audioSavedText}>Audio Saved</Text></View>
                  ) : <Text style={styles.placeholderText}>Tap mic to record</Text>}
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <CameraIcon color="#4F46E5" size={24} />
                <Text style={styles.cardTitle}>Throat Imaging</Text>
              </View>
              {imageUri ? (
                <View>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity onPress={() => setImageUri(null)} style={styles.retakeBtn}>
                    <Text style={styles.retakeText}>Retake Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.cameraContainer}>
                    <CameraView style={styles.camera} facing={facing} ref={cameraRef} mode="picture">
                        <View style={styles.cameraOverlay}>
                            <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipBtn}>
                                <SwitchCamera color="white" size={24} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>
                                <View style={styles.captureInner} />
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="white" /> : <UploadCloud color="white" size={24} />}
              <Text style={styles.submitText}>{isLoading ? "Processing..." : "Run AI Diagnosis"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Diagnosis Complete</Text>
              <Text style={styles.resultSub}>Confidence: {(aiResult.coughConfidence * 100).toFixed(0)}%</Text>
            </View>
            <View style={[styles.resultCard, {backgroundColor: '#FEF2F2', borderColor: '#FECACA'}]}>
              <Text style={styles.diagnosisLabel}>PRIMARY DIAGNOSIS</Text>
              <Text style={styles.diagnosisValue}>{aiResult.coughDiagnosis}</Text>
            </View>
            <View style={styles.resultCard}>
              <Text style={styles.diagnosisLabel}>RECOMMENDATION</Text>
              <Text style={styles.recommendationText}>{aiResult.finalRecommendation}</Text>
            </View>
            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Visual Findings:</Text>
                <Text style={[styles.detailValue, aiResult.visualDiagnosis.includes("Invalid") ? {color:'red'} : {color:'green'}]}>
                  {aiResult.visualDiagnosis}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => {setStep(1); setImageUri(null); setAudioUri(null);}} style={styles.newCaseBtn}>
              <RefreshCw color="#2563EB" size={20} />
              <Text style={styles.newCaseText}>Start New Case</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* --- ANIMATED LOADER --- */}
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Logo inside Spinner with Pulse Animation */}
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2563EB" style={styles.loaderSpinner} />
                <Animated.View style={[styles.loaderIcon, { opacity: fadeAnim }]}>
                    <Activity color="#2563EB" size={32} />
                </Animated.View>
            </View>

            <Text style={styles.modalTitle}>Analyzing Patient Data...</Text>
            <Text style={styles.modalSub}>Consulting AI Diagnostic Models</Text>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  logoRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#334155' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row' },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  recordBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  recordingActive: { backgroundColor: '#EF4444' },
  statusBox: { flex: 1, height: 50, backgroundColor: '#F1F5F9', borderRadius: 10, justifyContent: 'center', paddingLeft: 15 },
  recordingText: { color: '#EF4444', fontWeight: 'bold' },
  audioSavedText: { color: '#2563EB', fontWeight: '600', marginLeft: 10 },
  playbackRow: { flexDirection: 'row', alignItems: 'center' },
  placeholderText: { color: '#94A3B8' },
  
  // Camera
  cameraContainer: { height: 300, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 20 },
  flipBtn: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  captureBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white' },
  previewImage: { width: '100%', height: 300, borderRadius: 12 },
  retakeBtn: { marginTop: 10, alignSelf: 'center' },
  retakeText: { color: '#EF4444', fontWeight: '600' },

  submitBtn: { backgroundColor: '#2563EB', flexDirection: 'row', padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  submitText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  // Results
  resultHeader: { backgroundColor: '#2563EB', padding: 25, borderRadius: 16, marginBottom: 20 },
  resultTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  resultSub: { color: '#BFDBFE', marginTop: 5 },
  resultCard: { backgroundColor: 'white', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  diagnosisLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginBottom: 5 },
  diagnosisValue: { fontSize: 24, fontWeight: 'bold', color: '#991B1B' },
  recommendationText: { fontSize: 16, color: '#334155', lineHeight: 24 },
  detailsBox: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { color: '#64748B' },
  detailValue: { fontWeight: '600' },
  newCaseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 15 },
  newCaseText: { color: '#2563EB', fontWeight: '600', fontSize: 16 },

  // Loader Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { alignItems: 'center', width: '80%' },
  loaderContainer: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 20, position: 'relative' },
  loaderSpinner: { transform: [{ scale: 2.5 }] },
  loaderIcon: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginTop: 10 },
  modalSub: { fontSize: 14, color: '#64748B', marginTop: 5, textAlign: 'center' }
});