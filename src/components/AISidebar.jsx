import React, { useEffect, useState } from "react";

const AISidebar = () => {
  const [currentTab, setCurrentTab] = useState("Terms");

  useEffect(() => {
    console.log("AISidebar mounted");

    return () => console.log("AISidebar unmounted");
  }, []);

  return (
    <aside className="w-64 p-4">
      <div className="flex justify-between">
        <button
          className="p-2 text-sm rounded-lg bg-slate-300 hover:bg-slate-200"
          value="Terms"
          onClick={(e) => setCurrentTab(e.target.value)}>
          Terms
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
    </aside>
  );
};

export default AISidebar;
