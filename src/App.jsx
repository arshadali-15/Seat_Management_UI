import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import AddUser from './pages/Users/AddUser'
import MyBookings from './pages/Bookings/MyBookings'
import AdminUsers from './pages/Users/AdminUsers'

function ProtectedRoute() {
  const token = sessionStorage.getItem('accessToken')

  return token
    ? <Outlet />
    : <Navigate to="/login" replace />
}


function App() {
  const token = sessionStorage.getItem('accessToken')

  return (
    <Routes>

      {/* Public routes */}
      <Route>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/addUser" element={<AddUser />} />
        <Route path="/myBookings" element={<MyBookings />} />
        <Route path="/users" element={<AdminUsers />} />
      </Route>

      {/* Unknown routes */}
      <Route
        path="*" element={<Navigate to={"/login"}
          replace
        />
        }
      />

    </Routes>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}