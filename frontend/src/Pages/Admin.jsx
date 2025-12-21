import { Plus, Pencil, Trash, Video, Users, UserPlus, Settings, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router";

export default function Admin() {
  const adminOptions = [
    {
      id: "create",
      title: "Create Problem",
      description: "Add a new coding problem to the platform.",
      icon: Plus,
      color: "from-emerald-400 to-emerald-600",
      bgHover: "group-hover:bg-emerald-500/10",
      borderHover: "group-hover:border-emerald-500/20",
      route: "/admin/create",
    },
    {
      id: "update",
      title: "Update Problem",
      description: "Modify any existing problem’s details.",
      icon: Pencil,
      color: "from-amber-400 to-amber-600",
      bgHover: "group-hover:bg-amber-500/10",
      borderHover: "group-hover:border-amber-500/20",
      route: "/admin/update",
    },
    {
      id: "delete",
      title: "Delete Problem",
      description: "Remove an existing problem from the platform.",
      icon: Trash,
      color: "from-rose-400 to-rose-600",
      bgHover: "group-hover:bg-rose-500/10",
      borderHover: "group-hover:border-rose-500/20",
      route: "/admin/delete",
    },
    {
      id: "video",
      title: "Upload Video",
      description: "Upload and Delete video solution to the problem",
      icon: Video,
      color: "from-blue-400 to-blue-600",
      bgHover: "group-hover:bg-blue-500/10",
      borderHover: "group-hover:border-blue-500/20",
      route: "/admin/video",
    },
    {
      id: "admincreate",
      title: "Create Admin",
      description: "Add a new admin to the platform.",
      icon: UserPlus,
      color: "from-purple-400 to-purple-600",
      bgHover: "group-hover:bg-purple-500/10",
      borderHover: "group-hover:border-purple-500/20",
      route: "/admin/register",
    },
    {
      id: "manageUsers",
      title: "Manage Users",
      description:
        "View, manage, and control all registered users on the platform.",
      icon: Users,
      color: "from-indigo-400 to-indigo-600",
      bgHover: "group-hover:bg-indigo-500/10",
      borderHover: "group-hover:border-indigo-500/20",
      route: "/admin/manageUsers",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden selection:bg-emerald-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
            <p className="text-zinc-400">
              Manage the coding platform ecosystem
            </p>
          </div>
          <div className="hidden md:flex p-2 bg-white/5 border border-white/10 rounded-lg">
            <Settings className="w-5 h-5 text-zinc-400" />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {adminOptions.map((option) => {
            const Icon = option.icon;

            return (
              <NavLink
                to={option.route}
                key={option.id}
                className={`group relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:translate-y-[-2px] transition-all duration-300 ${option.borderHover} ${option.bgHover}`}
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-300 group-hover:bg-clip-text transition-all">
                      {option.title}
                    </h3>
                    <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center text-sm font-medium text-white/40 group-hover:text-white transition-colors">
                    <span>Access Tool</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
