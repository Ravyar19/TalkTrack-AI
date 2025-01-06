"use client";
import "regenerator-runtime/runtime";

import ActionItems from "@/components/ActionItems";
import EmailDraft from "@/components/EmailDraft";
import Summary from "@/components/Summary";
import Transcription from "@/components/Transcription";
import { useState } from "react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [meetingData, setMeetingData] = useState({
    transcription: "",
    actionItems: [],
    summary: "",
    participants: [],
    startTime: null,
    endTime: null,
    isProcessing: false,
  });

  const processTranscription = (text) => {
    const newActionItems = extractActionItemsFromText(text);
    setMeetingData((prev) => ({
      ...prev,
      actionItems: [...prev.actionItems, ...newActionItems],
    }));
  };

  // Helper function to extract action items from text
  const extractActionItemsFromText = (text) => {
    const patterns = [
      /(?:need to|must|should|will|going to|assigned to)(.*?)(?:\.|$)/gi,
      /(?:action item|todo|task):(.*?)(?:\.|$)/gi,
      /(?:@\w+)(.*?)(?:\.|$)/gi,
    ];

    const items = [];
    patterns.forEach((pattern) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]?.trim()) {
          items.push({
            text: match[1].trim(),
            assignee: null,
            deadline: null,
            status: "pending",
          });
        }
      }
    });
    return items;
  };

  const startMeeting = () => {
    setIsRecording(true);
    setMeetingData((prev) => ({
      ...prev,
      startTime: new Date(),
      participants: ["John Doe", "Jane Smith"], // Replace with actual participant detection
    }));
  };

  const endMeeting = () => {
    setIsRecording(false);
    setMeetingData((prev) => ({
      ...prev,
      endTime: new Date(),
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AI Meeting Assistant</h1>
      <div className="flex gap-4 mb-6">
        <button
          onClick={startMeeting}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={isRecording}
        >
          Start Meeting
        </button>
        <button
          onClick={endMeeting}
          disabled={!isRecording}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          End Meeting
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Transcription
          isRecording={isRecording}
          onTranscriptionUpdate={setMeetingData}
        />
        <ActionItems actionItems={meetingData.actionItems} />
        <Summary meetingData={meetingData} />
        <EmailDraft meetingData={meetingData} />
      </div>
    </div>
  );
}
