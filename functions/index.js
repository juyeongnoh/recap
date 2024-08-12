const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Firestore } = require("firebase-admin/firestore");

// Import prompt templates
const { quizPromptTemplate } = require("./prompts/quizPromptTemplate");
const {
  checkAnswerPromptTemplate,
} = require("./prompts/checkAnswerPromptTemplate");
const {
  updateKeyTermAndConceptTemplate,
} = require("./prompts/keyTermsAndConceptsPromptTemplate");
const {
  chatbotPromptTemplate,
  titlePromptTemplate,
} = require("./prompts/chatbotPromptTemplate");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const REGION = "asia-northeast3";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const jsonModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

admin.initializeApp();

exports.checkAnswer = functions.region(REGION).https.onCall(async (data) => {
  const input = data.input;
  const noteId = data.noteId;
  const recapId = data.recapId;

  if (!input || !noteId || !recapId) {
    throw new functions.https.HttpsError("invalid-argument", "Bad Request");
  }

  const noteRef = admin.firestore().doc(`/notes/${noteId}`);
  const recapRef = noteRef.collection("recap").doc(recapId);

  const noteSnapshot = await noteRef.get();
  const recapSnapshot = await recapRef.get();

  if (!noteSnapshot.exists || !recapSnapshot.exists) {
    throw new functions.https.HttpsError("not-found", "not found");
  }

  const noteData = noteSnapshot.data();
  const recapData = recapSnapshot.data();

  const noteContent = noteData.content;
  const originalAnswer = recapData.answer;

  const prompt = JSON.stringify({
    ...checkAnswerPromptTemplate,
    original_answer: originalAnswer,
    user_answer: input,
    noteContent: `${noteContent}`,
  });

  try {
    const result = await textModel.generateContent(prompt);
    text = result.response.text();

    const jsonWithoutCodeBlock = text.replace(/^```json|```$/g, "");

    return JSON.parse(jsonWithoutCodeBlock);
  } catch (error) {
    console.error("Error check answer:", error);
    functions.logger.error("Error check answer:", error);
    throw new functions.https.HttpsError("internal", "Error check answer");
  }
});

exports.generateRecap = functions.region(REGION).https.onCall(async (data) => {
  const questionType = data.questionType;
  const noteId = data.noteId;

  if (!questionType || !noteId) {
    throw new functions.https.HttpsError("invalid-argument", "Bad Request");
  }

  const noteRef = admin.firestore().doc(`/notes/${noteId}`);
  const noteSnapshot = await noteRef.get();

  if (!noteSnapshot.exists) {
    throw new functions.https.HttpsError("not-found", "Note not found");
  }

  const noteContent = noteSnapshot.data().content;

  const prompt = JSON.stringify({
    ...quizPromptTemplate,
    noteContent: `${noteContent}`,
    question_type: questionType,
  });

  let text;

  try {
    const result = await jsonModel.generateContent(prompt);
    text = JSON.parse(result.response.text());
  } catch (error) {
    console.error("Error generating recap:", error);
    functions.logger.error("Error generating recap:", error);
    throw new functions.https.HttpsError("internal", "Error generating recap");
  }

  try {
    const recapRef = admin
      .firestore()
      .collection("notes")
      .doc(noteId)
      .collection("recap");

    const newRecapRef = recapRef.doc();
    await newRecapRef.set(
      text?.multiple_choice || text?.short_answer || text?.fill_blank
    );

    return { recapId: newRecapRef.id };
  } catch (error) {
    console.error("Error saving recap:", error);
    functions.logger.error("Error saving recap:", error);
    throw new functions.https.HttpsError("internal", "Error saving recap");
  }
});

// Add Key Terms on Note Creation
exports.setKeyTermsAndConceptsWithEmptyArray = functions
  .region(REGION)
  .firestore.document("/notes/{documentId}")
  .onCreate(async (snapshot) => {
    try {
      await snapshot.ref.collection("gemini").doc("keyterms").set({
        keyTerms: [],
        isGenerating: false,
      });

      await snapshot.ref.collection("gemini").doc("keyconcepts").set({
        keyConcepts: [],
        isGenerating: false,
      });
    } catch (error) {
      console.error("Error generating key terms:", error);
    }
  });

// Update Key Terms on Note Update
exports.updateKeyTerms = functions
  .region(REGION)
  .firestore.document("/notes/{documentId}")
  .onUpdate(async (change, context) => {
    const noteContent = change.after.data().content;
    if (change.before.data().content === noteContent) return;

    let previousKeyData;

    // 이전 노트 가져오기
    const noteDocumentId = context.params.documentId;
    const previousKeyTermsRef = admin
      .firestore()
      .doc(`/notes/${noteDocumentId}/gemini/keyterms`);
    const previousKeyConceptsRef = admin
      .firestore()
      .doc(`/notes/${noteDocumentId}/gemini/keyconcepts`);

    if (!previousKeyTermsRef.exists || !previousKeyConceptsRef.exists) {
      previousKeyData = "";
    } else {
      const previousKeyTermsSnapshot = await previousKeyTermsRef.get();
      const previousKeyConceptsSnapshot = await previousKeyConceptsRef.get();

      const previousKeyTerms = previousKeyTermsSnapshot.data();
      const previousKeyConcepts = previousKeyConceptsSnapshot.data();

      previousKeyData = { previousKeyTerms, previousKeyConcepts };
    }

    const prompt = JSON.stringify({
      ...updateKeyTermAndConceptTemplate,
      text: `${noteContent}`,
      previous_text: `${previousKeyData}`,
    });

    try {
      await change.after.ref.collection("gemini").doc("keyterms").set({
        isGenerating: true,
      });

      await change.after.ref.collection("gemini").doc("keyconcepts").set({
        isGenerating: true,
      });

      const result = await jsonModel.generateContent(prompt);
      const text = result.response.text();

      const { key_terms, key_concepts } = JSON.parse(text);

      if (!key_terms || !key_concepts) {
        await change.after.ref.collection("gemini").doc("keyterms").set({
          isGenerating: false,
        });

        await change.after.ref.collection("gemini").doc("keyconcepts").set({
          isGenerating: false,
        });
        throw new Error("No text returned from API");
      }

      await change.after.ref.collection("gemini").doc("keyterms").set({
        keyTerms: key_terms,
        isGenerating: false,
      });
      await change.after.ref.collection("gemini").doc("keyconcepts").set({
        keyConcepts: key_concepts,
        isGenerating: false,
      });
    } catch (error) {
      await change.after.ref.collection("gemini").doc("keyterms").set({
        isGenerating: false,
      });

      await change.after.ref.collection("gemini").doc("keyconcepts").set({
        isGenerating: false,
      });

      console.error("Error generating key terms:", error);
    }
  });

exports.chatbot = functions
  .region(REGION)
  .firestore.document("/notes/{documentId}/chatbot/{chatRoomId}")
  .onUpdate(async (change, context) => {
    const title = change.after.data().title;
    const messages = change.after.data().messages;
    const lastMessage = messages[messages.length - 1];
    console.log(lastMessage);

    if (lastMessage.sender === "user") {
      // 노트의 내용을 가져와서 챗봇에 전달
      const noteDocumentId = context.params.documentId;
      const noteDocRef = admin.firestore().doc(`/notes/${noteDocumentId}`);
      const noteDocSnapshot = await noteDocRef.get();

      if (!noteDocSnapshot.exists) {
        console.error("Note document does not exist");
        return;
      }

      const noteContent = noteDocSnapshot.data().content;

      // 최근 5개의 메시지만 가져오기
      const recentMessages = messages.slice(-5);
      const messageHistory = recentMessages.map((msg) => ({
        sender: msg.sender,
        message: msg.message,
      }));

      // 프롬프트 생성
      const prompt = JSON.stringify({
        ...chatbotPromptTemplate,
        context: messageHistory,
        note_content: `${noteContent}`,
        current_query: lastMessage.message,
      });

      try {
        await change.after.ref.update({
          isGenerating: true,
        });

        const result = await textModel.generateContent(prompt);
        const text = result.response.text();

        await change.after.ref.update({
          messages: [
            ...messages,
            {
              message: text,
              sender: "bot",
            },
          ],
          modifiedAt: Firestore.FieldValue.serverTimestamp(),
          isGenerating: false,
        });

        // 채팅방의 제목이 없으면 생성
        if (!title) {
          const lastTwoMessages = messages.slice(-2);

          const titlePrompt = JSON.stringify({
            ...titlePromptTemplate,
            lastTwoMessages,
          });

          const titleResult = await textModel.generateContent(titlePrompt);
          const titleText = titleResult.response.text();

          await change.after.ref.update({
            title: titleText,
          });
        }
      } catch (error) {
        await change.after.ref.update({
          isGenerating: false,
        });
        console.error("Error generating chatbot message:", error);
      }
    }
  });

// Add User to Firestore
exports.addUserToFirestore = functions
  .region(REGION)
  .auth.user()
  .onCreate(async (user) => {
    const userRef = admin.firestore().collection("users").doc(user.uid);

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      phoneNumber: user.phoneNumber || null,
      lastVisitedNoteId: "",
    };

    try {
      await userRef.set(userData);
      console.log(`User with UID: ${user.uid} added to Firestore.`);
    } catch (error) {
      console.error("Error adding user to Firestore:", error);
    }
  });
