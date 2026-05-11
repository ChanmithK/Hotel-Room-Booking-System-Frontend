"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-[#1a1a1a]">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-medium tracking-tight mb-2">
          Kenora Hotel
        </h1>
        <p className="text-gray-500 text-sm">Staff Management System</p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[400px] bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <h2 className="text-lg font-medium mb-6">Log in</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all placeholder:text-gray-300"
              placeholder="name@hotel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all placeholder:text-gray-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-sm font-medium py-2.5 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 mt-2"
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-block px-4 py-3 border border-gray-100 rounded-lg bg-gray-50/50">
          <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest mb-2 text-center">
            Development Access
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>
              Admin:{" "}
              <span className="text-gray-800 font-medium">
                admin@kenora.com
              </span>
            </span>
            <span>
              Pass: <span className="text-gray-800 font-medium">admin123</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
