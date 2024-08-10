import React, { useEffect, useState } from "react";
import { auth, db, functions } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { FiPlusSquare } from "react-icons/fi";
import {
  FaAngleLeft,
  FaCheck,
  FaPowerOff,
  FaRegFileWord,
  FaRegTrashAlt,
  FaSearch,
} from "react-icons/fa";
import { httpsCallable } from "firebase/functions";
import FillBlank from "../components/Recap/FillBlank";
import ShortAnswer from "../components/Recap/ShortAnswer";
import MultipleChoice from "../components/Recap/MultipleChoice";
import { PulseLoader } from "react-spinners";
import Badge from "../components/Badge";
import toast from "react-hot-toast";

const Recap = () => {
  const navigate = useNavigate();

  const [noteList, setNoteList] = useState([]);
  const [documentTitle, setDocumentTitle] = useState("");
  const [recapList, setRecapList] = useState([]);
  const [recapData, setRecapData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isShowQuestionTypeSelect, setIsShowQuestionTypeSelect] =
    useState(false);

  const { currentUser } = auth;
  const { noteId, recapId } = useParams();

  const fetchNotesList = () => {
    setIsLoadingList(true);

    const q = query(
      collection(db, "notes"),
      where("uid", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notesList = querySnapshot.docs.map((doc) => [doc.id, doc.data()]);
      setNoteList(notesList);
      setIsLoadingList(false);
    });

    return unsubscribe;
  };

  const createNote = async () => {
    const collectionRef = collection(db, "notes");
    const docRef = await addDoc(collectionRef, {
      uid: currentUser.uid,
      title: "",
      content: "",
      createdAt: serverTimestamp(),
      modifiedAt: serverTimestamp(),
    });
    navigate(`/notes/${docRef.id}`);
  };

  const deleteNote = async (e, id) => {
    e.stopPropagation();
    const prompt = window.confirm("Are you sure you want to delete this?");
    if (!prompt) return;

    try {
      let docRef = doc(db, "notes", id);
      await deleteDoc(docRef);

      if (noteId === id) {
        const docRef = doc(db, "users", currentUser.uid);
        await updateDoc(docRef, {
          lastVisitedNoteId: "",
        });
        navigate("/recap");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleNotesListItemClick = async (id) => {
    if (noteId === id) return;

    try {
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, {
        lastVisitedNoteId: id,
      });
      navigate(`/recap/${id}`);
      setIsShowQuestionTypeSelect(false);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchLastVisitedNote = async () => {
    try {
      const docRef = doc(db, "users", currentUser.uid);
      const docSnapshot = await getDoc(docRef);
      const { lastVisitedNoteId } = docSnapshot.data();

      if (lastVisitedNoteId) navigate(`/recap/${lastVisitedNoteId}`);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchNote = async () => {
    setIsLoading(true);
    try {
      if (!noteId) return;
      const docRef = doc(db, "notes", noteId);
      const docSnapshot = await getDoc(docRef);
      const noteData = docSnapshot.data();
      console.log(noteData);
      setDocumentTitle(noteData.title);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchRecapList = () => {
    const collectionRef = collection(db, "notes", noteId, "recap");
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const recapData = snapshot.docs.map((doc) => {
        return { id: doc.id, data: doc.data() };
      });
      setRecapList(recapData);
    });

    return unsubscribe;
  };

  const generateRecap = async (questionType) => {
    setIsGenerating(true);

    try {
      const generateRecap = httpsCallable(functions, "generateRecap");
      const recapId = await generateRecap({ noteId, questionType });

      setIsGenerating(false);
      navigate(`/recap/${noteId}/${recapId.data.recapId}`);
    } catch (e) {
      console.log(e);

      setIsGenerating(false);
      toast.error("Failed to generate question. Please try again.", {
        id: "failed-to-generate-question",
      });
      navigate(`/recap/${noteId}`);
    }
  };

  const fetchRecap = async () => {
    const docRef = doc(db, "notes", noteId, "recap", recapId);
    const docSnapshot = await getDoc(docRef);
    const recapData = docSnapshot.data();

    setRecapData(recapData);
  };

  const deleteRecap = async (recapId) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    const docRef = doc(db, "notes", noteId, "recap", recapId);
    await deleteDoc(docRef);
    navigate(`/recap/${noteId}`);
  };

  useEffect(() => {
    fetchLastVisitedNote();
    const unsubscribe = fetchNotesList();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchNote();
    if (!noteId) return;

    const unsubscribe = fetchRecapList();
    return () => unsubscribe();
  }, [noteId]);

  useEffect(() => {
    if (!recapId) return;
    fetchRecap();
  }, [recapId]);

  return (
    <div className="flex gap-4 h-dvh">
      <aside className="flex flex-col gap-4 p-2 border-r border-r-slate-200 w-72 shrink-0">
        <div className="flex items-center">
          <div className="flex gap-1 text-2xl font-bold text-center border border-blue-500 rounded-xl grow">
            <div
              className="w-full py-2 text-blue-500 transition-colors duration-300 ease-in-out hover:bg-blue-100 rounded-xl"
              onClick={() => navigate("/notes")}>
              Notes
            </div>
            <div className="w-full py-2 text-white bg-blue-500 rounded-xl">
              Recap
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 overflow-scroll grow">
          {isLoadingList ? (
            <div className="relative w-full h-full">
              <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <PulseLoader color="#3b82f6" />
              </div>
            </div>
          ) : noteList.length ? (
            noteList.map((note) => {
              const [id, data] = note;
              return (
                <div
                  key={id}
                  className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-100 rounded-xl ${
                    id === noteId && "bg-blue-300 font-bold"
                  }`}
                  onClick={() => handleNotesListItemClick(id)}>
                  <div className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                    {data.title ? data.title : "New note"}
                  </div>
                  <div
                    className="p-2 hover:bg-slate-100 rounded-xl"
                    onClick={(e) => deleteNote(e, id)}>
                    <FaRegTrashAlt />
                  </div>
                </div>
              );
            })
          ) : (
            <div>Start writing!</div>
          )}
        </div>

        <div
          className="p-4 hover:bg-blue-100 rounded-xl"
          onClick={async () => {
            const confirm = window.confirm("Are you sure you want to log out?");
            if (!confirm) return;

            try {
              await auth.signOut();
              navigate("/");
            } catch (error) {
              console.error("Error signing out: ", error);
            }
          }}>
          <div className="flex items-center gap-2">
            <FaPowerOff />
            <div>Logout</div>
          </div>
          <div className="text-sm font-bold">{auth.currentUser.email}</div>
        </div>
      </aside>

      <main className="relative h-dvh grow">
        <div className="h-full max-w-screen-xl mx-auto">
          {recapId ? (
            <>
              {recapData?.question_format === "multiple_choice" && (
                <MultipleChoice recapData={recapData} />
              )}

              {recapData?.question_format === "short_answer" && (
                <ShortAnswer recapData={recapData} />
              )}

              {recapData?.question_format === "fill_blank" && (
                <FillBlank recapData={recapData} />
              )}
            </>
          ) : (
            <div className="h-full">
              {isShowQuestionTypeSelect ? (
                <div className="relative h-full">
                  <button
                    onClick={() => setIsShowQuestionTypeSelect(false)}
                    className="absolute p-2 text-2xl top-4 hover:bg-blue-100 rounded-xl">
                    <FaAngleLeft />
                  </button>
                  <div className="absolute flex flex-col gap-24 pb-32 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                    <div className="text-4xl font-light text-center whitespace-nowrap">
                      What type of questions would you like to create?
                    </div>
                    <div className="relative h-72">
                      {isGenerating ? (
                        <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                          <PulseLoader color="#3b82f6" />
                        </div>
                      ) : (
                        <div className="flex gap-8">
                          <button
                            className="p-4 text-left transition-colors duration-300 ease-in-out bg-blue-100 h-72 w-72 rounded-2xl hover:bg-blue-500 hover:text-white"
                            onClick={() => generateRecap("key_terms")}>
                            <FaRegFileWord className="mb-8 text-6xl" />
                            <div className="text-3xl font-bold">Key Terms</div>
                            <p className="mt-2 text-sm">
                              Focus on defining and recalling important terms
                              from the document.
                            </p>
                          </button>
                          <button
                            className="p-4 text-left transition-colors duration-300 ease-in-out bg-blue-100 h-72 w-72 rounded-2xl hover:bg-blue-500 hover:text-white"
                            onClick={() => generateRecap("key_concepts")}>
                            <FaSearch className="mb-8 text-6xl" />
                            <div className="text-3xl font-bold">
                              Key Concepts
                            </div>
                            <p className="mt-2 text-sm">
                              Test your understanding of the main ideas and
                              principles discussed.
                            </p>
                          </button>
                          <button
                            className="p-4 text-left transition-colors duration-300 ease-in-out bg-blue-100 h-72 w-72 rounded-2xl hover:bg-blue-500 hover:text-white"
                            onClick={() => generateRecap("application")}>
                            <FaCheck className="mb-8 text-6xl" />
                            <div className="text-3xl font-bold">
                              Application
                            </div>
                            <p className="mt-2 text-sm">
                              Apply the knowledge to solve problems or answer
                              scenario-based questions.
                            </p>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mt-2">
                    <h2 className="text-2xl font-bold grow">{documentTitle}</h2>
                    <button
                      onClick={() => setIsShowQuestionTypeSelect(true)}
                      className="px-4 py-2 font-bold text-white bg-blue-500 hover:bg-blue-400 rounded-xl">
                      + Start recap
                    </button>
                  </div>
                  <div className="mt-4 overflow-scroll grow">
                    {recapList.length ? (
                      recapList.map((recap, index) => {
                        return (
                          <div
                            key={recap.id}
                            className="p-4 mb-4 hover:bg-blue-100 rounded-xl ">
                            <div className="flex justify-between">
                              <div className="flex items-center gap-2">
                                <Badge
                                  questionType={recap.data.question_type}
                                />
                                <Badge
                                  questionType={recap.data.question_format}
                                />
                              </div>
                              <div
                                className="p-2 hover:bg-slate-100 rounded-xl"
                                onClick={() => deleteRecap(recap.id)}>
                                <FaRegTrashAlt />
                              </div>
                            </div>
                            <h2 className="text-lg font-semibold">
                              Q. {recap.data.question}
                            </h2>
                            <p>
                              A.{" "}
                              {Array.isArray(recap.data.answer)
                                ? recap.data.answer.join(", ")
                                : recap.data.answer}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <div>Start recap! 문제를 생성해서 복습해보세요</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Recap;
