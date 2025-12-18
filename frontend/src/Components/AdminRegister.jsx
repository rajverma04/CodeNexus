import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";
import { createAdmin } from "../authSlice"; // ✅ admin thunk

// schema validation
const adminSignup = z.object({
  firstName: z.string().min(3, "Name should contain atleast 3 characters"),
  emailId: z.string().email("Invalid Email"),
  password: z
    .string()
    .min(8, "Password should be atleast 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

function AdminRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null); // toast state
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state) => state.auth);

  // 🔐 Only admin allowed
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(adminSignup) });

  const onSubmit = async (data) => {
    try {
      await dispatch(createAdmin(data)).unwrap();

      setToast("Admin created successfully!");

      setTimeout(() => {
        setToast(null);
        navigate("/admin");
      }, 2000);
    } catch (err) {
      console.error("Create admin failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-sm">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-5 right-5 z-[9999] rounded-md bg-emerald-600 px-4 py-2 text-white shadow-lg">
            {toast}
          </div>
        )}

        <div className="card bg-base-100 shadow-2xl">
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="card-body space-y-4"
          >
            <h1 className="text-3xl font-bold text-center">Create New Admin</h1>

            {/* Name */}
            <div className="form-control">
              <label className="label">Name</label>
              <input
                {...register("firstName")}
                className="input input-bordered"
                placeholder="Admin name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">Email</label>
              <input
                {...register("emailId")}
                className="input input-bordered"
                placeholder="admin@email.com"
              />
              {errors.emailId && (
                <p className="text-red-500 text-xs">{errors.emailId.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-center text-sm">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-neutral w-full"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
