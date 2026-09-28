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
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState({
    open: false,
    type: '',
    title: '',
    message: '',
    booking: null,
    fromDate: '',
    toDate: ''
  })

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const data = await login(email, password)

      loginUser(data.user)

      console.log('Login successful:', data)

      navigate('/dashboard', { replace: true })

    } catch (error) {
      // setError(error.message)
      setDialog({
        open: true,
        type: 'error',
        title: 'Login Failed',
        message: 'User not found!',
        booking: null,
        fromDate: '',
        toDate: ''
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">

      {/* DIALOG */}
      {dialog.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl bg-base-100 shadow-2xl overflow-hidden">

            <div className="flex justify-center pt-7">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-error/15 text-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
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

            <div className="px-6 pt-5 pb-6 text-center">
              <h3 className="text-xl font-bold">
                {dialog.title}
              </h3>

              <p className="mt-2 text-sm text-base-content/60">
                {dialog.message}
              </p>

              <button
                onClick={() =>
                  setDialog(prev => ({
                    ...prev,
                    open: false
                  }))
                }
                className="btn btn-error mt-6 w-full"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="card w-full max-w-md bg-base-100 shadow-xl">

        <div className="card-body">

          <h1 className="text-3xl font-bold text-center">
            Seat Management
          </h1>

          <p className="text-center text-base-content/60 mb-4">
            Sign in to manage your desk
          </p>

          {error && (
            <div className="alert alert-error mb-2">
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <div>
              <label className="label">
                <span className="label-text">
                  Email
                </span>
              </label>

              <input
                type="text"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                className="input input-bordered w-full"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">
                  Password
                </span>
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                className="input input-bordered w-full"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

          </form>

        </div>
      </div>

    </div>
  )
}

export default Login