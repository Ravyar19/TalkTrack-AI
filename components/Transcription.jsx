"use client";

import { useEffect, useState, useRef } from "react";

export default function Transcription({ isRecording, onTranscriptionUpdate }) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    // Keep the ref updated with latest transcript
    finalTranscriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setTranscript((prev) => {
              const newTranscript = (prev + " " + finalTranscript).trim();
              console.log("Updating transcript:", newTranscript);
              return newTranscript;
            });
          }
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
        };

        setRecognition(recognition);
      }
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!recognition) return;

    const handleStart = async () => {
      try {
        await recognition.start();
        setIsListening(true);
        console.log("Started recording");
      } catch (error) {
        console.error("Error starting recognition:", error);
      }
    };

    const handleStop = async () => {
      try {
        recognition.stop();
        setIsListening(false);

        // Use the ref to get the latest transcript
        const finalTranscript = finalTranscriptRef.current;
        console.log(
          "Stopped recording with final transcript:",
          finalTranscript
        );

        if (finalTranscript && finalTranscript.trim()) {
          console.log("Sending final transcript to parent:", finalTranscript);
          onTranscriptionUpdate({
            transcription: finalTranscript.trim(),
          });
        }
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    };

    if (isRecording && !isListening) {
      handleStart();
    } else if (!isRecording && isListening) {
      handleStop();
    }
  }, [isRecording, isListening, recognition, onTranscriptionUpdate]);

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Real-time Transcription</h2>

      <div className="mb-2 flex items-center gap-2">
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            isListening ? "bg-green-500" : "bg-gray-300"
          }`}
        ></span>
        <span className="text-sm text-gray-600">
          {isListening ? "Listening..." : "Not listening"}
        </span>
        {isListening && (
          <span className="text-xs text-green-600">(Speak now)</span>
        )}
      </div>

      <div className="relative">
        <div className="h-64 overflow-y-auto bg-white p-4 rounded border">
          {transcript || "Start speaking..."}
        </div>
        {isListening && (
          <div className="absolute bottom-4 right-4">
            <div className="animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-500">Recording</span>
            </div>
          </div>
        )}
      </div>

      {/* Debug info */}
      <div className="mt-2 text-xs text-gray-500">
        <div>Status: {isListening ? "Recording" : "Not recording"}</div>
        <div>Transcript length: {transcript.length}</div>
      </div>
    </div>
  );
}
