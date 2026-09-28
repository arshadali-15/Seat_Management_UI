import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser = sessionStorage.getItem('currentUser')

        return storedUser
            ? JSON.parse(storedUser)
            : null
    })

    const loginUser = (userData) => {
        setUser(userData)

        sessionStorage.setItem(
            'currentUser',
            JSON.stringify(userData)
        )
    }

    const logout = () => {
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('currentUser')

        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loginUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider'
        )
    }

    return context
}