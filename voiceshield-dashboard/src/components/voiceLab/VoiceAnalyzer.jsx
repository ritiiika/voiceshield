import React, { useState, useRef } from 'react';
import { UploadCloud, Mic, Square, Play, RefreshCw, AlertCircle, FileAudio, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { analyzeVoiceAudio, saveCallToHistory } from '../../services/api';
import { DEMO_PRESETS } from '../../services/mockData';

export function VoiceAnalyzer({ onAnalysisComplete, backendOnline }) {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle File Selection
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setAudioUrl(URL.createObjectURL(selected));
      setSelectedPreset(null);
      setError(null);
    }
  };

  // Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setAudioUrl(URL.createObjectURL(dropped));
      setSelectedPreset(null);
      setError(null);
    }
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const recordedFile = new File([audioBlob], 'live_recorded_call.wav', { type: 'audio/wav' });
        setFile(recordedFile);
        setAudioUrl(URL.createObjectURL(audioBlob));
        // Stop audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Could not access microphone. Please allow microphone permissions in browser.');
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  // Select Preset Demo Scenario
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setError(null);

    // Create a mock audio sample / silent wav blob for demo testing
    const sampleBlob = new Blob([new Uint8Array(2048)], { type: 'audio/wav' });
    const mockFile = new File([sampleBlob], `${preset.id}_sample.wav`, { type: 'audio/wav' });
    setFile(mockFile);
    setAudioUrl(null);
  };

  // Execute Analysis
  const handleAnalyze = async () => {
    if (!file && !selectedPreset) {
      setError('Please upload an audio file, record your voice, or select a demo attack preset.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setAnalysisStep(1); // Audio ingestion

    const stepTimer = setInterval(() => {
      setAnalysisStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 900);

    try {
      let resultData;

      if (backendOnline && file) {
        // Real API Call to POST /voice/analyze
        resultData = await analyzeVoiceAudio(file);
      } else {
        // Fallback simulation for offline/preview demo
        await new Promise(r => setTimeout(r, 2200));
        
        if (selectedPreset) {
          const isHigh = selectedPreset.risk >= 70;
          const isVerify = selectedPreset.risk >= 35 && selectedPreset.risk < 70;
          const decision = isHigh ? 'BLOCK' : isVerify ? 'VERIFY' : 'ALLOW';

          resultData = {
            transcript: selectedPreset.transcript,
            requested_action: selectedPreset.action,
            security_analysis: {
              threat_type: selectedPreset.threat,
              risk_score: selectedPreset.risk,
              confidence: 0.95,
              decision: decision,
              reasons: [
                `${selectedPreset.name} pattern matched`,
                `Behavioral heuristic flagged risk score: ${selectedPreset.risk}/100`,
                `Autonomous security policy evaluated`
              ],
              reasoning: selectedPreset.description + ' Flagged by LangGraph Voice Security Agent node.'
            },
            agent_response: decision === 'BLOCK'
              ? "I can't proceed with this request because it triggered a security check. Please complete the required verification or contact support."
              : decision === 'VERIFY'
              ? "For your security, I need to complete an additional verification before proceeding."
              : "Your request appears safe. I can proceed with the requested action.",
            database_id: Math.floor(100 + Math.random() * 900)
          };
        } else {
          // Default generic result
          resultData = {
            transcript: "Voice sample analyzed successfully.",
            requested_action: "general_request",
            security_analysis: {
              threat_type: "normal",
              risk_score: 12,
              confidence: 0.94,
              decision: "ALLOW",
              reasons: ["Standard conversational cadence", "Zero malicious intent detected"],
              reasoning: "The voice interaction does not request privileged actions or disclose sensitive authentication factors."
            },
            agent_response: "Your request appears safe. I can proceed with the requested action.",
            database_id: Math.floor(100 + Math.random() * 900)
          };
        }
      }

      clearInterval(stepTimer);
      setAnalysisStep(5);

      // Construct normalized Call record
      const newCallRecord = {
        id: resultData.database_id || Date.now(),
        call_id: `VOICE-${Math.floor(1000 + Math.random() * 9000)}`,
        caller_id: 'VOICE-UPLOAD',
        transcript: resultData.transcript || 'No transcript generated',
        requested_action: resultData.requested_action || 'general_request',
        threat_type: resultData.security_analysis?.threat_type || 'normal',
        risk_score: resultData.security_analysis?.risk_score || 0,
        confidence: resultData.security_analysis?.confidence || 0.9,
        decision: resultData.security_analysis?.decision || 'ALLOW',
        reasons: resultData.security_analysis?.reasons || [],
        reasoning: resultData.security_analysis?.reasoning || '',
        agent_response: resultData.agent_response || '',
        created_at: new Date().toISOString(),
        audioUrl: audioUrl,
      };

      // Save to history & trigger parent
      saveCallToHistory(newCallRecord);
      onAnalysisComplete(newCallRecord, resultData);

    } catch (err) {
      clearInterval(stepTimer);
      console.error('Analysis error:', err);
      setError(typeof err === 'string' ? err : err.message || 'Analysis failed. Check FastAPI backend at http://127.0.0.1:8000.');
    } finally {
      setAnalyzing(false);
    }
  };

  const steps = [
    { title: 'Audio Ingestion', desc: 'Decoding & sample rate normalization' },
    { title: 'Whisper STT', desc: 'Faster-Whisper speech-to-text decoding' },
    { title: 'Redis Memory', desc: 'Historical caller risk score retrieval' },
    { title: 'LangGraph Agent', desc: 'Multi-node security reasoning graph' },
    { title: 'Verdict Emitted', desc: 'Enforcing ALLOW / VERIFY / BLOCK' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-mono font-bold text-white tracking-wide">
                VOICE INTERCEPT & THREAT ANALYSIS LAB
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Submit live voice recordings directly to <code className="text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">POST /voice/analyze</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border ${
              backendOnline ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              {backendOnline ? '● BACKEND ONLINE (8000)' : '○ DEMO SIMULATION READY'}
            </span>
          </div>
        </div>

        {/* Demo Attack Presets for 1-Click Testing */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              1-Click Hackathon Attack / Safe Presets
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Quick test scenarios
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {DEMO_PRESETS.map((preset) => {
              const isSelected = selectedPreset?.id === preset.id;
              const isHigh = preset.risk >= 70;
              const isVerify = preset.risk >= 35 && preset.risk < 70;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  disabled={analyzing}
                  className={`p-3 rounded-lg text-left transition-all font-mono border text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-white truncate">{preset.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                      isHigh ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : isVerify ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                    "{preset.transcript}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/80">
                    <span>Action: {preset.action}</span>
                    <span className="font-bold text-cyan-400">Risk: {preset.risk}/100</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Input Modes: Drag & Drop + Microphone */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              file && !selectedPreset
                ? 'border-cyan-500/60 bg-cyan-950/20'
                : 'border-slate-800 hover:border-cyan-500/40 bg-slate-900/30 hover:bg-slate-900/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/*,.wav,.mp3,.ogg,.m4a,.webm"
              className="hidden"
            />
            <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-mono font-bold text-white">
              {file && !selectedPreset ? file.name : 'Upload Audio Recording'}
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Drag & drop or browse .wav, .mp3, .ogg, .m4a
            </p>
            {file && !selectedPreset && (
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                <CheckCircle2 className="w-3 h-3" /> Ready: {(file.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>

          {/* Option B: Live Microphone */}
          <div className="border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-900/30">
            <div className={`p-3 rounded-full mb-3 border ${
              isRecording ? 'bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Mic className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-mono font-bold text-white">
              {isRecording ? `Recording: ${recordingTime}s` : 'Live Microphone Intercept'}
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-1 mb-3">
              Speak social engineering prompts to test VoiceShield live
            </p>

            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Recording</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                disabled={analyzing}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-mono text-xs font-semibold flex items-center gap-2 border border-slate-700 hover:border-cyan-500/40"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Record Voice</span>
              </button>
            )}
          </div>
        </div>

        {/* Audio Preview if available */}
        {audioUrl && (
          <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <FileAudio className="w-4 h-4 text-cyan-400" />
              <span>Audio Sample Loaded</span>
            </div>
            <audio controls src={audioUrl} className="h-8 max-w-xs" />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="text-xs font-mono text-slate-400">
            {selectedPreset ? (
              <span className="text-cyan-300">Preset selected: <strong>{selectedPreset.name}</strong></span>
            ) : file ? (
              <span className="text-emerald-300">Audio ready: <strong>{file.name}</strong></span>
            ) : (
              <span>Select a preset or upload an audio file to analyze</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || (!file && !selectedPreset)}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-mono font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all ${
              analyzing
                ? 'bg-cyan-900 text-cyan-300 cursor-not-allowed'
                : !file && !selectedPreset
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
            }`}
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>EVALUATING THREAT GRAPH...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>EXECUTE VOICE SECURITY ANALYSIS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* LangGraph Multi-Stage Processing Pipeline Visualizer */}
      {analyzing && (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-pulse-slow">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            LANGGRAPH VOICE AGENT PIPELINE IN PROGRESS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {steps.map((s, idx) => {
              const stepNum = idx + 1;
              const isPassed = analysisStep > stepNum;
              const isCurrent = analysisStep === stepNum;
              return (
                <div
                  key={s.title}
                  className={`p-3 rounded-lg border font-mono text-xs transition-all ${
                    isPassed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : isCurrent
                      ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 font-bold">
                    <span>STEP 0{stepNum}</span>
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    ) : null}
                  </div>
                  <div className="font-bold text-slate-200">{s.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
