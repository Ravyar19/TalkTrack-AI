export default function Summary({ meetingData }) {
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
      keyPoints: meetingData?.keyPoints || [], // Use AI-provided keyPoints
      decisions: meetingData?.decisions || [], // Use AI-provided decisions
      actionItems: meetingData?.actionItems || [],
      summary: meetingData?.summary || "", // Add this line to use AI-provided summary
    };
  };

  const summary = generateSummary();

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Meeting Summary</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Duration:</h3>
          <p>{summary.duration}</p>
        </div>

        <div>
          <h3 className="font-semibold">Participants:</h3>
          <p>{summary.participants.join(", ") || "No participants recorded"}</p>
        </div>

        <div>
          <h3 className="font-semibold">Key Points:</h3>
          {summary.keyPoints.length > 0 ? (
            <ul className="list-disc pl-4">
              {summary.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No key points extracted</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Decisions:</h3>
          {summary.decisions.length > 0 ? (
            <ul className="list-disc pl-4">
              {summary.decisions.map((decision, index) => (
                <li key={index}>{decision}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No decisions recorded</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Action Items:</h3>
          {summary.actionItems.length > 0 ? (
            <ul className="list-disc pl-4">
              {summary.actionItems.map((item, index) => (
                <li key={index}>
                  {item.text}
                  {item.assignee && (
                    <span className="text-blue-500"> @{item.assignee}</span>
                  )}
                  {item.deadline && (
                    <span className="text-gray-500"> ({item.deadline})</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No action items recorded</p>
          )}
        </div>
      </div>
    </div>
  );
}
