"use client";

import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";


export default function Home() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [recording, setRecording] = useState(false);
  const [lastAudioUrl, setLastAudioUrl] = useState(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 🔔 REGISTER SERVICE WORKER & CHECK SAVED ROOM
  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("❌ Service Worker registration failed:", error);
        });
    }

    // Check if user was previously in a room
    const savedUsername = localStorage.getItem("walkie-username");
    const savedRoomId = localStorage.getItem("walkie-roomId");

    if (savedUsername && savedRoomId) {
      setUsername(savedUsername);
      setRoomId(savedRoomId);

      // Auto-rejoin the room
      setTimeout(() => {
        autoRejoinRoom(savedUsername, savedRoomId);
      }, 500);
    }
  }, []);

  // 🔄 AUTO REJOIN ROOM (Background Connection)
  const autoRejoinRoom = async (user, room) => {
    console.log("🔄 Auto-rejoining room:", room);

    await fetch("/api/socket");

    socketRef.current = io({
      path: "/api/socket",
    });

    socketRef.current.emit("join-room", room);

    // 🔊 RECEIVE AUDIO (with notification support)
    socketRef.current.on("audio-message", (data) => {
      console.log("📥 Audio received");

      // Play audio
      const audio = new Audio(data.audio);
      audio.play();

      // Show notification if app is in background
      if (document.hidden && notificationEnabled) {
        showNotification(room, data.audio);
      }
    });

    setJoined(true);
  };

  // 🔔 REQUEST NOTIFICATION PERMISSION
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Browser notifications support nahi karta 😢");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      setNotificationEnabled(true);
      console.log("✅ Notification permission granted");

      // Show test notification
      new Notification("🎙️ Walkie Talkie", {
        body: "Notifications enabled! Ab app band hone par bhi messages milenge.",
        icon: "/favicon.ico",
      });
    } else {
      alert("Notification permission denied. Background messages nahi milenge.");
    }
  };

  // 🔔 SHOW NOTIFICATION
  const showNotification = (room, audioData) => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "AUDIO_MESSAGE",
        roomId: room,
        audio: audioData,
      });
    } else {
      // Fallback to regular notification
      new Notification("🎙️ New Voice Message", {
        body: `New message in room: ${room}`,
        icon: "/favicon.ico",
        vibrate: [200, 100, 200],
      });
    }
  };

  // 🔹 JOIN ROOM
  const handleJoin = async () => {
    if (!username || !roomId) {
      alert("Username aur Room ID dono bhar bhai 😄");
      return;
    }

    // Save to localStorage for persistence
    localStorage.setItem("walkie-username", username);
    localStorage.setItem("walkie-roomId", roomId);

    // Request notification permission
    await requestNotificationPermission();

    await fetch("/api/socket");

    socketRef.current = io({
      path: "/api/socket",
    });

    socketRef.current.emit("join-room", roomId);

    // 🔊 RECEIVE AUDIO
    socketRef.current.on("audio-message", (data) => {
      console.log("📥 Audio received");

      const audio = new Audio(data.audio);
      audio.play();

      // Show notification if app is in background
      if (document.hidden && notificationEnabled) {
        showNotification(roomId, data.audio);
      }
    });

    setJoined(true);
  };

  // 🎙️ START RECORDING
  const startRecording = async () => {
    if (recording) return;

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      alert("Mic supported nahi hai 😢");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // 🛑 STOP → CONVERT → SEND
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);

        reader.onloadend = () => {
          const base64Audio = reader.result;
          setLastAudioUrl(base64Audio);

          if (socketRef.current) {
            socketRef.current.emit("audio-message", {
              roomId,
              audio: base64Audio,
            });
            console.log("📤 Audio sent to room");
          }
        };
      };

      mediaRecorder.start();
      setRecording(true);
      console.log("🎙️ Recording started");
    } catch (err) {
      console.error(err);
      alert("Mic permission denied");
    }
  };

  // 🛑 STOP RECORDING
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setRecording(false);
    console.log("🛑 Recording stopped");
  };

  // 🚪 LEAVE ROOM
  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Don't clear localStorage - keep room info for auto-rejoin
    setJoined(false);
    console.log("👋 Left room");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {!joined ? (
          <>
            <h1 className="mb-4 text-center text-2xl font-bold">
              🎙️ Walkie Talkie
            </h1>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border px-4 py-3"
              />

              <input
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full rounded-lg border px-4 py-3"
              />

              <button
                onClick={handleJoin}
                className="w-full rounded-lg bg-black py-3 text-white"
              >
                Join Room
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Room: {roomId}
              </h2>
              {notificationEnabled && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  🔔 Notifications ON
                </span>
              )}
            </div>

            <div className="flex flex-col items-center gap-6">
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`h-32 w-32 rounded-full text-white text-lg font-semibold transition
                  ${recording ? "bg-red-600 scale-110" : "bg-black"}
                `}
              >
                {recording ? "Recording..." : "Push To Talk"}
              </button>

              <p className="text-sm text-gray-500">
                {recording
                  ? "🎤 You are speaking..."
                  : "Press & hold to talk"}
              </p>

              {lastAudioUrl && (
                <div className="w-full">
                  <p className="mb-2 text-sm font-medium text-gray-600">
                    ▶️ Last Recording
                  </p>
                  <audio src={lastAudioUrl} controls className="w-full" />
                </div>
              )}

              <button
                onClick={leaveRoom}
                className="mt-4 w-full rounded-lg bg-red-500 py-2 text-white text-sm hover:bg-red-600 transition"
              >
                🚪 Leave Room
              </button>

              <p className="text-xs text-gray-400 text-center mt-2">
                💡 App band karne ke baad bhi messages milenge!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
