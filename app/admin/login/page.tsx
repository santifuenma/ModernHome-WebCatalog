'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { loginAction } from './actions'
import styles from './login.module.css'

export default function AdminLoginPage() {
    const [error, formAction, isPending] = useActionState(loginAction, undefined)
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className={styles.page}>

            <Link href="/catalogo" className={styles.backLink}>
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
                        fill="currentColor"
                    />
                </svg>
                Atrás
            </Link>

            <div className={styles.card}>
                <div className={styles.header}>
                    <p className={styles.subtitle}>Panel de Administración</p>
                </div>

                <form action={formAction} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className={styles.input}
                            placeholder="email"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password" className={styles.label}>Contraseña</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                className={`${styles.input} ${styles.passwordInput}`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className={styles.eyeButton}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error ? (
                        <p className={styles.error} role="alert">{error}</p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isPending}
                        className={styles.button}
                    >
                        {isPending ? 'Ingresando...' : 'Iniciar sesión'}
                    </button>
                </form>
            </div>
        </div>
    )
}
