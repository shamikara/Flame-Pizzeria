'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Trash2, Edit2, Search } from 'lucide-react'

type UserType = {
  id: number
  name: string
  email: string
  role: 'Customer' | 'Employee' | 'Admin'
  status: 'Active' | 'Inactive'
}

const initialUsers: UserType[] = [
  { id: 1, name: 'Kamal Perera', email: 'kamal@example.com', role: 'Customer', status: 'Active' },
  { id: 2, name: 'Nimal Silva', email: 'nimal@example.com', role: 'Employee', status: 'Active' },
  { id: 3, name: 'Samanthi Jayawardena', email: 'samanthi@example.com', role: 'Customer', status: 'Inactive' },
  { id: 4, name: 'Anura Fernando', email: 'anura@example.com', role: 'Admin', status: 'Active' },
  { id: 5, name: 'Dilani Kumari', email: 'dilani@example.com', role: 'Customer', status: 'Active' },
]

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter users by search term (name or email)
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Dummy handlers
  const handleEdit = (id: number) => alert(`Edit user with ID: ${id}`)
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((user) => user.id !== id))
    }
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Users Management</h1>

      <div className="flex mb-6 max-w-md">
        <Input
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-black border border-red-600 text-white placeholder-red-400"
          type="search"
          spellCheck={false}
          autoComplete="off"
        />
        <Button
          variant="outline"
          className="ml-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
          onClick={() => setSearchTerm('')}
          aria-label="Clear search"
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>

      <Card className="bg-black border border-red-600 shadow-md">
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-red-700">
                <th className="py-3 px-4 text-red-400">Name</th>
                <th className="py-3 px-4 text-red-400">Email</th>
                <th className="py-3 px-4 text-red-400">Role</th>
                <th className="py-3 px-4 text-red-400">Status</th>
                <th className="py-3 px-4 text-red-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-red-500 italic">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(({ id, name, email, role, status }) => (
                  <tr key={id} className="border-b border-red-800 hover:bg-red-900/20">
                    <td className="py-3 px-4 flex items-center space-x-2">
                      <User className="w-5 h-5 text-red-500" />
                      <span>{name}</span>
                    </td>
                    <td className="py-3 px-4">{email}</td>
                    <td className="py-3 px-4">{role}</td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        status === 'Active' ? 'text-green-400' : 'text-red-500'
                      }`}
                    >
                      {status}
                    </td>
                    <td className="py-3 px-4 text-center space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                        onClick={() => handleEdit(id)}
                        aria-label={`Edit ${name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                        onClick={() => handleDelete(id)}
                        aria-label={`Delete ${name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
