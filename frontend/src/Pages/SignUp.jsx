import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { useEffect, useState } from "react";
import { registerUser } from "../authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";

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

                {/* API Error Message */}
                {error && (
                  <div className="text-red-500 text-sm text-center font-medium">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" className="btn btn-neutral w-full mt-2">
                  Sign Up
                </button>
              </fieldset>
            </form>

            {/* Google SignUp */}
            <div className="flex justify-center mt-2 mb-4">
              <button className="btn bg-white w-[50%] flex justify-center items-center text-black border-[#e5e5e5]">
                <svg
                  aria-label="Google logo"
                  width="16"
                  height="16"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <g>
                    <path d="m0 0H512V512H0" fill="#fff"></path>
                    <path
                      fill="#34a853"
                      d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                    ></path>
                    <path
                      fill="#4285f4"
                      d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                    ></path>
                    <path
                      fill="#fbbc02"
                      d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                    ></path>
                    <path
                      fill="#ea4335"
                      d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                    ></path>
                  </g>
                </svg>
                SignUp with Google
              </button>
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

// todo: errors syntax for zod
// const errors = {
//     firstName: {        // initially undefinied is present
//         type: 'minLength',
//         message: "Name should contain atleast 3 characters"
//     },
//     emailId: {
//         type: 'invalid_string',
//         message: "Invalid email"
//     }
// }

// function SignUp() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log(name, email, password);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center min-h-screen gap-y-2">
//       <input
//         type="text"
//         value={name}
//         placeholder="Enter your first name"
//         onChange={(e) => setName(e.target.value)}
//       />
//       <input
//         type="email"
//         value={email}
//         placeholder="Enter your email"
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <input
//         type="password"
//         value={password}
//         placeholder="Enter your password"
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <button type="submit">Submit</button>
//     </form>
//   );
// }
