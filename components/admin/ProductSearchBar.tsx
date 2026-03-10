'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function ProductSearchBar() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const currentQuery = searchParams.get('q') || ''
    
    const [query, setQuery] = useState(currentQuery)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/admin/products?q=${encodeURIComponent(query)}`)
        } else {
            router.push(`/admin/products`)
        }
    }

    return (
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
                type="text"
                placeholder="Search by code or name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                    padding: '8px',
                    width: '300px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}
            />
            <button 
                type="submit"
                style={{
                    padding: '8px 16px',
                    backgroundColor: '#333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Search
            </button>
        </form>
    )
}
