import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { FaAngleLeft, FaArrowUp, FaRegTrashAlt } from "react-icons/fa";
import { PulseLoader } from "react-spinners";

const Chatbot = () => {
  const { noteId } = useParams();
  const [chatRoomsList, setChatRoomsList] = useState([]);
  const [documentId, setDocumentId] = useState("");
  const [inputValue, setInputValue] = useState("");

  const [title, setTitle] = useState("");
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const messageRef = useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  function convertTimestampToAmericanDateTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const dateString = date.toLocaleString("en-US");

    return dateString;
  }

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
      isGenerating: false,
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

  const scrollToBottom = () => {
    if (messageRef.current) {
      messageRef.current.scrollTop = messageRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setIsGenerating(doc.data().isGenerating);
    });

    return () => unsubscribe();
  }, [documentId]);

  useEffect(() => {
    setDocumentId("");
  }, [noteId]);

  return (
    <div className="h-full">
      {documentId ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setDocumentId("")}
              className="p-2 mr-2 hover:bg-blue-100 rounded-xl">
              <FaAngleLeft />
            </button>
            <h2 className="text-lg font-semibold">
              {title ? title : "A new chat"}
            </h2>
          </div>

          <div ref={messageRef} className="overflow-scroll grow">
            <div className="p-4 mb-4 text-xs text-center bg-gray-200 rounded-xl">
              💡 The chatbot provides answers based on the content of the note.
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
                        message.sender === "user"
                          ? "bg-gray-100"
                          : "bg-blue-100"
                      }`}>
                      <div className="text-sm font-bold">
                        {message.sender === "user" ? "You" : "Chatbot"}
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start mb-2">
                    <div className="w-3/4 p-2 bg-blue-100 rounded-xl">
                      <p className="text-sm">
                        <div className="text-sm font-bold">Chatbot</div>
                        <div className="py-2">
                          <PulseLoader color="#3b82f6" size={8} />
                        </div>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <form className="flex gap-2">
            <input
              placeholder="Message the chatbot"
              className="w-full p-2 border border-slate-300 rounded-xl"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
            />
            <button
              type="submit"
              className="p-2 hover:bg-blue-100 rounded-xl"
              onClick={(e) => {
                e.preventDefault();
                sendMessage({
                  message: inputValue,
                  sender: "user",
                });
              }}>
              <FaArrowUp />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col h-full gap-2">
          <div>
            <button
              onClick={createChatRoom}
              className="w-full p-4 font-bold text-blue-500 transition-colors duration-300 ease-in-out border border-blue-500 hover:text-white hover:bg-blue-500 rounded-xl">
              + New chat
            </button>
          </div>
          <div className="flex flex-col gap-2 overflow-scroll grow">
            {chatRoomsList.length ? (
              chatRoomsList.map((chatRoom) => (
                <div
                  key={chatRoom.id}
                  className="p-2 rounded-xl hover:bg-blue-100"
                  onClick={() => setDocumentId(chatRoom.id)}>
                  <div className="flex items-center">
                    <h2 className="text-lg font-semibold grow">
                      {chatRoom.title ? chatRoom.title : "A new chat"}
                    </h2>
                    <div
                      className="p-2 hover:bg-slate-100 rounded-xl"
                      onClick={(e) => deleteChatRoom(e, chatRoom.id)}>
                      <FaRegTrashAlt />
                    </div>
                  </div>
                  <small>
                    {convertTimestampToAmericanDateTime(
                      chatRoom.modifiedAt?.seconds
                    )}
                  </small>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  Start a new chat by clicking the button above.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
