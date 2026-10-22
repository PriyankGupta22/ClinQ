import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import AuthPage from './components/AuthPage'
import ProfilePage from './components/ProfilePage'
import ClinicPage from './components/ClinicPage'
import AppointmentsPage from './components/AppointmentsPage'
import QueuePage from './components/QueuePage'
import ClinicAdminPage from './components/ClinicAdminPage'
import ClinicDiscovery from './components/ClinicDiscovery'
import ProtectedRoute from './components/ProtectedRoute'
import PatientPrescriptionsPage from './components/PatientPrescriptionsPage'
import { readApiError, request, setApiBase } from './api/client'
import LandingPage from './components/landingPageComponents/LandingPage'
import ClinicSignup from './components/landingPageComponents/ClinicSignUp'
import DoctorSignup from './components/landingPageComponents/DoctorSignup'
import PatientSignup from './components/landingPageComponents/PatientSignup'
import DoctorDashboard from './components/doctorFrontend/DoctorDashboard'
import DoctorLayout from './components/doctorFrontend/DoctorLayout'
import DoctorClinics from './components/doctorFrontend/DoctorClinics'
import DoctorQueue from './components/doctorFrontend/DoctorQueue'
import DoctorPrescriptionList from './components/doctorFrontend/DoctorPrescriptionList'
import DoctorMessages from './components/doctorFrontend/DoctorMessages'
import DoctorProfile from './components/doctorFrontend/DoctorProfile'
import Prescriptions from './components/doctorFrontend/Prescriptions'
import ClinicAdminLayout from './components/clinicAdminFrontend/ClinicAdminLayout'
import ClinicAdminDashboard from './components/clinicAdminFrontend/ClinicAdminDashboard'
import ClinicAdminMessages from './components/clinicAdminFrontend/ClinicAdminMessages'
import PatientLayout from './components/patientFrontend/PatientLayout'
import PatientDashboard from './components/patientFrontend/PatientDashboard'
import PatientClinics from './components/patientFrontend/PatientClinics'
import PatientAppointments from './components/patientFrontend/PatientAppointments'
import PatientProfile from './components/patientFrontend/PatientProfile'
import PatientClinicDoctors from './components/patientFrontend/PatientClinicDoctors'
import ClinicAdminDoctors from './components/clinicAdminFrontend/ClinicAdminDoctors'
import ClinicAdminPatients from './components/clinicAdminFrontend/ClinicAdminPatients'
import StoreQueue from './components/clinicAdminFrontend/StoreQueue'

export default function App() {
  return <BrowserRouter><HealioRoutes /></BrowserRouter>
}

function HealioRoutes() {
  const navigate = useNavigate()
  const location = useLocation()
  const [identity, setIdentity] = useState(localStorage.getItem('healioIdentity') || 'patient')
  const [patientToken, setPatientToken] = useState(localStorage.getItem('patientAccessToken') || '')
  const [clinicToken, setClinicToken] = useState(localStorage.getItem('clinicAccessToken') || '')
  const [doctorToken, setDoctorToken] = useState(localStorage.getItem('doctorAccessToken') || '')
  const [response, setResponse] = useState(null)
  const [appointments, setAppointments] = useState([])
  const token = identity === 'clinic' ? clinicToken : identity === 'doctor' ? doctorToken : patientToken

  useEffect(() => {
    if (location.pathname === '/' && token) {
      const landingPage = identity === 'clinic' ? '/clinic/dashboard' : identity === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
      navigate(landingPage, { replace: true })
    }
  }, [location.pathname, navigate, identity, token])

  const callApi = useCallback(async (method, path, data, authToken = token) => {
    try { const result = await request(method, path, data, authToken); setResponse(result); return result } catch (error) { const detail = readApiError(error); setResponse(detail); return null }
  }, [token])
  const chooseIdentity = (next) => { setIdentity(next); localStorage.setItem('healioIdentity', next) }
  const login = (accessToken, accountType) => {
    const key = accountType === 'clinic' ? 'clinicAccessToken' : accountType === 'doctor' ? 'doctorAccessToken' : 'patientAccessToken'
    localStorage.setItem(key, accessToken)
    chooseIdentity(accountType)
    if (accountType === 'clinic') setClinicToken(accessToken)
    else if (accountType === 'doctor') setDoctorToken(accessToken)
    else setPatientToken(accessToken)
    const landingPage = accountType === 'clinic' ? '/clinic/dashboard' : accountType === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
    navigate(landingPage)
  }
  const logout = () => {
    const key = identity === 'clinic' ? 'clinicAccessToken' : identity === 'doctor' ? 'doctorAccessToken' : 'patientAccessToken'
    localStorage.removeItem(key)
    if (identity === 'clinic') setClinicToken('')
    else if (identity === 'doctor') setDoctorToken('')
    else setPatientToken('')
    navigate('/login')
  }
  const go = (page, options) => navigate(`/${page === 'auth' ? 'login' : page}`, options)

  const pageProps = { request: callApi, response, setPage: go }
  const shell = (element) => <ProtectedRoute token={token}><Layout page={location.pathname.slice(1)} setPage={go} identity={identity} setIdentity={chooseIdentity} logout={logout}>{element}</Layout></ProtectedRoute>

  return <Routes>
    <Route path="/login" element={<AuthPage identity={identity} setIdentity={chooseIdentity} request={callApi} onLogin={login} />} />
    <Route path="/register" element={<AuthPage identity={identity} setIdentity={chooseIdentity} request={callApi} onLogin={login} />} />
    <Route path="/discover" element={<ProtectedRoute token={token}><ClinicDiscovery {...pageProps} logout={logout} /></ProtectedRoute>} />
    <Route path="/dashboard" element={<Navigate to="/discover" replace />} />
    <Route path="/clinics" element={shell(<ClinicPage {...pageProps} />)} />
    <Route path="/appointments" element={shell(<AppointmentsPage {...pageProps} />)} />
    <Route path="/queue" element={shell(<QueuePage {...pageProps} currentUserId={getTokenSubject(token)} isAdmin={identity === 'clinic'} isDoctor={identity === 'doctor'} initialClinicId={location.state?.clinicId} onStartConsultation={(entry) => navigate('/prescriptions', { state: { consultation: entry } })} />)} />
    <Route path="/profile" element={shell(<ProfilePage identity={identity} {...pageProps} />)} />
    <Route path="/clinic-admin" element={<Navigate to="/clinic/dashboard" replace />} />
    <Route path="/clinic-admin/doctors" element={<Navigate to="/clinic/doctors" replace />} />
    <Route path="/prescriptions" element={<ProtectedRoute token={token} requiredRole="doctor"><Layout page={location.pathname.slice(1)} setPage={go} identity={identity} setIdentity={chooseIdentity} logout={logout}><Prescriptions {...pageProps} consultation={location.state?.consultation} /></Layout></ProtectedRoute>} />
    <Route path="/doctor-dashboard" element={<Navigate to="/doctor/dashboard" replace />} />
    <Route path="/my-prescriptions" element={shell(<PatientPrescriptionsPage {...pageProps} />)} />
    <Route path="/landingPage" element={<LandingPage />} />
    <Route path="/clinic/signup" element={<ClinicSignup onLogin={login} />} />
    <Route path="/doctor/signup" element={<DoctorSignup />} />
    <Route path="/patient/signup" element={<PatientSignup />} />
    <Route path="/patient" element={<ProtectedRoute token={patientToken} requiredRole="patient"><PatientLayout /></ProtectedRoute>}>
      <Route path="dashboard" element={<PatientDashboard />} />
      <Route path="clinics" element={<PatientClinics />} />
      <Route path="clinic-doctors" element={<PatientClinicDoctors />} />
      <Route path="messages" element={<PatientClinics />} />
      <Route path="appointments" element={<PatientAppointments />} />
      <Route path="queue" element={<QueuePage {...pageProps} currentUserId={getTokenSubject(patientToken)} isAdmin={false} isDoctor={false} />} />
      <Route path="prescriptions" element={<PatientPrescriptionsPage {...pageProps} />} />
      <Route path="profile" element={<PatientProfile />} />
    </Route>
    <Route path="/doctor" element={<ProtectedRoute token={doctorToken} requiredRole="doctor"><DoctorLayout /></ProtectedRoute>}>
      <Route path="dashboard" element={<DoctorDashboard />} />
      <Route path="clinics" element={<DoctorClinics />} />
      <Route path="queues" element={<DoctorQueue {...pageProps} />} />
      <Route path="messages" element={<DoctorMessages />} />
      <Route path="profile" element={<DoctorProfile />} />
      <Route path="prescription" element={<Prescriptions {...pageProps} consultation={location.state?.consultation} />} />
      <Route path="prescriptions" element={<DoctorPrescriptionList {...pageProps} />} />
    </Route>
    <Route path="/clinic" element={<ClinicAdminLayout onSignOut={logout} />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<ClinicAdminDashboard />} />
      <Route path="doctors" element={<ClinicAdminDoctors />} />
      <Route path="patients" element={<ClinicAdminPatients />} />
      <Route path="store" element={<StoreQueue {...pageProps} />} />
      <Route path="messages" element={<ClinicAdminMessages />} />
    </Route>
    <Route path="*" element={<Navigate to={getFallbackPath(token, identity)} replace />} />
  </Routes>
}

export function ApiSettings({ apiBase, onChange }) { return <label className="api-field auth-api">API base <input value={apiBase} onChange={(event) => onChange(event.target.value)} /></label> }

setApiBase(localStorage.getItem('apiBase') || 'http://localhost:5000')

function getTokenSubject(token) {
  try { return JSON.parse(atob(token.split('.')[1])).id } catch { return '' }
}

function getFallbackPath(token, identity) {
  if (!token) return '/login'
  return identity === 'clinic' ? '/clinic/dashboard' : identity === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
}
