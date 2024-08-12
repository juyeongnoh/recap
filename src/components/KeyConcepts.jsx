import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { FaRegCopy } from "react-icons/fa";
import { PulseLoader } from "react-spinners";

const KeyConcepts = () => {
  const { noteId } = useParams();
  const [keyConcepts, setKeyConcepts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchKeyConcepts = () => {
    setIsLoading(true);

    const docRef = doc(db, "notes", noteId, "gemini", "keyconcepts");
    const unsubscribe = onSnapshot(docRef, (doc) => {
      setKeyConcepts(doc.data().keyConcepts);
      setIsGenerating(doc.data().isGenerating);
      setIsLoading(false);
    });

    return unsubscribe;
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", {
      id: "copied-to-clipboard",
    });
  };

  useEffect(() => {
    const unsubscribe = fetchKeyConcepts();
    return () => unsubscribe();
  }, [noteId]);

  return isLoading ? (
    <div className="relative h-full">
      <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <PulseLoader color="#3b82f6" />
      </div>
    </div>
  ) : (
    <div className="relative flex flex-col h-full gap-4 ">
      {isGenerating && (
        <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-white">
          <PulseLoader color="#3b82f6" />
        </div>
      )}
      {keyConcepts?.length ? (
        keyConcepts.map((keyConcept, index) => {
          const { concept, description } = keyConcept;
          const example = keyConcept.example || "";
          return (
            <div key={index} className="p-2 rounded-xl hover:bg-blue-100">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold grow">{concept}</h2>
                <div
                  className="p-2 hover:bg-slate-100 rounded-xl"
                  onClick={() => copyToClipboard(`${concept}: ${description}`)}>
                  <FaRegCopy />
                </div>
              </div>
              <p>{description}</p>
              {example && (
                <div>
                  <span className="px-1 text-sm text-white bg-gray-500 rounded-sm">
                    ex
                  </span>{" "}
                  <span className="text-sm text-gray-500">{example}</span>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            If you write content in the notes, the key contents will be updated.
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyConcepts;
