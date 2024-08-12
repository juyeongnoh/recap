const outputSchema = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "multiple_choice": {
      "type": "object",
      "properties": {
        "question_type": { "type": "string" },
        "question_format": { "type": "string", "enum": ["multiple_choice"] },
        "question": { "type": "string" },
        "choices": {
          "type": "array",
          "items": { "type": "string" },
          "minItems": 4,
          "maxItems": 4
        },
        "answer": { "type": "string" },
        "hint": { "type": "string" },
        "status": { "type": "string", "enum": ["NOT_ANSWERED_YET"] }
      },
      "required": [
        "question_type",
        "question_format",
        "question",
        "choices",
        "answer",
        "hint",
        "status"
      ]
    },
    "short_answer": {
      "type": "object",
      "properties": {
        "question_type": { "type": "string" },
        "question_format": { "type": "string", "enum": ["short_answer"] },
        "question": { "type": "string" },
        "answer": { "type": "string" },
        "hint": { "type": "string" },
        "status": { "type": "string", "enum": ["NOT_ANSWERED_YET"] }
      },
      "required": [
        "question_type",
        "question_format",
        "question",
        "answer",
        "hint",
        "status"
      ]
    },
    "fill_blank": {
      "type": "object",
      "properties": {
        "question_type": { "type": "string" },
        "question_format": { "type": "string", "enum": ["fill_blank"] },
        "question": { "type": "string" },
        "answer": { "type": "string" },
        "hint": { "type": "string" },
        "status": { "type": "string", "enum": ["NOT_ANSWERED_YET"] }
      },
      "required": [
        "question_type",
        "question_format",
        "question",
        "answer",
        "hint",
        "status"
      ]
    }
  },
  "oneOf": [
    { "$ref": "#/properties/multiple_choice" },
    { "$ref": "#/properties/short_answer" },
    { "$ref": "#/properties/fill_blank" }
  ]
}`;

exports.quizPromptTemplate = {
  instructions: {
    task:
      "You will be given a question_type which will be one of key_terms, key_concepts, or application. " +
      "Based on the given question_type, randomly determine one question_format from multiple_choice, " +
      "short_answer, or fill_blank, with a slightly higher probability for selecting multiple_choice.” " +
      "Generate one question based on the selected question_format. Once the question_format is determined, " +
      "provide the output in the correct format: multiple_choice for multiple_choice, short_answer for " +
      "short_answer, or fill_blank for fill_blank. The output must be in JSON format. Since the quiz is for " +
      "important exam preparation, exclude trivial information and focus on creating questions based on the " +
      "key content of the notes. Each output should also include a hint. However, make sure that the hint " +
      "doesn’t make the question too easy to solve. The hint should help the user after thoughtful consideration. " +
      "For multiple_choice and fill_blank questions, if the answer’s language differs from the output_language, " +
      "include in the hint which language the answer should be in. The status of the question must be set to " +
      "'NOT_ANSWERED_YET'. Return only the JSON object using outputSchema corresponding to the selected question_format.",
    if_question_type_key_terms:
      "Generate questions based on the key terms present in the noteContent.",
    if_question_type_key_concepts:
      "Create questions that assess how well the user understands the main concepts from the noteContent.",
    if_question_type_application:
      "Generate questions that apply the content from the noteContent to real-life situations " +
      "or practical scenarios. The question should require the user to apply the concept beyond just understanding it.",
    if_question_format_multiple_choice:
      "The choices must be 4 options. Other than the correct answer, you can use related terms even " +
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
  outputSchema: outputSchema,
  noteContent: "",
  question_type: "",
};
