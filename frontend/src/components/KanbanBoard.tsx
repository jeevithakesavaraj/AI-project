import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, MoreVertical, User, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  KanbanBoard as KanbanBoardType, 
  KanbanTask, 
  getPriorityColor, 
  getStatusColor, 
  formatDueDate, 
  getColumnTitle,
  updateTaskStatus,
  updateTaskPosition
} from '@/services/kanbanService';
import TaskModal from './TaskModal';
import LoadingSpinner from './LoadingSpinner';

interface KanbanBoardProps {
  projectId: string;
  onTaskUpdate?: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId, onTaskUpdate }) => {
  const [board, setBoard] = useState<KanbanBoardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);

  useEffect(() => {
    loadKanbanBoard();
  }, [projectId]);

  const loadKanbanBoard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/kanban/projects/${projectId}/kanban`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBoard(data.data);
      } else {
        toast.error('Failed to load Kanban board');
      }
    } catch (error) {
      console.error('Failed to load Kanban board:', error);
      toast.error('Failed to load Kanban board');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !board) return;

    const { source, destination, draggableId } = result;
    const sourceStatus = source.droppableId;
    const destinationStatus = destination.droppableId;

    // If dropped in the same column, just reorder
    if (sourceStatus === destinationStatus) {
      const column = board.columns[sourceStatus as keyof typeof board.columns];
      const newTasks = Array.from(column);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      // Update positions
      newTasks.forEach((task, index) => {
        task.position = index;
      });

      setBoard({
        ...board,
        columns: {
          ...board.columns,
          [sourceStatus]: newTasks
        }
      });

      // Update backend
      try {
        await updateTaskPosition(draggableId, destinationStatus, destination.index);
      } catch (error) {
        toast.error('Failed to update task position');
        loadKanbanBoard(); // Reload to revert changes
      }
    } else {
      // Moving between columns
      const sourceColumn = board.columns[sourceStatus as keyof typeof board.columns];
      const destinationColumn = board.columns[destinationStatus as keyof typeof board.columns];
      
      const [movedTask] = sourceColumn.splice(source.index, 1);
      movedTask.status = destinationStatus as any;
      movedTask.position = destination.index;
      
      destinationColumn.splice(destination.index, 0, movedTask);

      // Update positions for both columns
      sourceColumn.forEach((task, index) => {
        task.position = index;
      });
      destinationColumn.forEach((task, index) => {
        task.position = index;
      });

      setBoard({
        ...board,
        columns: {
          ...board.columns,
          [sourceStatus]: sourceColumn,
          [destinationStatus]: destinationColumn
        }
      });

      // Update backend
      try {
        await updateTaskStatus(draggableId, destinationStatus, destination.index);
        toast.success('Task moved successfully');
        onTaskUpdate?.();
      } catch (error) {
        toast.error('Failed to update task status');
        loadKanbanBoard(); // Reload to revert changes
      }
    }
  };

  const handleTaskClick = (task: KanbanTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskUpdate = () => {
    loadKanbanBoard();
    onTaskUpdate?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="text-center text-gray-500 py-8">
        Failed to load Kanban board
      </div>
    );
  }

  const columns = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          {columns.map((status) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">
                  {getColumnTitle(status)}
                </h3>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                  {board.columns[status as keyof typeof board.columns].length}
                </span>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    {board.columns[status as keyof typeof board.columns].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 p-3 bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                                {task.title}
                              </h4>
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </div>

                            <p className="text-gray-600 text-xs line-clamp-2 mb-3">
                              {task.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {task.assignee && (
                                  <div className="flex items-center space-x-1">
                                    <User className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-600">
                                      {task.assignee.name}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-1">
                                <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>

                            {task.dueDate && (
                              <div className="flex items-center space-x-1 mt-2">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">
                                  {formatDueDate(task.dueDate)}
                                </span>
                              </div>
                            )}

                            {task.dueDate && new Date(task.dueDate) < new Date() && (
                              <div className="flex items-center space-x-1 mt-1">
                                <AlertCircle className="w-3 h-3 text-red-400" />
                                <span className="text-xs text-red-600">Overdue</span>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
};

export default KanbanBoard; 