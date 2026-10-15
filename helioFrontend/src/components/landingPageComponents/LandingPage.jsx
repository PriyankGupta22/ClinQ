import React from 'react'
import Navbar from "./Navbar.jsx"
import Hero from './Hero.jsx'
import ExperienceSection from './ExperienceSection.jsx'
import HowItWorks from './HowItWorks.jsx'
import AudienceSection from './AudienceSection.jsx'
import ClinicSignup from './ClinicSignUp.jsx'
import DoctorSignup from './DoctorSignup.jsx'
import PatientSignup from './PatientSignup.jsx'
import Features from './Features.jsx'
import FAQ from './FAQ.jsx'
import Footer from './Footer.jsx'

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <ExperienceSection />
      <HowItWorks />
      <AudienceSection />
      <ClinicSignup />
      <DoctorSignup />
      <PatientSignup />
      <Features />
      <FAQ />
      <Footer />
    </div>
  )
}

export default LandingPage
