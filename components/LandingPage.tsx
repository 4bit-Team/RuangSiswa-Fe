import React from 'react'
import Navbar from './layout/Navbar'
import Hero from './sections/Hero'
import Features from './sections/Features'
import UserRoles from './sections/UserRoles'
import CTA from './sections/CTA'
import Footer from './sections/Footer'

const LandingPage = () => {
  return (
    <div className="relative w-full min-h-screen bg-white">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        @keyframes moveBlob1 {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.1); }
          50% { transform: translate(60px, 20px) scale(0.9); }
          75% { transform: translate(30px, 60px) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes moveBlob2 {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-40px, 40px) scale(0.95); }
          50% { transform: translate(-20px, -40px) scale(1.1); }
          75% { transform: translate(40px, -20px) scale(1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes moveBlob3 {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(50px, 40px) scale(1.05); }
          50% { transform: translate(-30px, 60px) scale(0.95); }
          75% { transform: translate(-50px, -30px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-fade-up { animation: fadeInUp 0.6s ease-out; }
        .animate-fade-down { animation: fadeInDown 0.6s ease-out; }
        .animate-slide-right { animation: slideInRight 0.6s ease-out; }
        .animate-slide-left { animation: slideInLeft 0.6s ease-out; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 2s infinite; }
        .animate-blob1 { animation: moveBlob1 15s infinite; }
        .animate-blob2 { animation: moveBlob2 18s infinite; }
        .animate-blob3 { animation: moveBlob3 20s infinite; }
        .animate-shimmer { animation: shimmer 3s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        /* Floating blob styles */
        .blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          mix-blend-mode: normal;
          opacity: 0.25;
          transition: transform 0.6s ease, opacity 0.6s ease;
          will-change: transform, opacity;
        }
        .blob-blue {
          background: radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 70%);
        }
        .blob-cyan {
          background: radial-gradient(circle at 30% 50%, rgba(34, 211, 238, 0.3) 0%, rgba(34, 211, 238, 0.05) 70%);
        }
        .blob-indigo {
          background: radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.05) 70%);
        }
        /* Elegant curved wave - top right */
        .curved-wave-top {
          position: absolute;
          pointer-events: none;
        }
        /* Elegant curved wave - bottom left */
        .curved-wave-bottom {
          position: absolute;
          pointer-events: none;
        }
      `}</style>

      {/* Animated Background Layer - Fixed position */}
      <div className="fixed inset-0 w-full h-screen pointer-events-none z-0 overflow-hidden">
        {/* Base gradient background */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-white via-blue-50 to-white"></div>

        {/* Premium curved wave - top right - MUCH LARGER */}
        <svg className="absolute -top-32 -right-24 w-[600px] h-[600px] opacity-28" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="landingGradTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
              <stop offset="40%" stopColor="rgba(34, 211, 238, 0.2)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.08)" />
            </linearGradient>
          </defs>
          <path d="M 0,50 C 35,15 70,40 110,28 C 150,16 180,50 200,80 L 200,200 C 120,185 40,195 0,200 Z" fill="url(#landingGradTop)" />
          <path d="M 0,75 C 40,40 80,65 125,50 C 160,40 180,75 200,105 L 200,200 C 120,185 40,195 0,200 Z" fill="url(#landingGradTop)" opacity="0.7" />
          <path d="M 0,100 C 45,55 90,80 140,70 C 175,62 190,100 200,130 L 200,200 C 110,185 35,200 0,200 Z" fill="url(#landingGradTop)" opacity="0.5" />
        </svg>

        {/* Top left additional accent - ENLARGED */}
        <svg className="absolute -top-48 -left-32 w-[450px] h-[450px] opacity-22" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="landingGradTop2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.28)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
            </linearGradient>
          </defs>
          <path d="M 0,80 C 45,40 90,60 130,45 C 165,32 185,65 200,95 L 200,200 C 110,190 45,200 0,200 Z" fill="url(#landingGradTop2)" />
        </svg>

        {/* Premium curved wave - bottom left - MUCH LARGER */}
        <svg className="absolute -bottom-32 -left-32 w-[600px] h-[600px] opacity-26" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="landingGradBottom" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.38)" />
              <stop offset="40%" stopColor="rgba(59, 130, 246, 0.18)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0.07)" />
            </linearGradient>
          </defs>
          <path d="M 200,40 C 165,75 130,100 90,120 C 50,140 20,95 0,130 L 0,200 C 60,190 140,200 200,200 Z" fill="url(#landingGradBottom)" />
          <path d="M 200,65 C 170,100 140,125 100,140 C 60,155 30,110 0,150 L 0,200 C 60,190 140,200 200,200 Z" fill="url(#landingGradBottom)" opacity="0.7" />
          <path d="M 200,90 C 175,120 150,145 110,160 C 70,175 40,130 0,170 L 0,200 C 65,190 145,200 200,200 Z" fill="url(#landingGradBottom)" opacity="0.5" />
        </svg>

        {/* Bottom right additional accent - ENLARGED */}
        <svg className="absolute -bottom-48 -right-32 w-[450px] h-[450px] opacity-20" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="landingGradBottom2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0.06)" />
            </linearGradient>
          </defs>
          <path d="M 200,50 C 160,90 130,115 80,140 C 40,160 15,105 0,145 L 0,200 C 70,190 140,200 200,200 Z" fill="url(#landingGradBottom2)" />
        </svg>

        {/* Center premium decorative curves - ENLARGED */}
        <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-15" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="landingGradCenter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.18)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="80" fill="none" stroke="url(#landingGradCenter)" strokeWidth="2" opacity="0.5" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="url(#landingGradCenter)" strokeWidth="1.5" opacity="0.4" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="url(#landingGradCenter)" strokeWidth="1" opacity="0.3" />
          <path d="M 0,100 Q 50,50 100,80 T 200,130 L 200,200 Q 100,160 0,200 Z" fill="url(#landingGradCenter)" opacity="0.2" />
        </svg>

        {/* Floating blobs */}
        <div className="blob blob-blue w-72 h-72 md:w-80 md:h-80 top-1/4 left-1/4 animate-blob1" style={{ filter: 'blur(30px)', opacity: 0.28 }}></div>
        <div className="blob blob-cyan w-60 h-60 md:w-72 md:h-72 top-1/3 right-1/4 animate-blob2" style={{ filter: 'blur(24px)', opacity: 0.22 }}></div>
        <div className="blob blob-indigo w-56 h-56 md:w-64 md:h-64 bottom-1/4 left-1/3 animate-blob3" style={{ filter: 'blur(26px)', opacity: 0.24 }}></div>

        {/* Accent dots - minimal and elegant */}
        <div className="absolute top-20 right-20 w-2 h-2 md:w-3 md:h-3 bg-blue-400 rounded-full animate-shimmer" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 rounded-full animate-shimmer" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 md:w-2.5 md:h-2.5 bg-indigo-400 rounded-full animate-shimmer" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-300 rounded-full animate-shimmer" style={{ animationDelay: '1.5s' }}></div>

        {/* Subtle top gradient accent */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-100/25 via-transparent to-transparent"></div>

        {/* Subtle right side accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/25 to-transparent"></div>
      </div>

      {/* Content wrapper with proper z-index */}
      <div className="relative z-10 w-full">
        <Navbar />
        <div>
          <Hero />
          <Features />
          <UserRoles />
          <CTA/>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default LandingPage