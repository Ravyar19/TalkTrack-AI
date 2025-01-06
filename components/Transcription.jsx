"use client";

import { useEffect, useState, useCallback } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export default function Transcription({ isRecording, onTranscriptionUpdate }) {
  const [finalTranscript, setFinalTranscript] = useState("");

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  useEffect(() => {
    if (isRecording && !listening && browserSupportsSpeechRecognition) {
      resetTranscript();
      SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
      });
      console.log("Started listening");
    } else if (!isRecording && listening) {
      SpeechRecognition.stopListening();
      console.log("Stopped listening");
      // Send final transcript when meeting ends
      if (finalTranscript) {
        onTranscriptionUpdate({
          transcription: finalTranscript,
        });
      }
    }

    return () => {
      SpeechRecognition.stopListening();
    };
  }, [
    isRecording,
    listening,
    browserSupportsSpeechRecognition,
    finalTranscript,
    onTranscriptionUpdate,
  ]);

  // Update final transcript
  useEffect(() => {
    if (transcript) {
      setFinalTranscript(transcript);
    }
  }, [transcript]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        Your browser doesn't support speech recognition.
      </div>
    );
  }

  if (!isMicrophoneAvailable) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">
        Please enable microphone access to use transcription.
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Real-time Transcription</h2>
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            listening ? "bg-green-500" : "bg-gray-300"
          }`}
        ></span>
        <span className="text-sm text-gray-600">
          {listening ? "Listening..." : "Not listening"}
        </span>
      </div>
      <div className="relative">
        <div className="h-64 overflow-y-auto bg-white p-4 rounded border">
          {finalTranscript || "Start speaking..."}
        </div>
        {listening && (
          <div className="absolute bottom-4 right-4">
            <div className="animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-500">Recording</span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {transcript && <div>Current input: {transcript}</div>}
      </div>
    </div>
  );
}
