import { Routes, Route, Navigate } from "react-router";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import { checkAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import Admin from "./Pages/Admin";
import AdminCreate from "./Components/AdminCreate";
import AdminDelete from "./Components/AdminDelete";
import AdminUpdate from "./Components/AdminUpdate";
// import ProblemPage from "./Pages/ProblemPage";
import ProblemEditor from "./Pages/ProblemEditor";
import AdminVideo from "./Components/AdminVideo";
import AdminUpload from "./Components/AdminUpload";

function App() {
  // check isAuthenticated
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  console.log(user);
  // check initial authentication

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

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
        {/* Home Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? <HomePage></HomePage> : <Navigate to="/login" />
          }
        ></Route>

        {/* Login Page Route */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login></Login>}
        ></Route>

        {/* Sign Up Page Route */}
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <SignUp></SignUp>}
        ></Route>
        {/* <Route path="/admin" element={<AdminPanel />}></Route> */}

        {/* Admin Page Route */}
        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <Admin />
            ) : (
              <Navigate to="/" />
            )
          }
        ></Route>

        {/* Admin Dashboard */}

        {/* Create Problem */}
        <Route
          path="/admin/create"
          element={
            isAuthenticated && user?.role == "admin" ? (
              <AdminCreate />
            ) : (
              <Navigate to="/" />
            )
          }
        ></Route>

        {/* Update Problem */}
        <Route
          path="/admin/update"
          element={
            isAuthenticated && user?.role == "admin" ? (
              <AdminUpdate />
            ) : (
              <Navigate to="/" />
            )
          }
        ></Route>

        {/* Delete Problem */}
        <Route
          path="/admin/delete"
          element={
            isAuthenticated && user?.role == "admin" ? (
              <AdminDelete />
            ) : (
              <Navigate to="/" />
            )
          }
        ></Route>

        {/* Video Problem */}
        <Route
          path="/admin/video"
          element={
            isAuthenticated && user?.role == "admin" ? (
              <AdminVideo />
            ) : (
              <Navigate to="/" />
            )
          }
        ></Route>

        {/* Upload Video Page */}
        <Route
          path="/admin/upload/:problemId"
          element={
            isAuthenticated && user?.role == "admin" ? (
              <AdminUpload />
            ) : (
              <Navigate to="/" />
            )
          }
        ></Route>

        {/* <Route path="/problem/:problemId" element={<ProblemPage />}></Route> */}

        {/* Code Editor  */}
        <Route path="/problems/:problemId" element={<ProblemEditor />}></Route>
      </Routes>
    </>
  );
}

export default App;
