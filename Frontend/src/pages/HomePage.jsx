//this is the home page.
import React from 'react';
import { useNavigate } from "react-router-dom";

//this is the home content.
function HomeContent() {
    const navigate = useNavigate();

    // Card click handlers
    const handleStudentClick = () => {
        navigate("/signup", { state: { role: "student" } });
    };
    const handleCollegeClick = () => {
        navigate("/signup", { state: { role: "college" } });
    };
    const handleRecruiterClick = () => {
        navigate("/signup", { state: { role: "recruiter" } });
    };

    // Button click handlers
    const handleLogin = () => {
        navigate("/login");
    };
    const handleSignup = () => {
        navigate("/signup");
    };

    return (
        <div className="min-h-screen bg-white px-6 py-10 flex flex-col items-center justify-center">
            <div className="max-w-xl w-full mx-auto bg-gray-50 rounded-lg shadow-md p-8">
                <h1 className="text-4xl font-bold text-center mb-6 text-blue-700">Welcome to Campus Recruitment Portal</h1>
                <p className="text-center text-gray-700 mb-8">
                    This platform connects students, colleges, and recruiters for seamless campus placements and opportunities.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button
                        className="border rounded-lg p-6 flex flex-col items-center bg-white hover:shadow-lg transition focus:outline-none"
                        onClick={handleStudentClick}
                        aria-label="Register as Student"
                        type="button"
                    >
                        <span className="text-2xl font-semibold text-blue-600 mb-2">Students</span>
                        <p className="text-gray-600 text-center text-sm">
                            Register, build your profile, and apply for jobs and internships.
                        </p>
                    </button>
                    <button
                        className="border rounded-lg p-6 flex flex-col items-center bg-white hover:shadow-lg transition focus:outline-none"
                        onClick={handleCollegeClick}
                        aria-label="Register as College"
                        type="button"
                    >
                        <span className="text-2xl font-semibold text-blue-600 mb-2">Colleges</span>
                        <p className="text-gray-600 text-center text-sm">
                            Manage students, coordinate with recruiters, and track placement stats.
                        </p>
                    </button>
                    <button
                        className="border rounded-lg p-6 flex flex-col items-center bg-white hover:shadow-lg transition focus:outline-none"
                        onClick={handleRecruiterClick}
                        aria-label="Register as Recruiter"
                        type="button"
                    >
                        <span className="text-2xl font-semibold text-blue-600 mb-2">Recruiters</span>
                        <p className="text-gray-600 text-center text-sm">
                            Post jobs, shortlist candidates, and hire top talent from colleges.
                        </p>
                    </button>
                </div>
                <div className="flex flex-col md:flex-row justify-center gap-4">
                    <button
                        onClick={handleLogin}
                        className="bg-blue-600 text-white px-6 py-2 rounded text-center font-semibold hover:bg-blue-700 transition"
                        type="button"
                    >
                        Login
                    </button>
                    <button
                        onClick={handleSignup}
                        className="bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded text-center font-semibold hover:bg-blue-50 transition"
                        type="button"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <>
            <HomeContent />
        </>
    )
}


