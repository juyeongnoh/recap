import React from "react";

const Badge = ({ questionType }) => {
  const color = {
    key_terms: "bg-blue-500",
    key_concepts: "bg-green-500",
    application: "bg-yellow-500",
    multiple_choice: "bg-indigo-500",
    short_answer: "bg-red-500",
    fill_blank: "bg-purple-500",
  };

  return (
    <span
      className={`px-2 py-1 text-white font-bold text-xs rounded-full select-none ${color[questionType]}`}>
      {questionType
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")}
    </span>
  );
};

export default Badge;
