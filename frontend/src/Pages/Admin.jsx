import { Plus, Pencil, Trash, Video } from "lucide-react";
import { NavLink } from "react-router";

export default function Admin() {
  const adminOptions = [
    {
      id: "create",
      title: "Create Problem",
      description: "Add a new coding problem to the platform.",
      icon: Plus,
      buttonColor: "bg-green-600 hover:bg-green-700",
      iconColor: "text-green-600",
      route: "/admin/create",
    },
    {
      id: "update",
      title: "Update Problem",
      description: "Modify any existing problem’s details.",
      icon: Pencil,
      buttonColor: "bg-yellow-600 hover:bg-yellow-700",
      iconColor: "text-yellow-500",
      route: "/admin/update",
    },
    {
      id: "delete",
      title: "Delete Problem",
      description: "Remove an existing problem from the platform.",
      icon: Trash,
      buttonColor: "bg-red-600 hover:bg-red-700",
      iconColor: "text-red-600",
      route: "/admin/delete",
    },
    {
      id: "video",
      title: "Upload Video",
      description: "Upload and Delete  video solution to the problem",
      icon: Video, // Updated video icon
      buttonColor: "bg-blue-600 hover:bg-blue-700", // Blue for upload action
      iconColor: "text-blue-600", // Icon color matched
      route: "/admin/video",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Admin Panel</h1>
          <p className="text-sm text-slate-300">
            Manage the coding platform — create, update or delete problems.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {adminOptions.map((option) => {
            const Icon = option.icon;

            return (
              <div
                key={option.id}
                className="p-6 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 transition shadow-md flex flex-col justify-between h-56"
              >
                {/* ICON + TITLE */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full bg-slate-700/50`}>
                    <Icon className={`w-6 h-6 ${option.iconColor}`} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {option.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {option.description}
                    </p>
                  </div>
                </div>

                {/* ROUTING BUTTON */}
                <NavLink
                  to={option.route}
                  className={`mt-6 inline-flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${option.buttonColor}`}
                >
                  {/* colored icon */}
                  <Icon className="w-5 h-5 mr-2 text-white" />
                  {option.title}
                </NavLink>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
