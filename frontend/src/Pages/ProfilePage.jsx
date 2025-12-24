import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import axiosClient from "../utils/axiosClient";
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Code,
  Target,
  TrendingUp,
  Shield,
  LogOut,
  Edit2,
  X,
  Check,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Camera,
  Save,
  CheckCircle2,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import { changePassword, logoutUser, sendOtp, verifyEmail, updateProfile } from "../authSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ActivityHeatmap from "../Components/ActivityHeatmap";

const passwordSchema = (hasPassword) =>
  z
    .object({
      oldPassword: hasPassword
        ? z.string().min(1, "Current password required")
        : z.string().optional(),
      newPassword: z
        .string()
        .min(8, "Min 8 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          "Include uppercase, lowercase, number, special char"
        ),
      confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

function ProfilePage() {
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);

  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    username: "",
    bio: "",
  });
  const [usernameSuggestion, setUsernameSuggestion] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Email verification
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: regPassword,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    watch,
    formState: { errors: passErrors, isSubmitting: passLoading },
  } = useForm({
    resolver: zodResolver(passwordSchema(authUser?.hasPassword)),
    mode: "onChange",
  });

  // Load profile
  useEffect(() => {
    loadProfile();
  }, [paramUsername, authUser]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // If paramUsername exists, load public profile; else load own
      const endpoint = paramUsername
        ? `/profile/${paramUsername}`
        : `/profile/${authUser?.username}`;

      const res = await axiosClient.get(endpoint);
      if (res.data?.success) {
        setProfile(res.data.profile);
        setIsOwnProfile(!paramUsername || paramUsername === authUser?.username);

        if (!paramUsername || paramUsername === authUser?.username) {
          setEditForm({
            firstName: authUser?.firstName || "",
            lastName: authUser?.lastName || "",
            age: authUser?.age || "",
            username: authUser?.username || "",
            bio: authUser?.bio || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      if (err.response?.status === 404) {
        toast.error("User not found");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async (value) => {
    if (!value || value.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    try {
      const res = await axiosClient.get(`/profile/check-username?username=${value}`);
      setUsernameAvailable(res.data?.available);
    } catch (err) {
      console.error("Check failed:", err);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().trim();
    setEditForm({ ...editForm, username: value });
    checkUsernameAvailability(value);
  };

  const handleSaveProfile = async () => {
    try {
      if (!editForm.username || editForm.username.length < 3) {
        toast.error("Username must be at least 3 characters");
        return;
      }
      if (!usernameAvailable && editForm.username !== authUser?.username) {
        toast.error("Username already taken");
        return;
      }

      // Save first/last name and age via updateProfile
      if (
        editForm.firstName !== authUser?.firstName ||
        editForm.lastName !== authUser?.lastName ||
        editForm.age !== authUser?.age
      ) {
        const resultAction = await dispatch(
          updateProfile({
            firstName: editForm.firstName,
            lastName: editForm.lastName,
            age: editForm.age,
          })
        );
        if (!updateProfile.fulfilled.match(resultAction)) {
          throw new Error("Failed to update basic profile");
        }
      }

      // Save username
      if (editForm.username !== authUser?.username) {
        const res = await axiosClient.post(`/profile/username`, {
          username: editForm.username,
        });
        if (!res.data?.success) throw new Error("Failed to update username");
      }

      // Save bio
      if (editForm.bio !== authUser?.bio) {
        const res = await axiosClient.post(`/profile/bio`, {
          bio: editForm.bio,
        });
        if (!res.data?.success) throw new Error("Failed to update bio");
      }

      toast.success("Profile updated!");
      setIsEditing(false);
      loadProfile();
    } catch (err) {
      toast.error(err.message || "Failed to save profile");
    }
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
    const res = await dispatch(verifyEmail({ emailId: authUser?.emailId, otp }));
    setVerifyLoading(false);

    if (verifyEmail.fulfilled.match(res)) {
      setShowOtpInput(false);
      toast.success("Email Verified Successfully!");
      setOtp("");
    } else {
      toast.error(res.payload || "Invalid OTP");
    }
  };

  const onPasswordSubmit = async (data) => {
    const res = await dispatch(
      changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })
    );

    if (changePassword.fulfilled.match(res)) {
      toast.success("Password changed!");
      setShowPasswordModal(false);
      resetPass();
    } else {
      toast.error(res.payload || "Failed to change password");
    }
  };

  const newPasswordValue = watch("newPassword");
  const confirmPasswordValue = watch("confirmPassword");
  const passwordsMatch =
    newPasswordValue &&
    confirmPasswordValue &&
    newPasswordValue === confirmPasswordValue;

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => navigate("/"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Profile not found</p>
          <Link
            to="/problems"
            className="text-emerald-500 hover:underline"
          >
            Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  const {
    user: profileUser,
    stats,
  } = profile;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/problems"
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold">
              {isOwnProfile ? "My Profile" : `${profileUser.username}'s Profile`}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 p-1 flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      <User className="w-12 h-12 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{profileUser.firstName || "User"} {profileUser.lastName || ""}</h2>
                    <p className="text-zinc-400">@{profileUser.username}</p>
                    {profileUser.bio && (
                      <p className="text-sm text-zinc-300 mt-2">{profileUser.bio}</p>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-400"
                  >
                    {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                  </button>
                )}
              </div>

              {/* Edit Mode */}
              {isOwnProfile && isEditing && (
                <div className="space-y-4 border-t border-white/10 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-zinc-400 block mb-2">First Name</label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-emerald-500/50 outline-none"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400 block mb-2">Last Name</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-emerald-500/50 outline-none"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 block mb-2">Age</label>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-emerald-500/50 outline-none"
                      placeholder="Age"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 block mb-2">Username</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={handleUsernameChange}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-emerald-500/50 outline-none"
                        placeholder="username"
                      />
                      {checkingUsername && <span className="text-xs text-zinc-400">Checking...</span>}
                      {usernameAvailable === true && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Available
                        </span>
                      )}
                      {usernameAvailable === false && editForm.username !== authUser?.username && (
                        <span className="text-xs text-rose-400">Taken</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 block mb-2">Bio (280 chars max)</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          bio: e.target.value.slice(0, 280),
                        })
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-emerald-500/50 outline-none resize-none h-20"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      {editForm.bio.length}/280
                    </p>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2 font-semibold flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" /> Save Changes
                  </button>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Joined {new Date(profileUser.joinedAt).toLocaleDateString()}
                  </span>
                </div>
                {stats?.globalRank && (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-semibold">Rank #{stats.globalRank}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Solved",
                  value: stats?.solvedCount || 0,
                  icon: Code,
                  color: "emerald",
                },
                {
                  label: "Submissions",
                  value: stats?.totalSubmissions || 0,
                  icon: Target,
                  color: "blue",
                },
                {
                  label: "Accepted",
                  value: stats?.acceptedSubmissions || 0,
                  icon: TrendingUp,
                  color: "green",
                },
                {
                  label: "Success Rate",
                  value: `${stats?.successRate || 0}%`,
                  icon: Trophy,
                  color: "yellow",
                },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400 mb-2`} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-zinc-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Difficulty Breakdown */}
            {stats?.difficultyCounts && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-emerald-400" />
                  Difficulty Breakdown
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "Easy", count: stats.difficultyCounts.easy, color: "emerald" },
                    { name: "Medium", count: stats.difficultyCounts.medium, color: "yellow" },
                    { name: "Hard", count: stats.difficultyCounts.hard, color: "rose" },
                  ].map((d, i) => (
                    <div key={i} className="text-center">
                      <p className={`text-2xl font-bold text-${d.color}-400`}>{d.count}</p>
                      <p className="text-sm text-zinc-400">{d.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions (Own Profile Only) */}
            {isOwnProfile && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center gap-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 px-4 py-3 text-blue-400 font-medium transition"
                >
                  <Lock className="w-5 h-5" />
                  Change Password
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 px-4 py-3 text-rose-400 font-medium transition"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            )}

            {/* Quick Info */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
              <h3 className="font-semibold text-lg">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-zinc-500 mb-1">Email</p>
                  <p className="text-white break-all">{profileUser.id}</p>
                </div>
                {stats?.globalRank && (
                  <div>
                    <p className="text-zinc-500 mb-1">Global Rank</p>
                    <p className="text-emerald-400 font-semibold">#{stats.globalRank} of {stats.totalUsersRanked}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Heatmap Section */}
        <div className="bg-gradient-to-br from-white/5 to-white/[2%] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold">Coding Activity</h2>
          </div>
          <ActivityHeatmap />
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Change Password</h3>
            <form onSubmit={handlePassSubmit(onPasswordSubmit)} className="space-y-4">
              {authUser?.hasPassword && (
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      {...regPassword("oldPassword")}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500/50 outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passErrors.oldPassword && (
                    <p className="text-xs text-rose-400 mt-1">{passErrors.oldPassword.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm text-zinc-400 block mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    {...regPassword("newPassword")}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500/50 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passErrors.newPassword && (
                  <p className="text-xs text-rose-400 mt-1">{passErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-zinc-400 block mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...regPassword("confirmPassword")}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500/50 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passErrors.confirmPassword && (
                  <p className="text-xs text-rose-400 mt-1">{passErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 rounded-lg py-2 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg py-2 font-medium"
                >
                  {passLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
