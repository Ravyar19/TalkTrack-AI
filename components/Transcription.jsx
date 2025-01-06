import { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const Transcription = ({ isRecording, onTranscriptionUpdate }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (isRecording && !listening && browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({ continuous: true });
    } else if (!isRecording && listening) {
      SpeechRecognition.stopListening();
    }
  }, [isRecording, listening, browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (transcript) {
      onTranscriptionUpdate((prev) => ({
        ...prev,
        transcription: transcript,
        actionItems: [
          ...prev.actionItems,
          ...extractActionItemsFromText(transcript),
        ],
      }));
    }
  }, [transcript, onTranscriptionUpdate]);

  if (!browserSupportsSpeechRecognition) {
    return <div>Browser doesn't support speech recognition.</div>;
  }

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Real-time Transcription</h2>
      <div className="h-64 overflow-y-auto">{transcript}</div>
    </div>
  );
};

export default Transcription;
