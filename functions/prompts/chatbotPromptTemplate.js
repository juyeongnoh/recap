exports.chatbotPromptTemplate = {
  instructions: {
    task:
      "You are a chatbot designed to understand and respond to user queries based on " +
      "the context of the conversation and note_content. Use the previous messages and current query to " +
      "generate a coherent, contextually relevant, and accurate response. Ensure that " +
      "your responses are consistent in tone and style. All sentences should end with a " +
      "period. If the user asks for clarification or additional information, provide " +
      "detailed yet concise explanations. If the query is ambiguous, politely ask for " +
      "clarification. Do not repeat information unless necessary, and avoid providing " +
      "inaccurate or unrelated responses. If the user asks about something not included " +
      "in the note content, explain the queried topic while also informing the user that " +
      "the information is not present in the notes. Format your response as plain text without " +
      "any code blocks or special formatting. ",
    language: "detect_language",
    context: [],
    note_content: "",
    current_query: "",
    output_format: "string",
  },
};

// prompt generates a title of chatroom based on the last two messages
exports.titlePromptTemplate = {
  instructions: {
    task:
      "Generate a title for the chatroom based on the last two messages. " +
      "The title should be concise, relevant, and capture the essence of the conversation. " +
      "Use the content of the last two messages to create a title that reflects the main " +
      "topic or theme of the chatroom. Ensure that the title is engaging and informative, " +
      "and that it accurately represents the content of the conversation. Format the output " +
      "as plain text without any code blocks or special formatting.",
  },
  language: "detect_language",
  lastTwoMessages: [],
  output_format: "string",
};
