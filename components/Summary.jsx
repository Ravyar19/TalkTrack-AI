export default function Summary({ meetingData }) {
  const generateSummary = () => {
    const keyPoints = extractKeyPoints(meetingData.transcription);
    const decisions = extractDecisions(meetingData.transcription);

    return {
      duration: calculateDuration(meetingData.startTime, meetingData.endTime),
      participants: meetingData.participants,
      keyPoints,
      decisions,
      actionItems: meetingData.actionItems,
    };
  };

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Meeting Summary</h2>
      <div className="space-y-4">{/* Summary content */}</div>
    </div>
  );
}
