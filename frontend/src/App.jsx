import { Routes, Route, Navigate } from "react-router";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import { checkAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import AdminPanel from "./Pages/AdminPanel";

function App() {
  // check isAuthenticated
  const { isAuthenticated, user, loading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  console.log(user);
  // check initial authentication
  
  // useEffect(() => {
  //   dispatch(checkAuth());
  // }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <HomePage></HomePage> : <Navigate to="/signup" />
          }
        ></Route>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login></Login>}
        ></Route>
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <SignUp></SignUp>}
        ></Route>
        {/* <Route path="/admin" element={<AdminPanel />}></Route> */}
        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === "admin" ? 
              <AdminPanel />
             : 
              <Navigate to="/" />
          }
        ></Route>
      </Routes>
    </>
  );
}

export default App;
