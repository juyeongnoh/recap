import { httpsCallable } from "firebase/functions";
import React, { useEffect, useState } from "react";
import { db, functions } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

// short_answer: {
//   question_type: "string",
//   question_format: "short_answer",
//   question: "string",
//   answer: "string",
//   hint: "string",
//   status: "DEFAULT",
// },

const ShortAnswer = ({ recapData }) => {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(recapData?.status);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const { noteId, recapId } = useParams();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const updateRecap = async () => {
    const docRef = doc(db, "notes", noteId, "recap", recapId);
    await updateDoc(docRef, {
      status,
    });
  };

  // AI가 생성한 답안과 사용자가 입력한 답안을 비교하는 함수
  const checkAnswer = async (input) => {
    const checkAnswer = httpsCallable(functions, "checkAnswer");
    const response = await checkAnswer({
      input,
      noteId,
      recapId,
    });
    return response.data.result;
  };

  const handleSubmit = async () => {
    setIsChecking(true);
    const isCorrect = await checkAnswer(input);
    setIsChecking(false);

    if (isCorrect) {
      setStatus("CORRECT");
    } else {
      setStatus("INCORRECT");
    }
  };

  const generateRecap = async () => {
    setIsGenerating(true);
    const generateRecap = httpsCallable(functions, "generateRecap");
    const recapId = await generateRecap({
      noteId,
      questionType: recapData.question_type,
    });

    console.log(recapData.question_type);

    setIsGenerating(false);
    setInput("");
    setStatus("NOT_ANSWERED_YET");
    navigate(`/recap/${noteId}/${recapId.data.recapId}`);
  };

  useEffect(() => {
    console.log("status", status);
    updateRecap();
  }, [status]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="mb-4 text-2xl font-semibold">Short Answer</h1>
        {status !== "CORRECT" && (
          <button
            className="px-4 py-2 mt-4 text-white bg-blue-500 rounded disabled:bg-gray-500"
            onClick={generateRecap}
            disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Skip"}
          </button>
        )}
      </div>

      <div>Q. {recapData?.question}</div>
      {status === "INCORRECT" && <small>hint: {recapData?.hint}</small>}

      <div className="flex gap-4">
        <input
          type="text"
          className={`w-full p-2 border ${
            status === "INCORRECT" && "border-red-500"
          } ${status === "CORRECT" && "border-green-500"}`}
          onChange={handleInputChange}
          value={input}
          disabled={status === "CORRECT"}
        />
        <button
          className="px-4 py-2 text-white bg-blue-500 rounded disabled:bg-gray-500"
          disabled={!input || status === "CORRECT" || isChecking}
          onClick={handleSubmit}>
          {isChecking ? "Checking..." : "Submit"}
        </button>
        {status === "CORRECT" && (
          <button
            className="px-4 py-2 mt-4 text-white bg-blue-500 rounded disabled:bg-gray-500"
            onClick={generateRecap}
            disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Next"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ShortAnswer;
