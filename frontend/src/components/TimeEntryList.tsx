import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Edit } from 'lucide-react';
import timeTrackingService, { TimeEntry } from '../services/timeTrackingService';

interface TimeEntryListProps {
  taskId: string;
  onTimeEntryUpdated?: () => void;
}

const TimeEntryList: React.FC<TimeEntryListProps> = ({ taskId, onTimeEntryUpdated }) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    description: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    loadTimeEntries();
  }, [taskId]);

  const loadTimeEntries = async () => {
    setIsLoading(true);
    try {
      const entries = await timeTrackingService.getTimeEntriesForTask(taskId);
      setTimeEntries(entries);
    } catch (error) {
      console.error('Error loading time entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;

    try {
      await timeTrackingService.deleteTimeEntry(entryId);
      setTimeEntries(entries => entries.filter(entry => entry.id !== entryId));
      onTimeEntryUpdated?.();
    } catch (error: any) {
      alert('Error deleting time entry: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry.id);
    setEditForm({
      description: entry.description || '',
      startTime: new Date(entry.startTime).toISOString().slice(0, 16),
      endTime: entry.endTime ? new Date(entry.endTime).toISOString().slice(0, 16) : ''
    });
  };

  const handleSaveEdit = async (entryId: string) => {
    try {
      const updatedEntry = await timeTrackingService.updateTimeEntry(entryId, {
        taskId,
        description: editForm.description,
        startTime: new Date(editForm.startTime).toISOString(),
        endTime: editForm.endTime ? new Date(editForm.endTime).toISOString() : undefined
      });

      setTimeEntries(entries =>
        entries.map(entry =>
          entry.id === entryId ? { ...entry, ...updatedEntry } : entry
        )
      );
      setEditingEntry(null);
      onTimeEntryUpdated?.();
    } catch (error: any) {
      alert('Error updating time entry: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditForm({ description: '', startTime: '', endTime: '' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (timeEntries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No time entries yet</p>
        <p className="text-sm">Start tracking time to see entries here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
        <ClockIcon className="h-5 w-5" />
        <span>Time Entries ({timeEntries.length})</span>
      </h3>

      <div className="space-y-3">
        {timeEntries.map((entry) => (
          <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4">
            {editingEntry === entry.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={editForm.startTime}
                      onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={editForm.endTime}
                      onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSaveEdit(entry.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {entry.description && (
                    <p className="text-gray-700 mb-2">{entry.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      {new Date(entry.startTime).toLocaleString()}
                    </span>
                    {entry.endTime && (
                      <>
                        <span>→</span>
                        <span>
                          {new Date(entry.endTime).toLocaleString()}
                        </span>
                      </>
                    )}
                    {entry.duration && (
                      <span className="font-medium text-blue-600">
                        {timeTrackingService.formatDuration(entry.duration)}
                      </span>
                    )}
                  </div>
                  {entry.userName && (
                    <div className="flex items-center space-x-2 mt-2">
                      {entry.userAvatar && (
                        <img
                          src={entry.userAvatar}
                          alt={entry.userName}
                          className="h-6 w-6 rounded-full"
                        />
                      )}
                      <span className="text-sm text-gray-500">{entry.userName}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditEntry(entry)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Edit"
                  >
                                            <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                                            <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeEntryList; 