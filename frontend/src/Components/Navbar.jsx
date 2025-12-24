import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../authSlice";
import { NavLink, useNavigate } from "react-router";

const Navbar = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <div className="flex items-center gap-6">
                    <NavLink to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-black text-sm">CN</div>
                        <span>CodeNexus</span>
                    </NavLink>

                    {/* Admin Link - Desktop */}
                    {user?.role === "admin" && (
                        <NavLink
                            to="/admin"
                            className="hidden text-sm font-medium text-zinc-400 transition-colors hover:text-white md:block"
                        >
                            Admin Panel
                        </NavLink>
                    )}
                    <NavLink
                        to="/problems"
                        className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                    >
                        Problems
                    </NavLink>
                    <NavLink
                        to="/notebook"
                        className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                    >
                        Notebook
                    </NavLink>
                    <NavLink
                        to="/faq"
                        className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                    >
                        FAQ
                    </NavLink>
                </div>

                {/* User User Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden text-sm text-zinc-400 md:block">
                                Welcome, <span className="font-medium text-white">{user.firstName || user.name || "User"}</span>
                            </div>
                            <div className="group relative">
                                <button className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black">
                                    <span className="font-semibold text-white">{user?.firstName?.[0]?.toUpperCase() || "U"}</span>
                                </button>
                                {/* Dropdown */}
                                <div className="absolute right-0 top-full mt-2 w-56 origin-top-right scale-95 opacity-0 invisible transition-all duration-100 group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                                    <div className="rounded-xl border border-white/10 bg-[#0d1117] p-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none backdrop-blur-md">
                                        <button
                                            className="cursor-pointer flex w-full items-center rounded-lg px-2 py-2 text-sm text-zinc-300 outline-none hover:bg-white/5 hover:text-white transition-colors"
                                            onClick={() => navigate(`/u/${user?.username || user?.firstName}`)}
                                        >
                                            Profile
                                        </button>
                                        <div className="my-1 h-px bg-white/10" />
                                        <button
                                            className="cursor-pointer flex w-full items-center rounded-lg px-2 py-2 text-sm text-red-400 outline-none hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                            onClick={handleLogout}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <NavLink to="/login" className="inline-flex h-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300">
                            Login
                        </NavLink>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
