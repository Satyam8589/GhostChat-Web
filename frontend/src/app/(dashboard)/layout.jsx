"use client";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { connectSocket } from "@/config/store/action/socketAction";

// --- Icons ---
const DashboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);
const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const DashboardLayout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const { connected } = useSelector((state) => state.socket);

  // Use ref to track if socket has been initialized
  const socketInitialized = React.useRef(false);

  // Initialize socket connection when user is authenticated - ONLY ONCE
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (isAuthenticated && user && token && !socketInitialized.current) {
      // Connect socket only once when user is authenticated
      dispatch(connectSocket(token));
      socketInitialized.current = true;
    }

    // Reset flag when user logs out
    if (!isAuthenticated) {
      socketInitialized.current = false;
    }
  }, [isAuthenticated, user, dispatch]); // ✅ NO pathname!

  // Redirect to login if not authenticated - BUT ONLY AFTER INITIALIZATION
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (!isInitialized) {
    return (
      <div className="flex h-screen bg-[#0a0a0a] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse">
            <span className="text-white font-bold text-2xl">G</span>
          </div>
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  const navItems = [
    { icon: <DashboardIcon />, label: "Dashboard", href: "/dashboard" },
    { icon: <ChatIcon />, label: "Chats", href: "/chats" },
    { icon: <ProfileIcon />, label: "Profile", href: "/profile" },
    { icon: <SettingsIcon />, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Side Navigation Rail - Visible only on md and up */}
      <nav className="hidden md:flex md:w-20 bg-[#0f1117] border-r border-gray-800/50 flex-col items-center py-4 md:py-8 gap-4 md:gap-8 z-50">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-2 md:mb-4 cursor-pointer hover:scale-110 transition-transform">
          <span className="text-white font-bold text-lg md:text-xl leading-none">
            G
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-3 md:gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`group relative p-2 md:p-3 rounded-2xl transition-all duration-300 ${
                pathname.includes(item.href)
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-500 hover:text-blue-400 hover:bg-gray-800"
              }`}
            >
              {item.icon}
              {/* Simple Tooltip */}
              <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        <button
          title="Logout"
          className="p-2 md:p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all duration-300"
        >
          <LogoutIcon />
        </button>
      </nav>

      {/* Content Area */}
      <main className="flex-1 min-w-0 relative w-full h-full overflow-hidden">
        {children}
      </main>

      {/* Bottom Navigation Bar - Visible only on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-[#0f1117] border-t border-gray-800/50 z-[100] shadow-2xl">
        <div className="flex items-center justify-around py-2 px-2 safe-area-bottom">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all duration-300 ${
                pathname.includes(item.href) ? "text-blue-400" : "text-gray-500"
              }`}
            >
              <div
                className={`${pathname.includes(item.href) ? "scale-110" : ""}`}
              >
                {item.icon}
              </div>
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;
