import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-secondary-900">404</h1>
        <h2 className="text-2xl font-semibold text-secondary-700 mt-4">Page Not Found</h2>
        <p className="text-secondary-600 mt-2">The page you're looking for doesn't exist.</p>
        <Link
          to="/dashboard"
          className="btn-primary mt-6"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage 