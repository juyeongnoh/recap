import React, { useEffect, useState } from "react";
import KeyTerms from "./KeyTerms";
import Chatbot from "./Chatbot";
import KeyConcepts from "./KeyConcepts";

const AISidebar = () => {
  const [currentTab, setCurrentTab] = useState("Key Terms");

  useEffect(() => {
    console.log("AISidebar mounted");

    return () => console.log("AISidebar unmounted");
  }, []);

  return (
    <aside className="p-4 w-72">
      <div className="flex justify-between">
        <button
          className="p-2 text-sm rounded-lg bg-slate-300 hover:bg-slate-200"
          value="Key Terms"
          onClick={(e) => setCurrentTab(e.target.value)}>
          Key Terms
        </button>
        <button
          className="p-2 text-sm rounded-lg bg-slate-300 hover:bg-slate-200"
          value="Key Concepts"
          onClick={(e) => setCurrentTab(e.target.value)}>
          Key Concepts
        </button>
        <button
          className="p-2 text-sm rounded-lg bg-slate-300 hover:bg-slate-200"
          value="Chatbot"
          onClick={(e) => setCurrentTab(e.target.value)}>
          Chatbot
        </button>
      </div>
      {currentTab === "Key Terms" && <KeyTerms />}
      {currentTab === "Key Concepts" && <KeyConcepts />}
      {currentTab === "Chatbot" && <Chatbot />}
    </aside>
  );
};

export default AISidebar;
