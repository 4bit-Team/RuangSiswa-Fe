import React from 'react'
import Navbar from './layout/Navbar'
import Hero from './sections/Hero'
import Features from './sections/Features'
import UserRoles from './sections/UserRoles'
import CTA from './sections/CTA'
import Footer from './sections/Footer'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <Hero />
      <Features />
      <UserRoles />
      <CTA/>
      <Footer />
    </div>
  )
}

export default LandingPage