"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black/90 backdrop-blur-lg shadow-lg shadow-purple-500/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-xl sm:text-2xl">👻</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold text-white">
                GhostChat
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#security"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Security
              </a>
              <a
                href="#about"
                className="text-gray-300 hover:text-white transition-colors"
              >
                About
              </a>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/login">
                <button className="px-3 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base text-white hover:text-purple-300 transition-colors">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="px-3 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-purple-300 text-sm">
                End-to-End Encrypted Messaging
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Secure Messaging
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto">
              Experience truly private conversations with military-grade
              encryption. Your messages, your privacy, your control.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register">
                <button className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-base sm:text-lg font-semibold rounded-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                  Start Chatting Free
                </button>
              </Link>
              <button className="px-6 py-3 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-sm text-white text-base sm:text-lg font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 w-full sm:w-auto">
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto">
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-zinc-800">
                <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">
                  256-bit
                </div>
                <div className="text-sm sm:text-base text-gray-400">
                  AES Encryption
                </div>
              </div>
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-zinc-800">
                <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2">
                  100%
                </div>
                <div className="text-sm sm:text-base text-gray-400">
                  Private & Secure
                </div>
              </div>
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-zinc-800">
                <div className="text-2xl sm:text-3xl font-bold text-pink-400 mb-2">
                  Zero
                </div>
                <div className="text-sm sm:text-base text-gray-400">
                  Data Collection
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-300 text-base sm:text-lg">
              Everything you need for secure communication
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">🔒</span>
              </div>
              <h3 className="text-base sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                End-to-End Encryption
              </h3>
              <p className="text-xs sm:text-base text-gray-300">
                Military-grade encryption ensures your messages are completely
                private and secure.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-zinc-800 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">⚡</span>
              </div>
              <h3 className="text-base sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                Real-Time Messaging
              </h3>
              <p className="text-xs sm:text-base text-gray-300">
                Instant message delivery with read receipts and typing
                indicators.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-zinc-800 hover:border-pink-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">👥</span>
              </div>
              <h3 className="text-base sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                Group Chats
              </h3>
              <p className="text-xs sm:text-base text-gray-300">
                Create secure group conversations with friends, family, or
                teams.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">📁</span>
              </div>
              <h3 className="text-base sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                File Sharing
              </h3>
              <p className="text-xs sm:text-base text-gray-300">
                Share encrypted files, images, and videos securely with anyone.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-zinc-800 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">🌙</span>
              </div>
              <h3 className="text-base sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                Dark Mode
              </h3>
              <p className="text-xs sm:text-base text-gray-300">
                Beautiful dark theme designed for comfortable late-night
                conversations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-zinc-800 hover:border-pink-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">🔔</span>
              </div>
              <h3 className="text-base sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                Smart Notifications
              </h3>
              <p className="text-xs sm:text-base text-gray-300">
                Stay updated with customizable notifications for important
                messages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section
        id="security"
        className="py-12 sm:py-20 px-4 sm:px-6 bg-zinc-950/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
                Your Privacy is Our Priority
              </h2>
              <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8">
                GhostChat uses industry-leading encryption technology to ensure
                your conversations remain completely private. We can't read your
                messages, and neither can anyone else.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      Zero Knowledge Architecture
                    </h4>
                    <p className="text-gray-300">
                      We never store your encryption keys on our servers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      Open Source Security
                    </h4>
                    <p className="text-gray-300">
                      Our encryption code is open for security audits.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      No Data Mining
                    </h4>
                    <p className="text-gray-300">
                      We don't sell your data or show you ads.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-2xl p-8 border border-zinc-800">
              <div className="bg-black/80 rounded-lg p-6 font-mono text-sm">
                <div className="text-purple-400 mb-2">
                  // Your message encryption
                </div>
                <div className="text-gray-300">
                  <span className="text-cyan-400">const</span> encrypted ={" "}
                  <span className="text-pink-400">encrypt</span>(
                  <br />
                  <span className="ml-4 text-green-400">"Hello World"</span>,
                  <br />
                  <span className="ml-4 text-yellow-400">publicKey</span>
                  <br />
                  );
                </div>
                <div className="text-gray-500 mt-4">
                  → a8f3k2j9x7m4p6q8r0s1t3u5v7w9y1z3...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Start Chatting Securely?
          </h2>
          <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8">
            Join thousands of users who trust GhostChat for their private
            conversations.
          </p>
          <Link href="/register">
            <button className="px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-lg sm:text-xl font-semibold rounded-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
              Create Free Account
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">👻</span>
                </div>
                <span className="text-xl font-bold text-white">GhostChat</span>
              </div>
              <p className="text-gray-400 text-sm">
                Secure, private messaging for everyone.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#security"
                    className="hover:text-white transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a
                    href="#about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8 text-center text-gray-500 text-sm">
            <p>
              © 2026 GhostChat. All rights reserved. Built with ❤️ for privacy.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
