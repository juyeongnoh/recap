exports.promptTemplate = {
  instructions: {
    task:
      "Extract meaningful key terms and key concepts from the following text. " +
      "For key terms, provide their exact meanings directly as stated in the text. " +
      "If the text does not provide a clear definition or meaning for a term, do not " +
      "include it in the output. Ensure that the extracted terms are exactly as they " +
      "appear in the text, without any modifications. Quote the content from the " +
      "document, but if the text is awkward or unnaturally written, rephrase it to " +
      "be more natural. Ensure that 'term' and 'meaning' are not identical. Avoid " +
      "duplicate terms or concepts. All sentences should be written in a consistent " +
      "tone and should end with a period (.). After extracting key terms, identify key " +
      "concepts in the document. Key concepts should provide a broader understanding " +
      "or theme from the text. Ensure that key concepts do not overlap with the key " +
      "terms. For each key concept, quote the relevant content from the document and, " +
      "if possible, provide an example to illustrate the concept. Format the output as " +
      "valid JSON, without code blocks (```). Again, NEVER PUT CODE BLOCKS IN THE OUTPUT.",
    language: "detect_language",
    output_format: "json",
    json_structure: {
      key_terms: [
        {
          term: "string",
          meaning: "string",
        },
      ],
      key_concepts: [
        {
          concept: "string",
          description: "string",
          example: "string (optional)",
        },
      ],
    },
  },
  text: "",
};

exports.updateKeyTermAndConceptTemplate = {
  instructions: {
    task:
      "Extract meaningful key terms and key concepts from the following text." +
      "For key terms, provide their exact meanings directly as stated in the text." +
      "If the text does not provide a clear definition or meaning for a term, do not include it in the output." +
      "Ensure that the extracted terms are exactly as they appear in the text, without any modifications." +
      "Quote the content from the document, but if the text is awkward or unnaturally written, rephrase it to be more natural." +
      "Ensure that 'term' and 'meaning' are not identical. Avoid duplicate terms or concepts." +
      "All sentences should be written in a consistent tone and should end with a period (.)." +
      "After extracting key terms, identify key concepts in the document." +
      "Key concepts should provide a broader understanding or theme from the text." +
      "Ensure that key concepts do not overlap with the key terms." +
      "For each key concept, quote the relevant content from the document and, if possible, provide an example to illustrate the concept." +
      "If the updated text contains new information (concepts, terms) that is not present in the previous key data, return the newly extracted key terms and key concepts." +
      "However, if the updated text is similar to the previous key data with no significant differences, return the previous key data instead." +
      "If previous key terms or key concepts do not exist, generate new output." +
      "Format the output as valid JSON. Make sure that an ‘Unexpected token’ error never occurs when parsing JSON in JavaScript.",
    language: "detect_language",
    output_format: "json",
    json_structure: {
      key_terms: [
        {
          term: "string",
          meaning: "string",
        },
      ],
      key_concepts: [
        {
          concept: "string",
          description: "string",
          example: "string (optional)",
        },
      ],
    },
  },
  previous_key_data: "",
  text: "",
};

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

exports.quizPromptTemplate = {
  instructions: {
    task: "You will be given a question_type which will be one of key_terms, key_concepts, or application. Based on the given question_type, randomly determine one question_format from multiple_choice, short_answer, or fill_blank, ensuring that the probability of each format being selected is equal. Generate one question based on the selected question_format. Once the question_format is determined, provide the output in the correct format: multiple_choice for multiple_choice, short_answer for short_answer, or fill_blank for fill_blank. The output must be in JSON format. Since the quiz is for important exam preparation, exclude trivial information and focus on creating questions based on the key content of the notes. Each output should also include a hint. However, make sure that the hint doesn’t make the question too easy to solve. The hint should help the user after thoughtful consideration. For multiple_choice and fill_blank questions, if the answer’s language differs from the output_language, include in the hint which language the answer should be in. The status of the question MUST be set to ‘NOT_ANSWERED_YET.’ Return only the JSON object corresponding to the selected question_format. Format the output as valid JSON, without code blocks (```). Again, NEVER PUT CODE BLOCKS IN THE OUTPUT",
    if_question_type_key_terms:
      "Generate questions based on the key terms present in the noteContent.",
    if_question_type_key_concepts:
      "Create questions that assess how well the user understands the main concepts from the noteContent.",
    if_question_type_application:
      "Generate questions that apply the content from the noteContent to real-life situations " +
      "or practical scenarios. The question should require the user to apply the concept beyond just understanding it.",
    if_question_format_multiple_choice:
      "The choices should be 4 options. Other than the correct answer, you can use related terms even " +
      "if they are not in the noteContent.",
    if_question_format_short_answer:
      "To increase the chances of a correct answer, use words directly from the noteContent. " +
      "The answer should be a single word or a short phrase, not a sentence. The question should be designed so that the user " +
      "can answer it without needing to provide additional information or explanations.",
    if_question_format_fill_blank:
      "In the question, consider ____ (four underscores) as the blank space to fill. " +
      "The answer should consist of only 1 item, and the number of blanks (____) should be exactly 1 as well. " +
      "Ensure that the question is designed so that the user only needs to fill in the blank and is not asked to provide explanations or additional information. " +
      "The blank should be placed in the middle of the sentence, ensuring the focus is on completing the sentence with the correct term that fits the blank space.",
    output_language: "detect_language",
  },
  output: {
    multiple_choice: {
      question_type: "string",
      question_format: "multiple_choice",
      question: "string",
      choices: ["string", "string", "string", "string"],
      answer: "string",
      hint: "string",
      status: "NOT_ANSWERED_YET",
    },
    short_answer: {
      question_type: "string",
      question_format: "short_answer",
      question: "string",
      answer: "string",
      hint: "string",
      status: "NOT_ANSWERED_YET",
    },
    fill_blank: {
      question_type: "string",
      question_format: "fill_blank",
      question: "string",
      answer: "string",
      hint: "string",
      status: "NOT_ANSWERED_YET",
    },
  },
  noteContent: "",
  question_type: "",
};

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
