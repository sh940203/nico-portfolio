import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import PrivateRoute from './components/layout/PrivateRoute'
import PageTransition from './components/layout/PageTransition'
import SmoothScroll from './components/layout/SmoothScroll'
import LoadingSpinner from './components/ui/LoadingSpinner'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Works = lazy(() => import('./pages/Works'))
const Exhibition = lazy(() => import('./pages/Exhibition'))
const Packaging = lazy(() => import('./pages/Packaging'))
const Contact = lazy(() => import('./pages/Contact'))
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const WorksManager = lazy(() => import('./pages/admin/WorksManager'))
const PackagingManager = lazy(() => import('./pages/admin/PackagingManager'))
const MessagesManager = lazy(() => import('./pages/admin/MessagesManager'))

function PageLoader() {
  return (
    <div className="flex justify-center items-center min-h-[40vh]">
      <LoadingSpinner size="lg" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 border-t-2 border-np-black">
      <h1 className="font-display text-8xl font-bold text-np-black leading-none">404</h1>
      <p className="font-serif-tc text-np-gray-700 text-xl">此版面不存在</p>
    </div>
  )
}

function PublicLayout() {
  const location = useLocation()
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-x-hidden">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/about" element={<PageTransition><About /></PageTransition>} />
              <Route path="/works" element={<PageTransition><Works /></PageTransition>} />
              <Route path="/exhibition" element={<PageTransition><Exhibition /></PageTransition>} />
              <Route path="/packaging" element={<PageTransition><Packaging /></PageTransition>} />
              <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
      <Routes>
        <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />
        <Route path="/admin" element={<PrivateRoute><Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense></PrivateRoute>} />
        <Route path="/admin/works" element={<PrivateRoute><Suspense fallback={<PageLoader />}><WorksManager /></Suspense></PrivateRoute>} />
        <Route path="/admin/packaging" element={<PrivateRoute><Suspense fallback={<PageLoader />}><PackagingManager /></Suspense></PrivateRoute>} />
        <Route path="/admin/messages" element={<PrivateRoute><Suspense fallback={<PageLoader />}><MessagesManager /></Suspense></PrivateRoute>} />
        <Route path="*" element={<PublicLayout />} />
      </Routes>
      </SmoothScroll>
    </BrowserRouter>
  )
}
