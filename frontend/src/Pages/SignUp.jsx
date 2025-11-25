import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
              <h1 className="text-3xl font-bold text-center mb-2">Sign Up</h1>

              <fieldset className="space-y-3">
                {/* Name */}
                <div>
                  <label className="label">Name</label>
                  <input
                    {...register("firstName")}
                    placeholder="John"
                    type="text"
                    className="input w-full"
                  />
                  {errors.firstName && (
                    <span className="text-red-500 text-sm">
                      {errors.firstName.message}
                    </span>
                  )}
                </div>

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
                  Submit
                </button>
              </fieldset>
            </form>
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
