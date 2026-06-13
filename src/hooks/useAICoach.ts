import { useState, useCallback } from "react";
import { User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { Message, ReceiptItem } from "../types";
import { INITIAL_MESSAGES } from "../utils/constants";

export function useAICoach(user: User | null, scanResultItems: ReceiptItem[]) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatTyping, setIsChatTyping] = useState<boolean>(false);

  const saveMessages = useCallback(async (newMessages: Message[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "configs", "messages"), {
        messages: newMessages
      });
    } catch (err) {
      console.error("Error saving messages to Firestore:", err);
    }
  }, [user]);

  const sendChatMessage = useCallback(async (textToSend: string) => {
    if (!textToSend.trim() || isChatTyping) return;
 
    const userMsg: Message = {
      id: "msg-" + Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
 
    setMessages(prev => {
      const next = [...prev, userMsg];
      saveMessages(next);
      return next;
    });
    setChatInput("");
    setIsChatTyping(true);
 
    try {
      const chatCopy = [...messages, userMsg];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: chatCopy,
          scanHistory: scanResultItems 
        })
      });
 
      if (!res.ok) {
        throw new Error("Coach unresponsive.");
      }
 
      const data = await res.json();
      const modelMsg: Message = {
        id: "msg-" + (Date.now() + 1).toString(),
        role: "model",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => {
        const next = [...prev, modelMsg];
        saveMessages(next);
        return next;
      });
    } catch (e) {
      console.error(e);
      setMessages(prev => {
        const errorMsg: Message = {
          id: "msg-err-" + Date.now(),
          role: "model",
          content: "Network delay. Standard advice: Swapping cows butter for regional wood-pressed oils reduces weekly dairy fat indexes by **78%** instantly. Let me know if you would like me to lock this simulation lever in.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const next = [...prev, errorMsg];
        saveMessages(next);
        return next;
      });
    } finally {
      setIsChatTyping(false);
    }
  }, [messages, isChatTyping, scanResultItems, saveMessages]);

  return {
    messages,
    setMessages,
    chatInput,
    setChatInput,
    isChatTyping,
    sendChatMessage,
    saveMessages
  };
}
