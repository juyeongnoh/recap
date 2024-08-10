import React, { useEffect, useState } from "react";
import KeyTerms from "./KeyTerms";
import Chatbot from "./Chatbot";
import KeyConcepts from "./KeyConcepts";
import { FaRegFileWord, FaRobot, FaSearch } from "react-icons/fa";

const AISidebar = () => {
  const [currentTab, setCurrentTab] = useState("Key Terms");

  useEffect(() => {
    console.log("Current tab is", currentTab);
  }, [currentTab]);

  return (
    <aside className="flex flex-col border-l w-72 border-l-slate-200 shrink-0">
      <div className="flex justify-between border-b border-b-slate-200">
        <button
          className={`w-full p-2 hover:bg-blue-100 ${
            currentTab === "Key Terms" && "bg-blue-300"
          }`}
          onClick={() => setCurrentTab("Key Terms")}>
          <div className="flex flex-col items-center gap-2">
            <FaRegFileWord className="text-2xl" />
            <div className="text-xs">Key Terms</div>
          </div>
        </button>

        <button
          className={`w-full p-2 hover:bg-blue-100 ${
            currentTab === "Key Concepts" && "bg-blue-300"
          }`}
          onClick={() => setCurrentTab("Key Concepts")}>
          <div className="flex flex-col items-center gap-2">
            <FaSearch className="text-2xl" />
            <div className="text-xs">Key Concepts</div>
          </div>
        </button>

        <button
          className={`w-full p-2 hover:bg-blue-100 ${
            currentTab === "Chatbot" && "bg-blue-300"
          }`}
          onClick={() => setCurrentTab("Chatbot")}>
          <div className="flex flex-col items-center gap-2">
            <FaRobot className="text-2xl" />
            <div className="text-xs">Chatbot</div>
          </div>
        </button>
      </div>

      <div className="p-2 overflow-scroll grow">
        {currentTab === "Key Terms" && <KeyTerms />}
        {currentTab === "Key Concepts" && <KeyConcepts />}
        {currentTab === "Chatbot" && <Chatbot />}
      </div>
    </aside>
  );
};

export default AISidebar;
