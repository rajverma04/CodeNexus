import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { useEffect, useState } from "react";
import { registerUser } from "../authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";
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
      navigate("/"); // navigate to home page
    }
  }, [isAuthenticated, navigate]);

  // const submittedData = (data) => {
  //   console.log(data);
  // };
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
    <>
      <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
        <div className="w-full max-w-sm">
          <div className="card bg-base-100 shadow-2xl">
            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="card-body space-y-4"
            >
              {/* Form Heading */}
              <h1 className="text-3xl font-bold text-center mb-2">
                Code Nexus
              </h1>

              <fieldset className="space-y-4">
                {/* Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    {...register("firstName")}
                    placeholder="John"
                    type="text"
                    className="input input-bordered w-full"
                  />
                  {errors.firstName && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.firstName.message}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    {...register("emailId")}
                    placeholder="john@example.com"
                    type="email"
                    className="input input-bordered w-full"
                  />
                  {errors.emailId && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.emailId.message}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>

                  <div className="relative">
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="input input-bordered w-full pr-10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>

                  {errors.password && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                {/* Submit */}
                <button type="submit" className="btn btn-neutral w-full mt-2">
                  Sign Up
                </button>
              </fieldset>
            </form>

            {/* Google SignUp */}
            <div className="flex justify-center mt-2 mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width="250"
                text="signup_with"
              />
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 pt-2 border-t border-base-200 text-center">
              <span className="text-sm">
                Already have an account?{" "}
                <NavLink to="/login" className="link link-primary">
                  Login
                </NavLink>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp;