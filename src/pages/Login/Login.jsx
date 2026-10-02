import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { loginUser } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [dialog, setDialog] = useState({
    open: false,
    type: '',
    title: '',
    message: '',
  })

  async function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Missing Information',
        message: 'Please enter your email and password.',
      })
      return
    }

    setLoading(true)

    try {
      const data = await login(
        email.trim(),
        password
      )

      loginUser(data.user)

      navigate('/dashboard', {
        replace: true,
      })
    } catch (error) {
      console.error('Login failed:', error)

      setDialog({
        open: true,
        type: 'error',
        title: 'Login Failed',
        message:
          error?.errorDescription ||
          'Invalid email or password.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl bg-base-100 shadow-2xl">

        <div className="grid md:grid-cols-2">

          {/* LEFT — Branding */}
          <div className="hidden md:flex relative overflow-hidden bg-primary p-10 text-primary-content">

            {/* Decorative circles */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10" />

            <div className="relative z-10 flex w-full flex-col justify-between">

              <div>
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 19V5a1 1 0 011-1h14a1 1 0 011 1v14M4 19h16M8 8h2m4 0h2M8 12h2m4 0h2M8 16h2m4 0h2"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-lg font-bold">
                      Seat Management
                    </p>

                    <p className="text-xs opacity-70">
                      Workspace Management System
                    </p>
                  </div>
                </div>

                {/* Main message */}
                <div className="mt-20">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-70">
                    Welcome back
                  </p>

                  <h2 className="mt-4 text-4xl font-bold leading-tight">
                    Your workspace,
                    <br />
                    simplified.
                  </h2>

                  <p className="mt-5 max-w-sm text-sm leading-6 opacity-75">
                    Manage your desk bookings,
                    check availability and
                    find your workspace with ease.
                  </p>
                </div>
              </div>

              {/* Bottom */}
              <div className="mt-12 flex items-center gap-2 text-xs opacity-60">
                <span className="h-2 w-2 rounded-full bg-success" />
                Workspace booking system
              </div>
            </div>
          </div>

          {/* RIGHT — Login */}
          <div className="p-7 sm:p-10 md:p-12">

            {/* Mobile logo */}
            <div className="mb-8 flex items-center gap-3 md:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-content">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 19V5a1 1 0 011-1h14a1 1 0 011 1v14M4 19h16M8 8h2m4 0h2M8 12h2m4 0h2M8 16h2m4 0h2"
                  />
                </svg>
              </div>

              <div>
                <p className="font-bold">
                  Seat Management
                </p>

                <p className="text-xs opacity-50">
                  Workspace Management
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                Sign in
              </h1>

              <p className="mt-2 text-sm text-base-content/55">
                Enter your credentials to access your workspace.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <label className="input input-bordered flex w-full items-center gap-3 transition focus-within:border-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 opacity-40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>

                  <input
                    type="email"
                    value={email}
                    onChange={event =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@company.com"
                    disabled={loading}
                    autoComplete="username"
                    required
                  />
                </label>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <label className="input input-bordered flex w-full items-center gap-3 transition focus-within:border-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 opacity-40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 10V7a4 4 0 00-8 0v3m-2 0h12a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2z"
                    />
                  </svg>

                  <input
                    type="password"
                    value={password}
                    onChange={event =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                </label>
              </div>

              {/* Login button */}
              <button
                type="submit"
                className="btn btn-primary mt-3 h-12 w-full rounded-xl text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 border-t border-base-300 pt-5 text-center">
              <p className="text-xs text-base-content/40">
                Secure workspace access
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Dialog */}
      {dialog.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-base-100 shadow-2xl">

            <div className="flex justify-center pt-7">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>

            <div className="px-6 pb-7 pt-5 text-center">
              <h3 className="text-xl font-bold">
                {dialog.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-base-content/60">
                {dialog.message}
              </p>

              <button
                type="button"
                onClick={() =>
                  setDialog(prev => ({
                    ...prev,
                    open: false,
                  }))
                }
                className="btn btn-error mt-6 w-full rounded-xl"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login