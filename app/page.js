"use client";

import "regenerator-runtime/runtime";
import { useState, useEffect, useCallback } from "react";
import ActionItems from "../components/ActionItems";
import EmailDraft from "../components/EmailDraft";
import Summary from "../components/Summary";
import Transcription from "../components/Transcription";

export default function MeetingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fullTranscript, setFullTranscript] = useState("");
  const [meetingData, setMeetingData] = useState({
    transcription: "",
    actionItems: [],
    summary: "",
    participants: [],
    startTime: null,
    endTime: null,
  });

  const processWithAI = useCallback(async (transcription) => {
    try {
      if (!transcription || transcription.trim().length === 0) {
        console.log("No transcription to process");
        return;
      }

      setIsProcessing(true);
      console.log("Processing transcription:", transcription);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcription: transcription.trim() }),
      });

      const analysis = await response.json();
      console.log("AI Analysis Result:", analysis);

      if (!response.ok) {
        throw new Error(analysis.error || "AI analysis failed");
      }

      setMeetingData((prev) => ({
        ...prev,
        actionItems: analysis.actionItems || [],
        summary: analysis.summary || "",
        keyPoints: analysis.keyPoints || [],
        decisions: analysis.decisions || [],
      }));
    } catch (error) {
      console.error("Error processing with AI:", error);
      alert("Failed to process meeting with AI. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const startMeeting = () => {
    setIsRecording(true);
    setFullTranscript("");
    setMeetingData({
      transcription: "",
      actionItems: [],
      summary: "",
      participants: ["John Doe", "Jane Smith"],
      startTime: new Date(),
      endTime: null,
    });
  };

  const endMeeting = async () => {
    setIsRecording(false);

    // Update meeting data with final transcript
    const finalMeetingData = {
      ...meetingData,
      transcription: fullTranscript,
      endTime: new Date(),
    };
    setMeetingData(finalMeetingData);

    console.log("Processing final transcription:", fullTranscript);
    await processWithAI(fullTranscript);
  };

  const handleTranscriptionUpdate = (update) => {
    if (update.transcription) {
      setFullTranscript((prev) => {
        const newTranscript = prev + " " + update.transcription.trim();
        console.log("Updated transcript:", newTranscript);
        return newTranscript;
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AI Meeting Assistant</h1>

      {/* Meeting Controls with Recording Indicator */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-4 items-center">
          <button
            onClick={startMeeting}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isRecording
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
            disabled={isRecording}
          >
            {isRecording ? "Meeting in Progress" : "Start Meeting"}
          </button>
          <button
            onClick={endMeeting}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              !isRecording
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            disabled={!isRecording}
          >
            End Meeting
          </button>

          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="animate-pulse h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-red-500 font-medium">Recording</span>
            </div>
          )}
        </div>

        {isProcessing && (
          <div className="flex items-center gap-2 text-blue-500">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span>AI is processing the conversation...</span>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <Transcription
            isRecording={isRecording}
            onTranscriptionUpdate={handleTranscriptionUpdate}
          />
          <ActionItems actionItems={meetingData.actionItems} />
        </div>
        <div className="flex flex-col gap-6">
          <Summary meetingData={meetingData} />
          <EmailDraft meetingData={meetingData} />
        </div>
      </div>

      {/* Debug Information */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold">Debug Info:</h3>
        <p>Recording: {isRecording ? "Yes" : "No"}</p>
        <p>Processing: {isProcessing ? "Yes" : "No"}</p>
        <p>Transcript Length: {fullTranscript.length}</p>
        <p>Action Items: {meetingData.actionItems?.length || 0}</p>
        <details>
          <summary>Current Transcript</summary>
          <p className="mt-2 p-2 bg-white rounded">{fullTranscript}</p>
        </details>
      </div>
    </div>
  );
}
