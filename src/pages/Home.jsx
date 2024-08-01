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
      <div>Home</div>
      <button onClick={() => navigate("/login")}>Login</button>
      <button onClick={() => navigate("/signup")}>Signup</button>
    </div>
  );
};

export default Home;
