import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginCredentials({
      ...loginCredentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createUserWithEmailAndPassword(
        auth,
        loginCredentials.email,
        loginCredentials.password
      );

      navigate("/notes");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center w-dvw h-dvh bg-sky-100">
      <div className="grid gap-4 p-24 bg-white shadow-md rounded-xl">
        <h1 className="text-xl font-bold text-center">Signup</h1>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label>Email</label>
            <input
              className="p-2 border w-96 border-slate-400 rounded-xl"
              type="email"
              name="email"
              value={loginCredentials.email}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label>Password</label>
            <input
              className="p-2 border w-96 border-slate-400 rounded-xl"
              type="password"
              name="password"
              value={loginCredentials.password}
              onChange={handleChange}
            />
          </div>

          <button
            className="p-2 w-96 bg-slate-200 hover:bg-slate-300 rounded-xl"
            type="submit">
            Signup
          </button>
        </form>

        {error && <div className="text-red-500">{error}</div>}

        <button
          className="p-2 w-96 bg-slate-200 hover:bg-slate-300 rounded-xl"
          onClick={() => navigate("/")}>
          Home
        </button>
      </div>
    </div>
  );
};

export default Signup;
