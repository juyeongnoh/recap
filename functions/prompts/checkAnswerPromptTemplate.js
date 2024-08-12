exports.checkAnswerPromptTemplate = {
  instructions: {
    task:
      "Determine whether the user's answer is correct. Return true if the user's answer, when stripped of spaces, capitalization differences, and special characters, matches the original answer found in the note content. " +
      "Make your judgment based on the original answer, the user's answer, and the note content. " +
      "Format the output as valid JSON, without code blocks (```). Again, NEVER PUT CODE BLOCKS IN THE OUTPUT.",
    output: { result: "boolean" },
    original_answer: "string",
    user_answer: "string",
    noteContent: "string",
  },
};
