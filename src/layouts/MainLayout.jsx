import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { PulseLoader } from "react-spinners";

const MainLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { currentUser } = auth;
    if (!currentUser) navigate("/");
    setLoading(false);
  }, []);

  return loading ? (
    <div className="relative w-dvw h-dvh">
      <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <PulseLoader color="#3b82f6" />
      </div>
    </div>
  ) : (
    <Outlet />
  );
};

export default MainLayout;
