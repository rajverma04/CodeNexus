import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import { checkAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import Admin from "./Pages/Admin";
import AdminCreate from "./Components/AdminCreateProblem";
import AdminDelete from "./Components/AdminDelete";
import AdminUpdate from "./Components/AdminUpdate";
import AdminUpdateForm from "./Components/AdminUpdateForm";
// import ProblemPage from "./Pages/ProblemPage";
import ProblemEditor from "./Pages/ProblemEditor";
import AdminVideo from "./Components/AdminVideo";
import AdminUpload from "./Components/AdminUpload";
import AdminRegister from "./Components/AdminRegister";
import ManageUsers from "./Components/ManageUsers";
import UserProfile from "./Pages/UserProfile";

function App() {
  // check isAuthenticated
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // console.log(user);
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
      <Toaster position="top-center" reverseOrder={false} />
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

        {/* Update Problem List */}
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

        {/* Update Problem Form */}
        <Route
          path="/admin/update/:id"
          element={
            isAuthenticated && user?.role == "admin" ? (
              <AdminUpdateForm />
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

        {/* Create new Admin */}
        <Route
          path="/admin/register"
          element={
            isAuthenticated && user?.role == "admin" ? (
              <AdminRegister />
            ) : (
              <Navigate to="/" />
            )
          }
        ></Route>

        {/* Manage Users */}
        <Route
          path="/admin/manageUsers"
          element={
            isAuthenticated && user?.role == "admin" ? (
              <ManageUsers />
            ) : (
              <Navigate to="/" />
            )
          }
        ></Route>

        {/* Profile */}
        <Route
          path="/profile"
          element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />}
        ></Route>

        {/* <Route path="/problem/:problemId" element={<ProblemPage />}></Route> */}

        {/* Code Editor  */}
        <Route path="/problems/:problemId" element={<ProblemEditor />}></Route>
      </Routes>
    </>
  );
}

export default App;
