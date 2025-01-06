export default function EmailDraft({ meetingData }) {
  const generateEmail = () => {
    const summary = generateSummary(meetingData);

    return `
        Subject: Meeting Summary - ${new Date().toLocaleDateString()}
  
        Dear team,
  
        Thank you for attending today's meeting. Here's a summary of our discussion:
  
        Duration: ${summary.duration}
        Participants: ${summary.participants.join(", ")}
  
        Key Points Discussed:
        ${summary.keyPoints.map((point) => `- ${point}`).join("\n")}
  
        Decisions Made:
        ${summary.decisions.map((decision) => `- ${decision}`).join("\n")}
  
        Action Items:
        ${summary.actionItems
          .map(
            (item) =>
              `- ${item.text}${
                item.assignee ? ` (Assigned to: @${item.assignee})` : ""
              }${item.deadline ? ` (Deadline: ${item.deadline})` : ""}`
          )
          .join("\n")}
  
        Best regards,
        [Your Name]
      `;
  };

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Follow-up Email Draft</h2>
      <textarea
        className="w-full h-64 p-2 border rounded"
        value={generateEmail()}
        readOnly
      />
      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        Copy to Clipboard
      </button>
    </div>
  );
}
