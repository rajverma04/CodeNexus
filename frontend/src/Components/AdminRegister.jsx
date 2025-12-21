import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, UserPlus, Mail, User, Lock, ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { createAdmin } from "../authSlice";

// schema validation
const adminSignup = z.object({
  firstName: z.string().min(3, "Name should contain at least 3 characters"),
  emailId: z.string().email("Invalid Email"),
  password: z
    .string()
    .min(8, "Password should be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

function AdminRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state) => state.auth);

  // Only admin allowed
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
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden flex items-center justify-center selection:bg-emerald-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-xl px-6 py-3 text-white shadow-xl animate-fade-in-up flex items-center gap-3 border border-white/10 bg-emerald-600/90 backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{toast}</span>
        </div>
      )}

      <div className="w-full max-w-md relative z-10 space-y-8">

        <div className="flex items-center mb-4">
          <Link
            to="/admin"
            className="mr-4 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <h1 className="text-xl font-bold text-zinc-200">Back to Dashboard</h1>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          {/* Decorative top border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">Create New Admin</h2>
            <p className="text-zinc-500 text-sm mt-2">Grant administrative access to a new user</p>
          </div>

          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 ml-1">Full Name</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-emerald-400 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  {...register("firstName")}
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                  placeholder="Admin Name"
                />
              </div>
              {errors.firstName && (
                <p className="text-rose-400 text-xs flex items-center gap-1 ml-1">
                  <AlertTriangle className="w-3 h-3" /> {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 ml-1">Email Address</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-emerald-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  {...register("emailId")}
                  type="email"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                  placeholder="admin@example.com"
                />
              </div>
              {errors.emailId && (
                <p className="text-rose-400 text-xs flex items-center gap-1 ml-1">
                  <AlertTriangle className="w-3 h-3" /> {errors.emailId.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 ml-1">Password</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-emerald-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-400 text-xs flex items-center gap-1 ml-1">
                  <AlertTriangle className="w-3 h-3" /> {errors.password.message}
                </p>
              )}
            </div>

            {/* API Error */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm text-white"></span>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Admin Account
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
