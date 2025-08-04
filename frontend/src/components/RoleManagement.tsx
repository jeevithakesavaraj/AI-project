import React, { useState, useEffect } from 'react';
import { roleService, ProjectMember, AddProjectMemberData, UpdateProjectMemberRoleData } from '@/services/roleService';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

interface RoleManagementProps {
  projectId: string;
  onMemberUpdate?: () => void;
}

const RoleManagement: React.FC<RoleManagementProps> = ({ projectId, onMemberUpdate }) => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState<AddProjectMemberData>({
    userId: '',
    role: 'MEMBER'
  });

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const projectMembers = await roleService.getProjectMembers(projectId);
      setMembers(projectMembers);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load project members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      setLoading(true);
      await roleService.addProjectMember(projectId, newMember);
      toast.success('Member added successfully');
      setNewMember({ userId: '', role: 'MEMBER' });
      setShowAddMember(false);
      loadMembers();
      onMemberUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER') => {
    try {
      setLoading(true);
      await roleService.updateProjectMemberRole(projectId, memberId, { role });
      toast.success('Member role updated successfully');
      loadMembers();
      onMemberUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update member role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      return;
    }

    try {
      setLoading(true);
      await roleService.removeProjectMember(projectId, memberId);
      toast.success('Member removed successfully');
      loadMembers();
      onMemberUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const canManageMembers = () => {
    const currentMember = members.find(member => member.id === user?.id);
    return currentMember?.role === 'OWNER' || currentMember?.role === 'ADMIN';
  };

  const canUpdateRoles = () => {
    const currentMember = members.find(member => member.id === user?.id);
    return currentMember?.role === 'OWNER';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-red-100 text-red-800';
      case 'ADMIN':
        return 'bg-orange-100 text-orange-800';
      case 'MEMBER':
        return 'bg-blue-100 text-blue-800';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Project Members</h3>
        {canManageMembers() && (
          <button
            onClick={() => setShowAddMember(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Add Member
          </button>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Project Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={newMember.userId}
                  onChange={(e) => setNewMember({ ...newMember, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={!newMember.userId}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}`}
                          alt={member.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {canUpdateRoles() && member.role !== 'OWNER' && (
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value as any)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="MEMBER">Member</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      )}
                      {canManageMembers() && member.id !== user?.id && member.role !== 'OWNER' && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          className="text-red-600 hover:text-red-900 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {members.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No members found for this project.
        </div>
      )}
    </div>
  );
};

export default RoleManagement; 