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
    <div className="w-screen h-screen">
      <div className="grid gap-4 p-12 mx-auto w-96">
        <h1 className="text-xl font-bold">Signup</h1>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label>Email</label>
            <input
              className="p-2 border border-slate-400 rounded-xl"
              type="email"
              name="email"
              value={loginCredentials.email}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label>Password</label>
            <input
              className="p-2 border border-slate-400 rounded-xl"
              type="password"
              name="password"
              value={loginCredentials.password}
              onChange={handleChange}
            />
          </div>

          <button className="p-2 bg-slate-200 hover:bg-slate-300" type="submit">
            Signup
          </button>
        </form>

        {error && <div className="text-red-500">{error}</div>}

        <button
          className="p-2 bg-slate-200 hover:bg-slate-300"
          onClick={() => navigate("/")}>
          Home
        </button>
        <button
          className="p-2 bg-slate-200 hover:bg-slate-300"
          onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Signup;
