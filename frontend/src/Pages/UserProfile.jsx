import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, logoutUser, sendOtp, verifyEmail, changePassword } from "../authSlice";
import { useNavigate } from "react-router";
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
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Password Validation Schema Helper
const getPasswordSchema = (hasPassword) => {
  return z.object({
    oldPassword: hasPassword ? z.string().min(1, "Current password is required") : z.string().optional(),
    newPassword: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must include uppercase, lowercase, number, and special character"),
    confirmPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
};

/**
 * UserProfile Component
 * Displays user information in a premium glassmorphic card.
 * Allows users to update their profile and logout.
 */
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
    const res = await dispatch(sendOtp());
    setOtpLoading(false);

    if (sendOtp.fulfilled.match(res)) {
      setShowOtpInput(true);
      toast.success("OTP sent to your email!");
    } else {
      toast.error(res.payload || "Failed to send OTP");
    }
  }

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
  }

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
    watch
  } = useForm({
    resolver: zodResolver(getPasswordSchema(hasPassword)),
    mode: "onChange"
  });

  const onPasswordSubmit = async (data) => {
    const res = await dispatch(changePassword({ oldPassword: data.oldPassword, newPassword: data.newPassword }));

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
  const passwordsMatch = newPasswordValue && confirmPasswordValue && newPasswordValue === confirmPasswordValue;

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Format date
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
    : "Recently";

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
              My Profile
            </h1>
            <p className="text-white/50 text-lg">Manage your account settings and preferences.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile User Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="group relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 overflow-hidden transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 hover:shadow-2xl hover:shadow-emerald-500/10">
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              {/* Edit Mode Toggle */}
              <div className="absolute top-6 right-6">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all duration-300 group/btn"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-5 h-5 text-white/70 group-hover/btn:text-white" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
                    title="Cancel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {/* Avatar Section */}
                <div className="relative group/avatar">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 p-[3px] shadow-lg shadow-emerald-500/20">
                    <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative">
                      <span className="text-4xl font-bold text-white">
                        {user.firstName?.charAt(0).toUpperCase()}
                      </span>
                      {/* Hover Overlay for Picture (Simulated) */}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-8 h-8 text-white/80" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 w-full text-center sm:text-left">
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-emerald-400 uppercase font-semibold tracking-wider">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-emerald-400 uppercase font-semibold tracking-wider">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-emerald-400 uppercase font-semibold tracking-wider">Age</label>
                          <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all shadow-lg shadow-emerald-500/20"
                        >
                          {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-white tracking-tight">
                        {user.firstName} {user.lastName}
                      </h2>
                      <div className="flex flex-col items-center sm:items-start gap-2">
                        <p className="text-white/60 text-lg flex items-center justify-center sm:justify-start gap-2">
                          <Mail className="w-4 h-4" /> {user.emailId}
                          {user.isEmailVerified ? (
                            <span className="text-emerald-500 flex items-center gap-1 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <button
                              onClick={handleSendOtp}
                              disabled={otpLoading}
                              className="text-amber-500 flex items-center gap-1 text-xs bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
                            >
                              {otpLoading ? (
                                "Sending..."
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3" /> Verify Now
                                </>
                              )}
                            </button>
                          )}
                        </p>

                        {/* OTP Input */}
                        {showOtpInput && !user.isEmailVerified && (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <input
                              type="text"
                              placeholder="Enter 6-digit OTP"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white w-40 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                            <button
                              onClick={handleVerifyOtp}
                              disabled={verifyLoading}
                              className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                              {verifyLoading ? "..." : "Confirm"}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-1.5">
                          <Shield className="w-3 h-3" /> {user.role.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" /> Joined {joinedDate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Row (e.g. Problems Solved) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <h3 className="text-white/40 text-sm font-medium uppercase tracking-wider mb-1">Problems Solved</h3>
                <p className="text-3xl font-bold text-white">{user.problemSolved?.length || 0}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <h3 className="text-white/40 text-sm font-medium uppercase tracking-wider mb-1">Account Status</h3>
                <p className="text-3xl font-bold text-emerald-400">Active</p>
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Security Card */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" /> Security
              </h3>
              <p className="text-white/50 text-sm">
                Ensure your account is secure by using a strong password.
              </p>
              <button
                onClick={() => setIsPasswordOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all text-sm font-medium text-left flex justify-between items-center group"
              >
                {hasPassword ? "Change Password" : "Set Password"}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
            </div>

            {/* Danger Zone */}
            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 transition-all font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl shadow-emerald-500/10 animate-in zoom-in-95">
            <button
              onClick={() => {
                setIsPasswordOpen(false);
                resetPasswordForm();
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">
              {hasPassword ? "Change Password" : "Set Password"}
            </h2>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              {/* Old Password - Only show if user has password */}
              {hasPassword && (
                <div className="space-y-2">
                  <label className="text-xs text-emerald-400 uppercase font-semibold tracking-wider">Current Password</label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      {...registerPassword("oldPassword")}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.oldPassword && <p className="text-red-500 text-xs">{passwordErrors.oldPassword.message}</p>}
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-xs text-emerald-400 uppercase font-semibold tracking-wider">
                  {hasPassword ? "New Password" : "Password"}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    {...registerPassword("newPassword")}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && <p className="text-red-500 text-xs">{passwordErrors.newPassword.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-xs text-emerald-400 uppercase font-semibold tracking-wider flex justify-between">
                  Confirm {hasPassword ? "New" : ""} Password
                  {passwordsMatch && <span className="text-emerald-500 flex items-center gap-1 normal-case"><CheckCircle className="w-3 h-3" /> Matched</span>}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...registerPassword("confirmPassword")}
                    className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors pr-10 ${passwordsMatch ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-white/10 focus:border-emerald-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && <p className="text-red-500 text-xs">{passwordErrors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all shadow-lg shadow-emerald-500/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? (hasPassword ? "Updating..." : "Setting Password...") : (hasPassword ? "Update Password" : "Set Password")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
