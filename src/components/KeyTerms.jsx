import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";

const KeyTerms = () => {
  const { noteId } = useParams();
  const [keyTerms, setKeyTerms] = useState([]);

  const fetchKeyTerms = () => {
    const docRef = doc(db, "notes", noteId, "gemini", "keyterms");
    const unsubscribe = onSnapshot(docRef, (doc) => {
      console.log("Current data: ", doc.data());
      setKeyTerms(doc.data().keyTerms);
    });
    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchKeyTerms();
    return () => unsubscribe();
  }, [noteId]);

  return (
    <div>
      {keyTerms.map((keyTerm, index) => {
        const { term, meaning } = keyTerm;
        return (
          <div key={index} className="mb-4">
            <h2 className="text-lg font-semibold">{term}</h2>
            <p>{meaning}</p>
          </div>
        );
      })}
    </div>
  );
};

export default KeyTerms;
