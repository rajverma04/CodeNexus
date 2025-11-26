import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signUpSchema) });

  const submittedData = (data) => {
    console.log(data);
  };
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
        <div className="w-full max-w-sm">
          <div className="card bg-base-100 shadow-2xl">
            <form
              noValidate
              onSubmit={handleSubmit(submittedData)}
              className="card-body space-y-4"
            >
              {/* Form Heading */}
              <h1 className="text-3xl font-bold text-center mb-2">Code Nexus</h1>

              <fieldset className="space-y-3">
                {/* Email */}
                <div>
                  <label className="label">Email</label>
                  <input
                    {...register("emailId")}
                    placeholder="john@example.com"
                    type="email"
                    className="input w-full"
                  />
                  {errors.emailId && (
                    <span className="text-red-500 text-sm">
                      {errors.emailId.message}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="label">Password</label>
                  <input
                    {...register("password")}
                    type="password"
                    placeholder="Enter password"
                    className="input w-full"
                  />
                  {errors.password && (
                    <span className="text-red-500 text-sm">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                {/* Submit */}
                <button type="submit" className="btn btn-neutral w-full mt-4">
                  Login
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;