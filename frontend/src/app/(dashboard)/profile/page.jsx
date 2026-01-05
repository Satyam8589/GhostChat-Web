"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutUser, updateProfile } from "@/config/store/action/authAction";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit2,
  FiCamera,
  FiSave,
  FiX,
  FiLogOut,
  FiShield,
  FiBell,
  FiLock,
  FiArrowLeft,
} from "react-icons/fi";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );
  const [message, setMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
    profilePicture: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        phone: user.phone || "",
        location: user.location || "",
        profilePicture: user.profilePicture || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setMessage("");
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        phone: user.phone || "",
        location: user.location || "",
        profilePicture: user.profilePicture || "",
      });
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await dispatch(logoutUser());
      router.push("/login");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profilePicture: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="h-full max-w-7xl mx-auto relative z-10 flex flex-col">
        {/* Message Banner */}
        {message && (
          <div
            className={`mb-3 p-3 rounded-lg text-sm text-center ${
              message.includes("successfully")
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {message}
          </div>
        )}

        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Profile
          </h1>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm"
          >
            <FiLogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:overflow-hidden">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 ring-1 ring-white/20 shadow-2xl lg:overflow-hidden flex flex-col">
            {/* Compact Header with Centered Profile */}
            <div className="h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 relative flex items-center justify-center">
              {/* Edit Button - Top Right */}
              <div className="absolute top-2 right-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all text-sm"
                  >
                    <FiEdit2 className="w-3 h-3" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex items-center gap-1 px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all text-sm disabled:opacity-50"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-1 px-2 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all text-sm disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <FiSave className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Centered Profile Picture */}
              <div className="relative -mb-16">
                <div className="w-32 h-32 rounded-full border-4 border-gray-900 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl overflow-hidden shadow-xl">
                  {formData.profilePicture ? (
                    <img
                      src={formData.profilePicture}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white">
                      {formData.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-all shadow-lg">
                    <FiCamera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Centered Name and Username */}
            <div className="pt-20 pb-4 text-center border-b border-gray-800/50">
              <h2 className="text-xl font-bold text-white">{formData.name}</h2>
              <p className="text-sm text-gray-400 mt-1">@{formData.username}</p>
            </div>

            {/* Profile Details - Modern Card Layout */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                {/* Name Card */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all group">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-3 group-hover:text-purple-400 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                      <FiUser className="w-3.5 h-3.5" />
                    </div>
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-base text-white font-medium">
                      {formData.name || "Not set"}
                    </p>
                  )}
                </div>

                {/* Username Card */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-blue-500/50 transition-all group">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-3 group-hover:text-blue-400 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                      <FiUser className="w-3.5 h-3.5" />
                    </div>
                    Username
                  </label>
                  <p className="text-base text-white font-medium">
                    @{formData.username}
                  </p>
                </div>

                {/* Email Card */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-pink-500/50 transition-all group">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-3 group-hover:text-pink-400 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-all">
                      <FiMail className="w-3.5 h-3.5" />
                    </div>
                    Email
                  </label>
                  <p className="text-base text-white font-medium truncate">
                    {formData.email}
                  </p>
                </div>

                {/* Phone Card */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-green-500/50 transition-all group">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-3 group-hover:text-green-400 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-all">
                      <FiPhone className="w-3.5 h-3.5" />
                    </div>
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="text-base text-white font-medium">
                      {formData.phone || "Not set"}
                    </p>
                  )}
                </div>

                {/* Location Card */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all group">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-3 group-hover:text-orange-400 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-all">
                      <FiMapPin className="w-3.5 h-3.5" />
                    </div>
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Your location"
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="text-base text-white font-medium">
                      {formData.location || "Not set"}
                    </p>
                  )}
                </div>

                {/* Bio Card */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-cyan-500/50 transition-all group">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-3 group-hover:text-cyan-400 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all">
                      <FiUser className="w-3.5 h-3.5" />
                    </div>
                    Bio
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="About you..."
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="text-base text-white font-medium truncate">
                      {formData.bio || "No bio yet"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings & Info */}
          <div className="flex flex-col gap-4">
            {/* Settings */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">
                Quick Settings
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-all group">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <FiShield className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm text-white">Privacy</span>
                </button>

                <button className="w-full flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-all group">
                  <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <FiBell className="w-4 h-4 text-pink-400" />
                  </div>
                  <span className="text-sm text-white">Notifications</span>
                </button>

                <button className="w-full flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-all group">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <FiLock className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-white">Password</span>
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">
                Account Info
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">ID</span>
                  <span className="text-white font-mono truncate ml-2">
                    {(user.id || user._id)?.slice(-8)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Member since</span>
                  <span className="text-white">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.status === "online"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    ></span>
                    <span className="text-white capitalize">
                      {user.status || "Offline"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Set Online Button - Only show if offline */}
              {user.status !== "online" && (
                <button
                  onClick={async () => {
                    const { updateUserStatus } = await import(
                      "@/config/store/action/statusAction"
                    );
                    dispatch(updateUserStatus("online"));
                  }}
                  className="w-full mt-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Set Status to Online
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
