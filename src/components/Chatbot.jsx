import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { FaRegTrashAlt } from "react-icons/fa";

const Chatbot = () => {
  const { noteId } = useParams();
  const [chatRoomsList, setChatRoomsList] = useState([]);
  const [documentId, setDocumentId] = useState("");
  const [inputValue, setInputValue] = useState("");

  const [title, setTitle] = useState("");
  const [messages, setMessages] = useState([]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const fetchChatRoomsList = () => {
    const collectionRef = collection(db, "notes", noteId, "chatbot");
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      setChatRoomsList(
        snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        })
      );
    });
    return unsubscribe;
  };

  const createChatRoom = async () => {
    const collectionRef = collection(db, "notes", noteId, "chatbot");

    const docRef = await addDoc(collectionRef, {
      title: "",
      messages: [],
      createdAt: serverTimestamp(),
      modifiedAt: serverTimestamp(),
    });

    setDocumentId(docRef.id);
  };

  const deleteChatRoom = async (e, id) => {
    e.stopPropagation();

    if (!window.confirm("Delete chat room?")) return;

    const docRef = doc(db, "notes", noteId, "chatbot", id);

    try {
      await deleteDoc(docRef);
    } catch (e) {
      console.log(e);
    }
  };

  const sendMessage = async (message) => {
    const docRef = doc(db, "notes", noteId, "chatbot", documentId);

    try {
      await updateDoc(docRef, {
        messages: [...messages, message],
      });

      setInputValue("");
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const unsubscribe = fetchChatRoomsList();
    return () => unsubscribe();
  }, [noteId]);

  useEffect(() => {
    if (!documentId) return;

    const docRef = doc(db, "notes", noteId, "chatbot", documentId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      setTitle(doc.data().title);
      setMessages(doc.data().messages);
    });

    return () => unsubscribe();
  }, [documentId]);

  useEffect(() => {
    setDocumentId("");
  }, [noteId]);

  return (
    <div>
      <h1>Chatbot</h1>
      {documentId ? (
        <>
          <button
            onClick={() => setDocumentId("")}
            className="bg-slate-200 hover:bg-slate-100">
            {"<-"}
          </button>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="p-4 mb-4 text-xs bg-gray-200 rounded-xl">
              💡 챗봇이 노트의 내용을 바탕으로 답변합니다.
            </div>
            <div className="grid gap-2">
              <div>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    } mb-2`}>
                    <div
                      className={`p-2 rounded-xl w-3/4 ${
                        message.sender === "user" ? "bg-gray-100" : "bg-sky-100"
                      }`}>
                      <small>{message.sender}</small>
                      <p>{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <input
            placeholder="text..."
            type="text"
            value={inputValue}
            onChange={handleInputChange}
          />
          <button
            onClick={() =>
              sendMessage({
                message: inputValue,
                sender: "user",
              })
            }>
            send
          </button>
        </>
      ) : (
        <>
          <button
            onClick={createChatRoom}
            className="bg-slate-200 hover:bg-slate-100">
            new chat
          </button>
          <div>
            {chatRoomsList.map((chatRoom) => (
              <div
                key={chatRoom.id}
                className="mb-4 hover:bg-slate-100"
                onClick={() => setDocumentId(chatRoom.id)}>
                <div
                  className="p-2 hover:bg-slate-200 rounded-xl"
                  onClick={(e) => deleteChatRoom(e, chatRoom.id)}>
                  <FaRegTrashAlt />
                </div>
                <h2 className="text-lg font-semibold">
                  {chatRoom.title ? chatRoom.title : "a new chat"}
                </h2>
                <p>{chatRoom.modifiedAt?.seconds}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
