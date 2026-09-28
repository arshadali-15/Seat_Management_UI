import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AddUser() {

    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [slsId, setSlsId] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [loading, setLoading] = useState(false)

    const [dialog, setDialog] = useState({
        open: false,
        type: '',
        title: '',
        message: '',
    })

    async function handleSubmit(event) {

        event.preventDefault()

        if (password !== confirmPassword) {
            setDialog({
                open: true,
                type: 'error',
                title: 'Invalid Password',
                message: 'Password and confirm password do not match.',
            })

            return
        }

        setLoading(true)

        try {

            const token = sessionStorage.getItem('accessToken')

            const response = await fetch(
                'http://localhost:8080/v1/users/addUser',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        SLSID: slsId,
                        password,
                    }),
                }
            )

            if (!response.ok) {

                let message = 'Failed to create user.'

                try {
                    const errorData = await response.json()

                    message =
                        errorData.errorDescription ||
                        errorData.message ||
                        message

                } catch (error) {
                    console.error('Failed to read error response:', error)
                }

                throw new Error(message)
            }

            const data = await response.json()

            console.log('User created:', data)

            setDialog({
                open: true,
                type: 'success',
                title: 'User Created',
                message: `${name} has been added successfully.`,
            })

            setName('')
            setEmail('')
            setSlsId('')
            setPassword('')
            setConfirmPassword('')

        } catch (error) {

            console.error('Add user failed:', error)

            setDialog({
                open: true,
                type: 'error',
                title: 'Failed to Create User',
                message:
                    error.message ||
                    'Unable to create the user.',
            })

        } finally {
            setLoading(false)
        }
    }

    function closeDialog() {
        setDialog(prev => ({
            ...prev,
            open: false,
        }))
    }

    return (
        <div className="min-h-screen bg-base-200 p-4 lg:p-6">

            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-6">

                    <div className="flex items-center gap-3">

                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-ghost btn-sm"
                        >
                            ← Back
                        </button>

                        <div>
                            <h1 className="text-3xl font-bold">
                                Add New User
                            </h1>

                            <p className="text-sm opacity-50 mt-1">
                                Create a new employee account
                            </p>
                        </div>

                    </div>

                </div>

                {/* Form */}
                <div className="rounded-3xl border border-base-300 bg-base-100 shadow-sm">

                    <div className="p-6 lg:p-8">

                        <div className="mb-6">

                            <h2 className="text-lg font-bold">
                                User Information
                            </h2>

                            <p className="text-sm opacity-50 mt-1">
                                Enter the employee details below.
                            </p>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* Name */}
                            <div>

                                <label className="label">
                                    <span className="label-text font-medium">
                                        Full Name
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Enter employee name"
                                    className="input input-bordered w-full"
                                    disabled={loading}
                                    required
                                />

                            </div>

                            {/* Email */}
                            <div>

                                <label className="label">
                                    <span className="label-text font-medium">
                                        Email
                                    </span>
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Enter employee email"
                                    className="input input-bordered w-full"
                                    disabled={loading}
                                    required
                                />

                            </div>

                            {/* SLS ID */}
                            <div>

                                <label className="label">
                                    <span className="label-text font-medium">
                                        SLS ID
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={slsId}
                                    onChange={e => setSlsId(e.target.value)}
                                    placeholder="Enter SLS ID"
                                    className="input input-bordered w-full"
                                    disabled={loading}
                                    required
                                />

                            </div>

                            {/* Password */}
                            <div>

                                <label className="label">
                                    <span className="label-text font-medium">
                                        Password
                                    </span>
                                </label>

                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="input input-bordered w-full"
                                    disabled={loading}
                                    required
                                />

                            </div>

                            {/* Confirm Password */}
                            <div>

                                <label className="label">
                                    <span className="label-text font-medium">
                                        Confirm Password
                                    </span>
                                </label>

                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Re-enter password"
                                    className="input input-bordered w-full"
                                    disabled={loading}
                                    required
                                />

                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex gap-3">

                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                    className="btn btn-ghost flex-1"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create User'
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            </div>

            {/* Dialog */}
            {dialog.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">

                    <div className="w-full max-w-md mx-4 rounded-2xl bg-base-100 shadow-2xl overflow-hidden">

                        <div className="flex justify-center pt-7">

                            <div
                                className={`
                                    w-16 h-16
                                    rounded-full
                                    flex items-center justify-center
                                    ${dialog.type === 'success'
                                        ? 'bg-success/15 text-success'
                                        : 'bg-error/15 text-error'
                                    }
                                `}
                            >

                                {dialog.type === 'success' ? (

                                    <svg
                                        className="w-9 h-9"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>

                                ) : (

                                    <svg
                                        className="w-9 h-9"
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

                                )}

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
                                type="button"
                                onClick={closeDialog}
                                className={`
                                    btn mt-6 w-full
                                    ${dialog.type === 'success'
                                        ? 'btn-success'
                                        : 'btn-error'
                                    }
                                `}
                            >
                                {dialog.type === 'success'
                                    ? 'Done'
                                    : 'Close'}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    )
}

export default AddUser