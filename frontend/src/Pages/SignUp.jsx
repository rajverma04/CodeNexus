import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { useEffect, useState } from "react";
import { registerUser } from "../authSlice";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../authSlice";

// schema validation for form
const signUpSchema = z.object({
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

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signUpSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      // user already authenticated
      navigate("/problems"); // navigate to home page
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const token = credentialResponse.credential;
    dispatch(googleLogin(token));
  };

  const handleGoogleError = () => {
    console.log("Google Login Failed");
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-950">
            <span className="text-xl font-bold">CN</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            Create an account
          </h1>
          <p className="text-sm text-zinc-400">
            Enter your email below to create your account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-zinc-200" htmlFor="firstName">
                  Name
                </label>
                <input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="John Doe"
                  type="text"
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-700 transition-all"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 font-medium animate-pulse">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-zinc-200" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  {...register("emailId")}
                  placeholder="name@example.com"
                  type="email"
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-700 transition-all"
                />
                {errors.emailId && (
                  <p className="text-xs text-red-500 font-medium animate-pulse">
                    {errors.emailId.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-zinc-200" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-700 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium animate-pulse">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-950 shadow transition-all hover:bg-zinc-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              size="large"
              width="320"
              text="signup_with"
            />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <NavLink
            to="/login"
            className="font-medium text-zinc-50 hover:text-zinc-300 underline-offset-4 hover:underline transition-all"
          >
            Login
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default SignUp;