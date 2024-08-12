const outputSchema = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "key_terms": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "term": { "type": "string" },
          "meaning": { "type": "string" }
        },
        "required": ["term", "meaning"]
      }
    },
    "key_concepts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "concept": { "type": "string" },
          "description": { "type": "string" },
          "example": { "type": "string" }
        },
        "required": ["concept", "description"],
        "additionalProperties": false
      }
    }
  },
  "required": ["key_terms", "key_concepts"],
  "additionalProperties": false
}`;

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
      "If previous_key_data do not exist, generate new output." +
      "Format the output as valid JSON using the outputSchema provided.",
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
  outputSchema: outputSchema,
  previous_key_data: "",
  text: "",
};
