import React, { useState, useEffect } from 'react';
import { Play, Square, Clock } from 'lucide-react';
import timeTrackingService, { TimeEntry } from '../services/timeTrackingService';

interface TimeTrackingTimerProps {
  taskId: string;
  taskTitle: string;
  projectName: string;
  onTimeEntryCreated?: (timeEntry: TimeEntry) => void;
  onTimeEntryStopped?: (timeEntry: TimeEntry) => void;
}

const TimeTrackingTimer: React.FC<TimeTrackingTimerProps> = ({
  taskId,
  taskTitle,
  projectName,
  onTimeEntryCreated,
  onTimeEntryStopped
}) => {
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    checkActiveEntry();
  }, [taskId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeEntry) {
      interval = setInterval(() => {
        setElapsedTime(timeTrackingService.calculateElapsedTime(activeEntry.startTime));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeEntry]);

  const checkActiveEntry = async () => {
    try {
      const entry = await timeTrackingService.getActiveTimeEntry();
      setActiveEntry(entry);
      if (entry) {
        setElapsedTime(timeTrackingService.calculateElapsedTime(entry.startTime));
        setDescription(entry.description || '');
      }
    } catch (error) {
      console.error('Error checking active entry:', error);
    }
  };

  const handleStartTracking = async () => {
    if (!taskId) return;

    setIsLoading(true);
    try {
      const timeEntry = await timeTrackingService.startTimeTracking({
        taskId,
        description: description.trim() || undefined
      });
      setActiveEntry(timeEntry);
      setElapsedTime(0);
      onTimeEntryCreated?.(timeEntry);
    } catch (error: any) {
      if (error.response?.data?.error === 'ACTIVE_TIMER_EXISTS') {
        alert('You already have an active time entry. Please stop it first.');
      } else {
        alert('Error starting time tracking: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopTracking = async () => {
    if (!activeEntry) return;

    setIsLoading(true);
    try {
      const timeEntry = await timeTrackingService.stopTimeTracking({
        timeEntryId: activeEntry.id
      });
      setActiveEntry(null);
      setElapsedTime(0);
      setDescription('');
      onTimeEntryStopped?.(timeEntry);
    } catch (error: any) {
      alert('Error stopping time tracking: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const isTrackingThisTask = activeEntry?.taskId === taskId;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Time Tracking</h3>
        </div>
        {activeEntry && (
          <span className="text-sm text-gray-500">
            {activeEntry.taskTitle} - {activeEntry.projectName}
          </span>
        )}
      </div>

      {activeEntry && isTrackingThisTask ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-mono text-blue-600 mb-2">
              {timeTrackingService.formatDuration(elapsedTime)}
            </div>
            <p className="text-sm text-gray-500">Currently tracking</p>
          </div>

          {description && (
            <div className="bg-gray-50 rounded p-3">
              <p className="text-sm text-gray-700">{description}</p>
            </div>
          )}

          <button
            onClick={handleStopTracking}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square className="h-5 w-5" />
            <span>Stop Tracking</span>
          </button>
        </div>
      ) : activeEntry ? (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            You're currently tracking time for another task:
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-yellow-800">
              {activeEntry.taskTitle}
            </p>
            <p className="text-xs text-yellow-600">{activeEntry.projectName}</p>
          </div>
          <button
            onClick={handleStopTracking}
            disabled={isLoading}
            className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Stop Current Timer
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <button
            onClick={handleStartTracking}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-5 w-5" />
            <span>{isLoading ? 'Starting...' : 'Start Tracking'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TimeTrackingTimer; 