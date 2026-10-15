import { useState } from "react";
import axios from "axios";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const url = isLogin
                ? "https://YOUR-BACKEND-URL/api/auth/login"
                : "https://YOUR-BACKEND-URL/api/auth/register";

            const body = isLogin
                ? {
                    email: formData.email,
                    password: formData.password
                }
                : formData;

            const response = await axios.post(url, body);

            setMessage(response.data.message);

            if (isLogin) {
                localStorage.setItem(
                    "accessToken",
                    response.data.accesstoken
                );

                localStorage.setItem(
                    "refreshToken",
                    response.data.refreshToken
                );
            }

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h1>

                    <p className="text-gray-500 mt-2">
                        {isLogin
                            ? "Login to continue"
                            : "Register to get started"}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition"
                    >
                        {isLogin ? "Login" : "Register"}
                    </button>

                </form>

                {message && (
                    <p className="text-center text-sm mt-5 text-gray-600">
                        {message}
                    </p>
                )}

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        {isLogin
                            ? "Don't have an account?"
                            : "Already have an account?"}

                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setMessage("");
                            }}
                            className="ml-2 font-semibold text-black hover:underline"
                        >
                            {isLogin ? "Register" : "Login"}
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Auth;