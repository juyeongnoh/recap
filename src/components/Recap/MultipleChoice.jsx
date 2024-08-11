import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, functions } from "../../firebase";
import { httpsCallable } from "firebase/functions";
import { FaAngleLeft, FaPlay, FaStepForward } from "react-icons/fa";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";

// multiple_choice: {
//   question_type: "string",
//   question_format: "multiple_choice",
//   question: "string",
//   choices: ["string", "string", "string", "string"],
//   answer: "string",
//   hint: "string",
//   status: "DEFAULT",
// },

const MultipleChoice = ({ recapData }) => {
  const [selectedChoice, setSelectedChoice] = useState("");
  const [status, setStatus] = useState(recapData?.status);
  const [isGenerating, setIsGenerating] = useState(false);

  const { noteId, recapId } = useParams();
  const navigate = useNavigate();

  const handleChoiceClick = (choice) => {
    setSelectedChoice(choice);
  };

  const updateRecap = async () => {
    const docRef = doc(db, "notes", noteId, "recap", recapId);
    await updateDoc(docRef, {
      status,
    });
  };

  const checkAnswer = () => {
    if (selectedChoice === recapData?.answer) {
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
      setSelectedChoice("");
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
    updateRecap();
  }, [status]);

  useEffect(() => {
    if (!selectedChoice) return;
    checkAnswer();
  }, [selectedChoice]);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={() => navigate(`/recap/${noteId}`)}
          className="p-2 text-2xl top-4 hover:bg-blue-100 rounded-xl">
          <FaAngleLeft />
        </button>
        <h2 className="text-2xl font-semibold">Multiple Choice</h2>
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

        <div className="flex gap-4">
          {recapData?.choices.map((choice, index) => (
            <div
              key={index}
              onClick={() => {
                if (status === "CORRECT") return;
                handleChoiceClick(choice);
              }}
              className={`box-border p-4 border rounded-xl w-full transition-colors hover:bg-blue-500 hover:text-white duration-300 ease-in-out ${
                selectedChoice === choice &&
                status === "INCORRECT" &&
                "bg-red-500 text-white"
              } ${
                selectedChoice === choice &&
                status === "CORRECT" &&
                "bg-green-500 text-white"
              }`}>
              {choice}
            </div>
          ))}
        </div>

        {status === "CORRECT" && (
          <p>
            <span className="p-1 text-white bg-gray-500 rounded-md">
              ANSWER
            </span>{" "}
            {recapData?.answer}
          </p>
        )}

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

export default MultipleChoice;
