import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { loginUser } from "../authSlice";
import { useEffect } from "react";

// schema validation for form
const signUpSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z
    .string()
    .min(8, "Password should be atleast 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

function Login() {
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
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
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
                    value="rajverma@gmail.com"
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
                  <input
                    {...register("password")}
                    type="password"
                    placeholder="Enter password"
                    className="input input-bordered w-full"
                    value="Rajjo@123"
                  />
                  {errors.password && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                {/* Submit */}
                <button type="submit" className="btn btn-neutral w-full mt-2">
                  Login
                </button>
              </fieldset>
            </form>

            {/* Footer */}
            <div className="px-8 pb-6 pt-2 border-t border-base-200 text-center">
              <span className="text-sm">
                Don&apos;t have an account?{" "}
                <NavLink to="/signup" className="link link-primary">
                  Sign Up
                </NavLink>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
