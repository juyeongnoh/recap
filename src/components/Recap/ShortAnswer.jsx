import { httpsCallable } from "firebase/functions";
import React, { useEffect, useState } from "react";
import { db, functions } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { FaPlay, FaStepForward } from "react-icons/fa";
import toast from "react-hot-toast";

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

    try {
      setIsChecking(true);
      const response = await checkAnswer({
        input,
        noteId,
        recapId,
      });
      setIsChecking(false);
      return response.data.result;
    } catch (e) {
      console.log(e);
      setIsChecking(false);
      toast.error("Failed to check answer. Please try again.", {
        id: "failed-to-check-answer",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isCorrect = await checkAnswer(input);

    if (isCorrect) {
      setStatus("CORRECT");
    } else {
      setStatus("INCORRECT");
    }
  };

  const generateRecap = async () => {
    setIsGenerating(true);

    try {
      const generateRecap = httpsCallable(functions, "generateRecap");
      const recapId = await generateRecap({
        noteId,
        questionType: recapData.question_type,
      });

      setIsGenerating(false);
      setInput("");
      setStatus("NOT_ANSWERED_YET");
      navigate(`/recap/${noteId}/${recapId.data.recapId}`);
    } catch (e) {
      console.log(e);
      setIsGenerating(false);
      toast.error("Failed to generate question. Please try again.", {
        id: "failed-to-generate-question",
      });
    }
  };

  useEffect(() => {
    if (!input) return;
    updateRecap();
  }, [status]);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center justify-between mt-2">
        <h2 className="text-2xl font-semibold">Short Answer</h2>
        {status !== "CORRECT" && (
          <button
            className="flex items-center justify-center w-32 h-10 font-bold text-white bg-blue-500 hover:bg-blue-400 rounded-xl disabled:bg-gray-500"
            onClick={generateRecap}
            disabled={isGenerating}>
            {isGenerating ? (
              <PulseLoader color="#ffffff" size={12} />
            ) : (
              <div className="flex items-center gap-2">
                <div>Skip</div>
                <FaStepForward />
              </div>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-12">
        <div>
          <div className="mb-4 text-2xl">Q. {recapData?.question}</div>
          {status === "INCORRECT" && (
            <p>
              <span className="p-1 text-white bg-gray-500 rounded-md">
                HINT
              </span>{" "}
              {recapData?.hint}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            className={`w-full p-2 border transition-colors duration-300 ease-in-out rounded-xl ${
              status === "INCORRECT" && "border-red-500"
            } ${status === "CORRECT" && "border-green-500"}`}
            onChange={handleInputChange}
            value={input}
            disabled={status === "CORRECT"}
          />
          <button
            type="submit"
            className="w-32 h-10 font-bold text-white bg-blue-500 hover:bg-blue-400 rounded-xl disabled:bg-gray-500 shrink-0"
            disabled={!input || status === "CORRECT" || isChecking}>
            {isChecking ? <PulseLoader color="#ffffff" size={12} /> : "Submit"}
          </button>
        </form>

        {status === "CORRECT" && (
          <button
            className="flex items-center justify-center w-full h-12 font-bold text-white bg-blue-500 hover:bg-blue-400 rounded-xl disabled:bg-gray-500"
            onClick={generateRecap}
            disabled={isGenerating}>
            {isGenerating ? (
              <PulseLoader color="#ffffff" size={12} />
            ) : (
              <div className="flex items-center gap-2">
                <div>Next</div>
                <FaPlay />
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ShortAnswer;
