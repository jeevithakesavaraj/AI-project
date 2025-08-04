import { useParams } from 'react-router-dom'

const TaskDetailPage = () => {
  const { taskId } = useParams()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Task Details</h1>
        <p className="text-secondary-600">Task ID: {taskId}</p>
      </div>
      
      <div className="card">
        <div className="card-content">
          <p className="text-secondary-600">Task details will be displayed here.</p>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailPage 