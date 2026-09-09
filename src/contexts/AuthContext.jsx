import { createContext, useContext, useState } from 'react'
import { hash, compare } from 'bcryptjs'
import db from '../db.js'

const AuthContext = createContext(null)
const SALT_ROUNDS = 10
const SESSION_KEY = 'taskflow-user'

function loadUser() {
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore
  }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  const signup = async (username, password) => {
    const existing = await db.users.where('username').equals(username).first()
    if (existing) {
      throw new Error('Username already taken')
    }
    const passwordHash = await hash(password, SALT_ROUNDS)
    const id = await db.users.add({ username, passwordHash })
    const newUser = { id, username }
    setUser(newUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser))
    return newUser
  }

  const login = async (username, password) => {
    const record = await db.users.where('username').equals(username).first()
    if (!record) {
      throw new Error('Invalid username or password')
    }
    const valid = await compare(password, record.passwordHash)
    if (!valid) {
      throw new Error('Invalid username or password')
    }
    const newUser = { id: record.id, username: record.username }
    setUser(newUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser))
    return newUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
