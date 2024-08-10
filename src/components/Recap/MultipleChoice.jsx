import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, functions } from "../../firebase";
import { httpsCallable } from "firebase/functions";

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
    const generateRecap = httpsCallable(functions, "generateRecap");
    const recapId = await generateRecap({
      noteId,
      questionType: recapData.question_type,
    });

    console.log(recapData.question_type);
    setIsGenerating(false);
    setSelectedChoice("");
    setStatus("NOT_ANSWERED_YET");
    navigate(`/recap/${noteId}/${recapId.data.recapId}`);
  };

  useEffect(() => {
    console.log("status", status);
    updateRecap();
  }, [status]);

  useEffect(() => {
    if (!selectedChoice) return;
    checkAnswer();
  }, [selectedChoice]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="mb-4 text-2xl font-semibold">Multiple Choice</h1>
        {status !== "CORRECT" && (
          <button
            className="px-4 py-2 mt-4 text-white bg-blue-500 rounded disabled:bg-gray-500"
            onClick={generateRecap}
            disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Skip"}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div>Q. {recapData?.question}</div>
        {status === "INCORRECT" && <small>hint: {recapData?.hint}</small>}

        <div className="flex gap-4">
          {recapData?.choices.map((choice, index) => (
            <div
              key={index}
              onClick={() => {
                if (status === "CORRECT") return;
                handleChoiceClick(choice);
              }}
              className={`box-border p-4 border rounded w-44 ${
                selectedChoice === choice &&
                status === "INCORRECT" &&
                "border-red-500"
              } ${
                selectedChoice === choice &&
                status === "CORRECT" &&
                "border-green-500"
              }`}>
              {choice}
            </div>
          ))}
        </div>
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

export default MultipleChoice;
