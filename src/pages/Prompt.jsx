import React, { useState } from "react";
import { model } from "../firebase";

const Prompt = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const generateResponse = async (prompt) => {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    setResponse(text);
  };

  const handleChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateResponse(prompt);
  };

  return <div>Prompt</div>;
};

export default Prompt;
