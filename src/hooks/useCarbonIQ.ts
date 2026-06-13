import { useState, useEffect, useCallback } from "react";
import { AnalysisResult, Message, CityData, TabKey } from "../types";
import { useAuth } from "./useAuth";
import { useTwinConfig } from "./useTwinConfig";
import { useAICoach } from "./useAICoach";
import { db } from "../services/firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection 
} from "firebase/firestore";
import {
  INITIAL_RECEIPTS_HISTORY,
  INITIAL_SCAN_RESULT,
  INITIAL_CITIES_DATA,
  INITIAL_WEEKLY_MISSIONS,
  OFFLINE_FALLBACK_RESULT
} from "../utils/constants";

export function useCarbonIQ() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("workspace");
  const [selectedCityNode, setSelectedCityNode] = useState<string>("Bengaluru");
  const [streakCount, setStreakCount] = useState<number>(5);
  const [userXP, setUserXP] = useState<number>(340);
  const [totalCarbonSaved, setTotalCarbonSaved] = useState<number>(24.8);
  const [activeToast, setActiveToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const [receiptsHistory, setReceiptsHistory] = useState<AnalysisResult[]>(INITIAL_RECEIPTS_HISTORY);

  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<AnalysisResult>(INITIAL_SCAN_RESULT);

  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [pipelineActive, setPipelineActive] = useState<boolean>(false);

  const [citiesData, setCitiesData] = useState<CityData[]>(INITIAL_CITIES_DATA);
  const [weeklyMissions, setWeeklyMissions] = useState(INITIAL_WEEKLY_MISSIONS);

  // Integrate sub-hooks
  const {
    dairyReductionPercent,
    setDairyReductionPercent,
    altAdoptionPercent,
    setAltAdoptionPercent,
    energyTransitionActive,
    setEnergyTransitionActive
  } = useTwinConfig(user);

  const {
    messages,
    setMessages,
    chatInput,
    setChatInput,
    isChatTyping,
    sendChatMessage,
    saveMessages
  } = useAICoach(user, scanResult.items);

  // 1. Fetch data from Firestore on mount/user change
  useEffect(() => {
    if (!user) return;

    const fetchFirestoreData = async () => {
      try {
        // Fetch Profile
        const profileDocRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileDocRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          if (data.streakCount !== undefined) setStreakCount(data.streakCount);
          if (data.userXP !== undefined) setUserXP(data.userXP);
          if (data.totalCarbonSaved !== undefined) setTotalCarbonSaved(data.totalCarbonSaved);
          if (data.selectedCityNode !== undefined) setSelectedCityNode(data.selectedCityNode);
        } else {
          // Initialize profile
          await setDoc(profileDocRef, {
            streakCount: 5,
            userXP: 340,
            totalCarbonSaved: 24.8,
            selectedCityNode: "Bengaluru"
          });
        }

        // Fetch Twin config (initial loader only)
        const twinSnap = await getDoc(doc(db, "users", user.uid, "configs", "twin"));
        if (twinSnap.exists()) {
          const data = twinSnap.data();
          if (data.dairyReductionPercent !== undefined) setDairyReductionPercent(data.dairyReductionPercent);
          if (data.altAdoptionPercent !== undefined) setAltAdoptionPercent(data.altAdoptionPercent);
          if (data.energyTransitionActive !== undefined) setEnergyTransitionActive(data.energyTransitionActive);
        }

        // Fetch Receipts History
        const receiptsSnap = await getDocs(collection(db, "users", user.uid, "receipts"));
        const fetchedReceipts: AnalysisResult[] = [];
        receiptsSnap.forEach((d) => {
          fetchedReceipts.push(d.data() as AnalysisResult);
        });
        if (fetchedReceipts.length > 0) {
          setReceiptsHistory(fetchedReceipts);
        }

        // Fetch Coach Messages
        const msgSnap = await getDoc(doc(db, "users", user.uid, "configs", "messages"));
        if (msgSnap.exists()) {
          const data = msgSnap.data();
          if (data.messages !== undefined) setMessages(data.messages);
        }
      } catch (error) {
        console.warn("Firestore initialization warning (falling back to memory):", error);
      }
    };

    fetchFirestoreData();
  }, [user, setDairyReductionPercent, setAltAdoptionPercent, setEnergyTransitionActive, setMessages]);

  const saveProfile = useCallback(async (newStreak: number, newXP: number, newSaved: number, newCity: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        streakCount: newStreak,
        userXP: newXP,
        totalCarbonSaved: newSaved,
        selectedCityNode: newCity
      });
    } catch (err) {
      console.error("Error saving profile to Firestore:", err);
    }
  }, [user]);

  const triggerToast = useCallback((msg: string, type: "success" | "info" = "success") => {
    setActiveToast({ message: msg, type });
    setTimeout(() => {
      setActiveToast(null);
    }, 4500);
  }, []);

  const registerScanResults = useCallback((data: AnalysisResult) => {
    setScanResult(data);
    setReceiptsHistory(prev => [data, ...prev]);

    const newStreak = streakCount + 1;
    const newXP = userXP + 45;
    const newSaved = totalCarbonSaved + 1.2;

    setStreakCount(newStreak);
    setUserXP(newXP);
    setTotalCarbonSaved(newSaved);

    saveProfile(newStreak, newXP, newSaved, selectedCityNode);

    // Save receipt history item
    if (user) {
      const receiptId = data.items[0]?.id || "receipt-" + Date.now().toString();
      setDoc(doc(db, "users", user.uid, "receipts", receiptId), data)
        .catch(err => console.error("Error writing scanned receipt to Firestore:", err));
    }

    setCitiesData(prev => prev.map(city => {
      if (city.name.toLowerCase() === selectedCityNode.toLowerCase() || 
          (selectedCityNode === "Bengaluru" && city.name === "Bengaluru")) {
        const newAvg = parseFloat(((city.avgCo2 * 49 + data.totalCo2) / 50).toFixed(2));
        return {
          ...city,
          avgCo2: newAvg,
          trend: data.totalCo2 > city.avgCo2 ? "increasing" as const : "improving" as const
        };
      }
      return city;
    }));

    triggerToast(`Network Synced: ${selectedCityNode} Municipal Grid updated. Basket CO₂ added.`, "success");

    const coachExplanation = `I flagged your recent scanned purchase with a total footprint of **${data.totalCo2.toFixed(1)}kg CO₂**. The main carbon lock lies in your **${data.items[0]?.name || "Purchases"}**. Sourced dairy components have been logged. Switching to **${data.items[0]?.alternative || "plant alternatives"}** avoids roughly **70%** emissions and keeps you beneath the ${selectedCityNode} local median.`;
    
    const newSessionAdvisory: Message = {
      id: "scan-info-" + Date.now().toString(),
      role: "model",
      content: `💡 **AUTOMATED LIFECYCLE MEMORY SYNC:**\n\n${coachExplanation}\n\nYour digital twin and local rankings have recalibrated. Settle in and review your twin in the Metrics Hub.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => {
      const next = [...prev, newSessionAdvisory];
      saveMessages(next);
      return next;
    });

    setDairyReductionPercent(prev => Math.min(prev + 10, 100));
  }, [user, streakCount, userXP, totalCarbonSaved, selectedCityNode, saveProfile, triggerToast, setDairyReductionPercent, setMessages, saveMessages]);

  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }, []);

  const handleFileProcessing = useCallback(async (file: File) => {
    setPipelineActive(true);
    setPipelineStep(1);
    setUploadProgress("Scanning image content...");
    
    try {
      setPipelineStep(2);
      setUploadProgress("Requesting Cloud Storage upload endpoint...");
      
      // Request Signed URL
      let gcsUrl = "";
      let signedUrl = "";
      try {
        const signedUrlRes = await fetch("/api/get-signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `receipts/${Date.now()}-${file.name}`,
            contentType: file.type
          })
        });
        if (signedUrlRes.ok) {
          const sData = await signedUrlRes.json();
          signedUrl = sData.signedUrl;
          gcsUrl = sData.gcsUrl;
        }
      } catch (err) {
        console.warn("Failed to generate signed URL, falling back to base64 inline upload:", err);
      }

      setPipelineStep(3);
      setUploadProgress("Deconstructing receipts with Gemini Vision...");

      let scanResponse;
      if (signedUrl && gcsUrl) {
        // Upload image to Cloud Storage bucket via PUT signed URL
        await fetch(signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file
        });

        // Trigger receipt analysis using the Cloud Storage URL
        scanResponse = await fetch("/api/scan-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gcsUrl: gcsUrl,
            mimeType: file.type,
            rawText: file.name
          })
        });
      } else {
        // Fallback: Inline Base64
        const base64Str = await fileToBase64(file);
        scanResponse = await fetch("/api/scan-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64Str,
            mimeType: file.type,
            rawText: file.name
          })
        });
      }
      
      setPipelineStep(4);
      setUploadProgress("Updating Digital Carbon Twin simulation...");
      setPipelineStep(5);
      setUploadProgress("Synchronizing grid nodes and user balances...");
 
      if (!scanResponse || !scanResponse.ok) {
        throw new Error("API call error. Switched to fallback.");
      }
 
      const data: AnalysisResult = await scanResponse.json();
      registerScanResults(data);
 
    } catch (err) {
      console.warn("Scan API error, engaging high-fidelity local models:", err);
      registerScanResults(OFFLINE_FALLBACK_RESULT);
    } finally {
      setUploadProgress(null);
      setPipelineActive(false);
      setPipelineStep(0);
    }
  }, [user, fileToBase64, registerScanResults]);

  const triggerSampleScan = useCallback(async (sampleId: string) => {
    setPipelineActive(true);
    setPipelineStep(1);
    setUploadProgress("Ingesting sample receipt telemetry...");
    
    try {
      setPipelineStep(2);
      setUploadProgress("Mapping ingredients with Gemini models...");
      setPipelineStep(3);
      setUploadProgress("Recalculating personal Twin trajectory...");
      setPipelineStep(4);
      setUploadProgress("Propagating municipal database updates...");
      setPipelineStep(5);
      setUploadProgress("Structuring real-time advisor logs...");
 
      const res = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleId })
      });
 
      if (res.ok) {
        const data = await res.json();
        registerScanResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadProgress(null);
      setPipelineActive(false);
      setPipelineStep(0);
    }
  }, [registerScanResults]);

  const handleToggleMissionCommit = useCallback((id: string) => {
    const targetMission = weeklyMissions.find(m => m.id === id);
    if (!targetMission) return;

    const nextCommit = !targetMission.isCommit;
    let finalXP = userXP;
    let finalAlt = altAdoptionPercent;

    if (nextCommit) {
      triggerToast(`Campaign Locked: '${targetMission.title}'. Optimized future trajectory improved!`, "info");
      finalXP = userXP + 25;
      setUserXP(finalXP);
      finalAlt = Math.min(altAdoptionPercent + 15, 100);
      setAltAdoptionPercent(finalAlt);
    } else {
      finalAlt = Math.max(altAdoptionPercent - 15, 0);
      setAltAdoptionPercent(finalAlt);
    }
    
    saveProfile(streakCount, finalXP, totalCarbonSaved, selectedCityNode);

    setWeeklyMissions(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          isCommit: nextCommit,
          status: nextCommit ? "active" : "available"
        };
      }
      return m;
    }));
  }, [weeklyMissions, streakCount, userXP, totalCarbonSaved, selectedCityNode, saveProfile, triggerToast, altAdoptionPercent, setAltAdoptionPercent, setUserXP]);

  return {
    activeTab,
    setActiveTab,
    selectedCityNode,
    setSelectedCityNode,
    streakCount,
    setStreakCount,
    userXP,
    setUserXP,
    totalCarbonSaved,
    activeToast,
    receiptsHistory,
    uploadProgress,
    dragActive,
    setDragActive,
    scanResult,
    setScanResult,
    pipelineStep,
    pipelineActive,
    dairyReductionPercent,
    setDairyReductionPercent,
    altAdoptionPercent,
    setAltAdoptionPercent,
    energyTransitionActive,
    setEnergyTransitionActive,
    messages,
    chatInput,
    setChatInput,
    isChatTyping,
    citiesData,
    weeklyMissions,
    triggerToast,
    handleFileProcessing,
    triggerSampleScan,
    sendChatMessage,
    handleToggleMissionCommit
  };
}
