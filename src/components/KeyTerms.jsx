import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { PulseLoader } from "react-spinners";
import { FaRegCopy } from "react-icons/fa";
import toast from "react-hot-toast";

const KeyTerms = () => {
  const { noteId } = useParams();
  const [keyTerms, setKeyTerms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchKeyTerms = () => {
    setIsLoading(true);

    const docRef = doc(db, "notes", noteId, "gemini", "keyterms");
    const unsubscribe = onSnapshot(docRef, (doc) => {
      setKeyTerms(doc.data().keyTerms);
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
    const unsubscribe = fetchKeyTerms();
    return () => unsubscribe();
  }, [noteId]);

  useEffect(() => {
    console.log("keyTerms", keyTerms);
  }, [keyTerms]);

  return isLoading ? (
    <div className="relative h-full">
      <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <PulseLoader color="#3b82f6" />
      </div>
    </div>
  ) : (
    <div className="relative flex flex-col h-full gap-4">
      {isGenerating && (
        <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-white">
          <PulseLoader color="#3b82f6" />
        </div>
      )}
      {keyTerms?.length ? (
        keyTerms.map((keyTerm, index) => {
          const { term, meaning } = keyTerm;
          return (
            <div key={index} className="p-2 rounded-xl hover:bg-blue-100">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold grow">{term}</h2>
                <div
                  className="p-2 hover:bg-slate-100 rounded-xl"
                  onClick={() => copyToClipboard(`${term}: ${meaning}`)}>
                  <FaRegCopy />
                </div>
              </div>
              <p>{meaning}</p>
            </div>
          );
        })
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            If you write content in the notes, the key terms will be updated.
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyTerms;
