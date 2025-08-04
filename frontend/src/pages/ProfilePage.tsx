import { useAuthStore } from '@/store/authStore'

const ProfilePage = () => {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Profile</h1>
        <p className="text-secondary-600">Manage your account settings</p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">User Information</h2>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700">Name</label>
              <p className="text-secondary-900">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700">Email</label>
              <p className="text-secondary-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700">Role</label>
              <p className="text-secondary-900">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage 