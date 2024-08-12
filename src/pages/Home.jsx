import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { currentUser } = auth;
    if (currentUser) navigate("/notes");
  }, []);

  return (
    <div className="flex items-center justify-center w-dvw h-dvh bg-sky-100">
      <div className="grid gap-4 p-24 bg-white shadow-md rounded-xl">
        <div className="flex items-center justify-center gap-4 mb-12">
          <img src="/recap.svg" alt="recap logo" width={56} />
          <h1 className="text-4xl font-bold">Recap</h1>
        </div>

        <button
          className="p-2 w-96 bg-slate-200 hover:bg-slate-300 rounded-xl"
          onClick={() => navigate("/login")}>
          Login
        </button>
        <button
          className="p-2 w-96 bg-slate-200 hover:bg-slate-300 rounded-xl"
          onClick={() => navigate("/signup")}>
          Signup
        </button>
      </div>
    </div>
  );
};

export default Home;
