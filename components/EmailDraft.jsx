export default function EmailDraft({ meetingData }) {
  const extractKeyPoints = (text) => {
    if (!text) return [];
    const sentences = text.split(/[.!?]+/);
    const keyPoints = sentences.filter((sentence) => {
      const keywords = [
        "important",
        "key",
        "crucial",
        "significant",
        "priority",
      ];
      return keywords.some((keyword) =>
        sentence.toLowerCase().includes(keyword)
      );
    });
    return keyPoints.filter((point) => point.trim().length > 0);
  };

  const extractDecisions = (text) => {
    if (!text) return [];
    const decisionPatterns = [
      /(?:decided|agreed|concluded|resolved)\s+(?:to|that)\s+(.*?)(?:\.|$)/gi,
      /(?:decision|agreement):\s+(.*?)(?:\.|$)/gi,
    ];

    const decisions = [];
    decisionPatterns.forEach((pattern) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]?.trim()) {
          decisions.push(match[1].trim());
        }
      }
    });
    return decisions;
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "Duration not available";
    const duration = (new Date(endTime) - new Date(startTime)) / 1000 / 60; // in minutes
    return `${Math.round(duration)} minutes`;
  };

  const generateSummary = () => {
    return {
      duration: calculateDuration(meetingData?.startTime, meetingData?.endTime),
      participants: meetingData?.participants || [],
      keyPoints: extractKeyPoints(meetingData?.transcription || ""),
      decisions: extractDecisions(meetingData?.transcription || ""),
      actionItems: meetingData?.actionItems || [],
    };
  };

  const generateEmail = () => {
    const summary = generateSummary();
    const date = new Date().toLocaleDateString();

    return `Subject: Meeting Summary - ${date}
  
  Dear team,
  
  Thank you for attending today's meeting. Here's a summary of our discussion:
  
  Duration: ${summary.duration}
  Participants: ${summary.participants.join(", ") || "No participants recorded"}
  
  Key Points Discussed:
  ${
    summary.keyPoints.length > 0
      ? summary.keyPoints.map((point) => `- ${point}`).join("\n")
      : "- No key points recorded"
  }
  
  Decisions Made:
  ${
    summary.decisions.length > 0
      ? summary.decisions.map((decision) => `- ${decision}`).join("\n")
      : "- No decisions recorded"
  }
  
  Action Items:
  ${
    summary.actionItems.length > 0
      ? summary.actionItems
          .map(
            (item) =>
              `- ${item.text}${
                item.assignee ? ` (Assigned to: @${item.assignee})` : ""
              }${item.deadline ? ` (Deadline: ${item.deadline})` : ""}`
          )
          .join("\n")
      : "- No action items recorded"
  }
  
  Best regards,
  [Your Name]`;
  };

  const copyToClipboard = () => {
    const emailContent = generateEmail();
    navigator.clipboard
      .writeText(emailContent)
      .then(() => alert("Email content copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err));
  };

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Follow-up Email Draft</h2>
      <div className="relative">
        <textarea
          className="w-full h-96 p-2 border rounded font-mono text-sm"
          value={generateEmail()}
          readOnly
        />
        <button
          onClick={copyToClipboard}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
