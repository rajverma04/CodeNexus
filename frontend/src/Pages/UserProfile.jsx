import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateProfile,
  logoutUser,
  sendOtp,
  verifyEmail,
  changePassword,
} from "../authSlice";
import { useNavigate, Link } from "react-router";
import {
  Mail,
  Calendar,
  Shield,
  Edit2,
  LogOut,
  Save,
  X,
  Camera,
  Lock,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  Activity,
  ArrowLeft
} from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// import ActivityHeatmap from "../Components/ActivityHeatmap";

// Password Validation Schema Helper
const getPasswordSchema = (hasPassword) => {
  return z
    .object({
      oldPassword: hasPassword
        ? z.string().min(1, "Current password is required")
        : z.string().optional(),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          "Password must include uppercase, lowercase, number, and special character"
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
};

function UserProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
  });

  // Verification State
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        age: user.age || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(updateProfile(formData));
    if (updateProfile.fulfilled.match(resultAction)) {
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } else {
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate("/");
    });
  };

  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await dispatch(sendOtp());
      if (sendOtp.fulfilled.match(res)) {
        setShowOtpInput(true);
        toast.success("OTP sent to your email!");
      } else {
        toast.error(res.payload || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Please enter OTP");
    setVerifyLoading(true);
    const res = await dispatch(verifyEmail({ emailId: user.emailId, otp }));
    setVerifyLoading(false);

    if (verifyEmail.fulfilled.match(res)) {
      setShowOtpInput(false);
      toast.success("Email Verified Successfully!");
      setOtp("");
    } else {
      toast.error(res.payload || "Invalid OTP");
    }
  };

  // Change Password State
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const hasPassword = user?.hasPassword;

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: passwordLoading },
    watch,
  } = useForm({
    resolver: zodResolver(getPasswordSchema(hasPassword)),
    mode: "onChange",
  });

  const onPasswordSubmit = async (data) => {
    const res = await dispatch(
      changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })
    );

    if (changePassword.fulfilled.match(res)) {
      toast.success("Password changed successfully");
      setIsPasswordOpen(false);
      resetPasswordForm();
    } else {
      toast.error(res.payload || "Failed to change password");
    }
  };

  // Watch password fields for match check visual
  const newPasswordValue = watch("newPassword");
  const confirmPasswordValue = watch("confirmPassword");
  const passwordsMatch =
    newPasswordValue &&
    confirmPasswordValue &&
    newPasswordValue === confirmPasswordValue;

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-emerald-500"></span>
      </div>
    );
  }

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "Recently";

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden selection:bg-emerald-500/30">
      {/* Background Gradients (Consistent with Admin Pages) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">

        {/* Header with Back Button */}
        <div className="flex items-end justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/problems"
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-zinc-400 mt-1">Manage your personal information and security.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile User Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 overflow-hidden shadow-2xl group">
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />

              {/* Edit Mode Toggle */}
              <div className="absolute top-6 right-6 z-20">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white text-zinc-400 transition-all duration-300"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-400 text-zinc-400 transition-all duration-300"
                    title="Cancel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 z-10 relative">
                {/* Avatar Section */}
                <div className="relative group/avatar">
                  <div className="w-32 h-32 rounded-full p-[3px] bg-gradient-to-br from-emerald-400 to-blue-500 shadow-lg shadow-emerald-500/20">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                      <span className="text-4xl font-bold text-white">
                        {user.firstName?.charAt(0).toUpperCase()}
                      </span>
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-8 h-8 text-white/80" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 w-full text-center sm:text-left">
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                          <label className="text-xs text-zinc-400 font-medium ml-1">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="text-xs text-zinc-400 font-medium ml-1">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="text-xs text-zinc-400 font-medium ml-1">Age</label>
                          <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                        >
                          {loading ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <>
                              <Save className="w-4 h-4" /> Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                          {user.firstName} {user.lastName}
                        </h2>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-zinc-400">
                          <span className="flex items-center gap-1.5 text-sm bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            <Mail className="w-3.5 h-3.5" /> {user.emailId}
                          </span>
                          {user.isEmailVerified ? (
                            <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <button
                              onClick={handleSendOtp}
                              disabled={otpLoading}
                              className="flex items-center gap-1 text-xs bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-lg border border-amber-500/20 font-medium hover:bg-amber-500/20 transition-all cursor-pointer"
                            >
                              {otpLoading ? "Sending..." : <><AlertCircle className="w-3.5 h-3.5" /> Verify Email</>}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* OTP Input */}
                      {showOtpInput && !user.isEmailVerified && (
                        <div className="flex items-center gap-2 animate-fade-in-up mt-2 p-3 bg-white/5 rounded-xl border border-white/10 inline-flex">
                          <input
                            type="text"
                            placeholder="6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white w-32 focus:outline-none focus:border-emerald-500 transition-colors text-center font-mono tracking-widest"
                          />
                          <button
                            onClick={handleVerifyOtp}
                            disabled={verifyLoading}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20"
                          >
                            {verifyLoading ? "..." : "Confirm"}
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start pt-2">
                        <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> {user.role}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Joined {joinedDate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Problems Solved
                </h3>
                <p className="text-3xl font-bold text-white">
                  {user.problemSolved?.length || 0}
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Account Status
                </h3>
                <p className="text-3xl font-bold text-emerald-400">Active</p>
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Security Card */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5"><Lock className="w-5 h-5 text-zinc-200" /></div>
                <h3 className="text-lg font-bold text-white">Security</h3>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed">
                Ensure your account is secure by using a strong password.
              </p>
              <button
                onClick={() => setIsPasswordOpen(true)}
                className="cursor-pointer w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all text-sm font-medium text-left flex justify-between items-center group"
              >
                <span>{hasPassword ? "Change Password" : "Set Password"}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                  →
                </span>
              </button>
            </div>

            {/* Danger Zone */}
            <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
              </h3>
              <button
                onClick={handleLogout}
                className="cursor-pointer w-full py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-600 hover:text-white text-rose-400 transition-all font-bold text-sm flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => {
            setIsPasswordOpen(false);
            resetPasswordForm();
          }} />

          <div className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-md p-8 relative shadow-2xl animate-fade-in-up z-10">
            <button
              onClick={() => {
                setIsPasswordOpen(false);
                resetPasswordForm();
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 text-emerald-400">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {hasPassword ? "Change Password" : "Set Password"}
              </h2>
              <p className="text-zinc-500 text-sm mt-1">Make sure it's strong and secure.</p>
            </div>

            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              {/* Old Password */}
              {hasPassword && (
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium ml-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      {...registerPassword("oldPassword")}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.oldPassword && (
                    <p className="text-rose-400 text-xs ml-1">{passwordErrors.oldPassword.message}</p>
                  )}
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium ml-1">
                  {hasPassword ? "New Password" : "Password"}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    {...registerPassword("newPassword")}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-rose-400 text-xs ml-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-zinc-400 font-medium ml-1">
                    Confirm Password
                  </label>
                  {passwordsMatch && (
                    <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" /> Match
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...registerPassword("confirmPassword")}
                    className={`w-full bg-black/40 border rounded-xl px-4 py-2.5 text-white focus:outline-none transition-all pr-10 ${passwordsMatch
                      ? "border-emerald-500/50 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                      : "border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-rose-400 text-xs ml-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg shadow-emerald-500/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {passwordLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {hasPassword ? "Update Password" : "Set Password"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
