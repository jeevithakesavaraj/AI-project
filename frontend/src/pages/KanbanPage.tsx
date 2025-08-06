import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Grid, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import KanbanBoard from '@/components/KanbanBoard';
import ProgressTracking from '@/components/ProgressTracking';
import TaskModal from '@/components/TaskModal';
import LoadingSpinner from '@/components/LoadingSpinner';

const KanbanPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'progress'>('kanban');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.data.project);
      } else {
        toast.error('Failed to load project');
        navigate('/projects');
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = () => {
    // Refresh data when tasks are updated
    toast.success('Task updated successfully');
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center text-gray-500 py-8">
        Project not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/projects')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {project.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {project.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('kanban')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    view === 'kanban'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4 inline mr-1" />
                  Kanban
                </button>
                <button
                  onClick={() => setView('progress')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    view === 'progress'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Progress
                </button>
              </div>

              {/* Create Task Button */}
              <button
                onClick={handleCreateTask}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'kanban' ? (
          <div className="space-y-6">
            {/* Kanban Board */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Kanban Board
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Drag and drop tasks to update their status
                </p>
              </div>
              <div className="p-6">
                <KanbanBoard 
                  projectId={projectId!} 
                  onTaskUpdate={handleTaskUpdate}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Tracking */}
            <ProgressTracking 
              projectId={projectId!}
              onProgressUpdate={handleTaskUpdate}
            />
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onTaskUpdate={handleTaskUpdate}
        projectId={projectId}
      />
    </div>
  );
};

export default KanbanPage; 