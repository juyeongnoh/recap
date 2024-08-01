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
    <div>
      <div className="grid gap-4 p-12 mx-auto w-96">
        <h1 className="text-xl font-bold">Home</h1>

        <button
          className="p-2 bg-slate-200 hover:bg-slate-300"
          onClick={() => navigate("/login")}>
          Login
        </button>
        <button
          className="p-2 bg-slate-200 hover:bg-slate-300"
          onClick={() => navigate("/signup")}>
          Signup
        </button>
      </div>
    </div>
  );
};

export default Home;
