import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const isRootLogin = location.pathname === "/login";

    return (
        <div className="min-h-screen bg-white px-6 py-10">
            {/* Header */}
            <header className="flex justify-between items-center border-b pb-4 mb-10">
                <div className="text-3xl font-bold tracking-tight text-gray-900">
                    Harsh<span className="text-blue-600">IT</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-4 py-2 border border-black font-medium rounded hover:bg-black hover:text-white transition">
                        Login
                    </button>
                    <button className="px-4 py-2 bg-black text-white font-medium rounded hover:bg-gray-800 transition">
                        Contact Admin
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto">
                {isRootLogin && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        {/* College Login */}
                        <div className="border rounded-lg shadow-sm p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg transition">
                            <span className="bg-yellow-200 text-yellow-900 text-sm font-semibold px-3 py-1 rounded-full w-fit mx-auto mb-2">
                                🔒 Earn & Grow 10x
                            </span>
                            <div>
                                <h2 className="text-xl font-bold mb-2">College Login</h2>
                                <p className="text-gray-600 text-sm">
                                    Login to your college account to manage your college's students and interviews.
                                </p>
                            </div>
                            <button className="mt-6 px-4 py-2 bg-black text-white font-semibold rounded hover:opacity-90 transition"
                                onClick={() => navigate("college-login")}
                            >
                                Login
                            </button>
                        </div>
                        {/* Student Login */}
                        <div className="border rounded-lg shadow-sm p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg transition">
                            <span className="bg-green-100 text-green-900 text-sm font-semibold px-3 py-1 rounded-full w-fit mx-auto mb-2">
                                ⬈ Save 90% of hiring bandwidth
                            </span>
                            <div>
                                <h2 className="text-xl font-bold mb-2">Student Login</h2>
                                <p className="text-gray-600 text-sm">
                                    Login to your student account to view your interviews and get feedback.
                                </p>
                            </div>
                            <button className="mt-6 px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
                                onClick={() => navigate("student-login")}
                            >
                                Login
                            </button>
                            <p className="text-xs mt-4 text-gray-500">
                                Need help? <span className="font-medium text-black underline cursor-pointer">Contact Admin</span>
                            </p>
                        </div>
                        {/* Company Login */}
                        <div className="border rounded-lg shadow-sm p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg transition">
                            <span className="bg-blue-100 text-blue-900 text-sm font-semibold px-3 py-1 rounded-full w-fit mx-auto mb-2">
                                💬 Company Login
                            </span>
                            <div>
                                <h2 className="text-xl font-bold mb-2">Company Login</h2>
                                <p className="text-gray-600 text-sm">
                                    Login to your company account to manage your company's interviews and students.
                                </p>
                            </div>
                            <button className="mt-6 px-4 py-2 bg-black text-white font-semibold rounded hover:opacity-90 transition"
                                onClick={() => navigate("recruiter-login")}
                            >
                                Login
                            </button>
                        </div>
                    </div>
                )}
                {/* Render nested login forms here */}
                <Outlet />
            </div>
        </div>
    );
}
