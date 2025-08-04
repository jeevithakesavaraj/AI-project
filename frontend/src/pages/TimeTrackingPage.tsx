import React, { useState, useEffect } from 'react';
import { Clock, BarChart3, List, Clock as ClockIcon, List as ListBulletIcon } from 'lucide-react';
import timeTrackingService, { TimeEntry } from '../services/timeTrackingService';
import TimeTrackingTimer from '../components/TimeTrackingTimer';
import TimeEntryList from '../components/TimeEntryList';
import TimeTrackingAnalytics from '../components/TimeTrackingAnalytics';

const TimeTrackingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timer' | 'entries' | 'analytics'>('timer');
  const [selectedTask, setSelectedTask] = useState<{ id: string; title: string; projectName: string } | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      // Load tasks that the user has access to
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTasks(data.data.tasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeEntryCreated = (timeEntry: TimeEntry) => {
    // Refresh the entries list if we're on that tab
    if (activeTab === 'entries') {
      // The TimeEntryList component will handle its own refresh
    }
  };

  const handleTimeEntryStopped = (timeEntry: TimeEntry) => {
    // Refresh the entries list if we're on that tab
    if (activeTab === 'entries') {
      // The TimeEntryList component will handle its own refresh
    }
  };

  const tabs = [
    { id: 'timer', name: 'Timer', icon: Clock },
    { id: 'entries', name: 'Entries', icon: List },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
        <p className="text-gray-600 mt-2">Track your time and view analytics</p>
      </div>

      {/* Task Selector */}
      <div className="mb-6">
        <label htmlFor="task-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Task to Track
        </label>
        <select
          id="task-select"
          value={selectedTask?.id || ''}
          onChange={(e) => {
            const task = tasks.find(t => t.id === e.target.value);
            setSelectedTask(task ? { id: task.id, title: task.title, projectName: task.projectName } : null);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a task...</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title} - {task.projectName}
            </option>
          ))}
        </select>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'timer' && (
          <div className="max-w-2xl">
            {selectedTask ? (
              <TimeTrackingTimer
                taskId={selectedTask.id}
                taskTitle={selectedTask.title}
                projectName={selectedTask.projectName}
                onTimeEntryCreated={handleTimeEntryCreated}
                onTimeEntryStopped={handleTimeEntryStopped}
              />
            ) : (
              <div className="text-center py-12">
                <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Task</h3>
                <p className="text-gray-500">Choose a task from the dropdown above to start tracking time</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'entries' && (
          <div>
            {selectedTask ? (
              <TimeEntryList
                taskId={selectedTask.id}
                onTimeEntryUpdated={() => {
                  // Refresh analytics if needed
                }}
              />
            ) : (
              <div className="text-center py-12">
                <ListBulletIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Task</h3>
                <p className="text-gray-500">Choose a task to view its time entries</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <TimeTrackingAnalytics />
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTrackingPage; 