import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";

const KeyConcepts = () => {
  const { noteId } = useParams();
  const [keyConcepts, setKeyConcepts] = useState([]);

  const fetchKeyConcepts = () => {
    const docRef = doc(db, "notes", noteId, "gemini", "keyconcepts");
    const unsubscribe = onSnapshot(docRef, (doc) => {
      console.log("Current data: ", doc.data());
      setKeyConcepts(doc.data().keyConcepts);
    });
    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchKeyConcepts();
    return () => unsubscribe();
  }, [noteId]);

  return (
    <div>
      {keyConcepts.map((keyConcept, index) => {
        const { concept, description } = keyConcept;
        const example = keyConcept.example || "";
        return (
          <div key={index} className="mb-4">
            <h2 className="text-lg font-semibold">{concept}</h2>
            <p>{description}</p>
            {example && <p className="text-sm text-gray-500">{example}</p>}
          </div>
        );
      })}
    </div>
  );
};

export default KeyConcepts;
