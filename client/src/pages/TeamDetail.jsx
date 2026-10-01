import { useEffect, useState } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../components/Layout/Header';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import { fetchTeam, addMember, removeMember } from '../store/slices/teamSlice';
import { fetchTasks, updateTask, deleteTask } from '../store/slices/taskSlice';
import toast from 'react-hot-toast';
import {
  HiOutlineUserAdd,
  HiOutlinePlus,
  HiOutlineArrowNarrowLeft,
  HiOutlineTrash,
  HiOutlineMail,
} from 'react-icons/hi';

export default function TeamDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { onMenuClick } = useOutletContext();

  const { user } = useSelector((state) => state.auth);
  const { currentTeam, loading } = useSelector((state) => state.teams);
  const { tasks } = useSelector((state) => state.tasks);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTeam(id));
      dispatch(fetchTasks({ team: id }));
    }
  }, [id, dispatch]);

  const teamTasks = tasks.filter((t) => t.team?._id === id || t.team === id);

  const isOwner = currentTeam?.owner?._id === user?._id || currentTeam?.owner === user?._id;
  const currentMember = currentTeam?.members?.find((m) => m.user?._id === user?._id);
  const isAdmin = isOwner || currentMember?.role === 'admin';

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsInviting(true);
    try {
      await dispatch(
        addMember({
          teamId: id,
          email: memberEmail.trim(),
          role: memberRole,
        })
      ).unwrap();
      toast.success('Member added to team');
      setMemberEmail('');
      setIsMemberModalOpen(false);
    } catch (err) {
      toast.error(err || 'Failed to add member');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberUserId, memberName) => {
    if (window.confirm(`Remove ${memberName} from this team?`)) {
      try {
        await dispatch(removeMember({ teamId: id, userId: memberUserId })).unwrap();
        toast.success('Member removed');
      } catch (err) {
        toast.error(err || 'Failed to remove member');
      }
    }
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
        toast.success('Task deleted');
      } catch {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await dispatch(updateTask({ id: taskId, taskData: { status: newStatus } })).unwrap();
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (!currentTeam && !loading) {
    return (
      <div className="p-8 text-center text-white">
        <p>Team not found</p>
        <Link to="/teams" className="text-primary-400 mt-2 inline-block">
          Back to teams
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={currentTeam?.name || 'Team Workspace'}
        subtitle={currentTeam?.description || 'Team project workspace'}
        onMenuClick={onMenuClick}
      >
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface-800 text-surface-200 hover:text-white rounded-xl text-xs font-semibold hover:bg-surface-700 transition-colors"
            >
              <HiOutlineUserAdd className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          )}
          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl hover:from-primary-500 hover:to-primary-400 shadow-md text-sm transition-all"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Add Team Task</span>
          </button>
        </div>
      </Header>

      <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Back navigation */}
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-xs font-semibold text-surface-400 hover:text-white transition-colors"
        >
          <HiOutlineArrowNarrowLeft className="w-4 h-4" /> Back to Teams
        </Link>

        {/* Team Banner Card */}
        <section className="glass-light p-6 rounded-3xl border border-surface-700/50 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{ backgroundColor: currentTeam?.color || '#6366f1' }}
            >
              {currentTeam?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{currentTeam?.name}</h2>
              <p className="text-xs text-surface-400 mt-1 max-w-xl">
                {currentTeam?.description || 'Collaborative workspace for tasks and projects.'}
              </p>
              <div className="flex items-center gap-4 text-xs text-surface-400 mt-2">
                <span>Created by {currentTeam?.owner?.name}</span>
                <span>•</span>
                <span>{currentTeam?.members?.length || 1} team members</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2 Column Layout: Team Tasks + Member Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tasks Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Team Tasks</h3>
                <p className="text-xs text-surface-400">{teamTasks.length} tasks assigned to this workspace</p>
              </div>
              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="text-xs font-semibold text-primary-400 hover:text-primary-300"
              >
                + New Task
              </button>
            </div>

            {teamTasks.length === 0 ? (
              <div className="glass-light p-10 rounded-2xl border border-surface-700/50 text-center">
                <p className="text-sm text-surface-300 font-medium">No tasks in this team yet</p>
                <p className="text-xs text-surface-500 mt-1 mb-4">
                  Create a task linked to this team to track project milestones together.
                </p>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-500 transition-colors"
                >
                  Create Team Task
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teamTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Members Column (1 col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Team Members</h3>
                <p className="text-xs text-surface-400">Collaborators in this project</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setIsMemberModalOpen(true)}
                  className="text-xs font-semibold text-primary-400 hover:text-primary-300"
                >
                  + Add
                </button>
              )}
            </div>

            <div className="glass-light rounded-2xl border border-surface-700/50 p-4 divide-y divide-surface-700/40">
              {currentTeam?.members?.map((member) => {
                const memberUser = member.user;
                const isMemberOwner = currentTeam?.owner?._id === memberUser?._id;
                const canRemove = isAdmin && !isMemberOwner && memberUser?._id !== user?._id;

                return (
                  <div key={memberUser?._id || member._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                        {memberUser?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{memberUser?.name || 'User'}</p>
                        <p className="text-xs text-surface-400 truncate">{memberUser?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          member.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-surface-700 text-surface-300'
                        }`}
                      >
                        {member.role}
                      </span>
                      {canRemove && (
                        <button
                          onClick={() => handleRemoveMember(memberUser?._id, memberUser?.name)}
                          className="p-1 rounded text-surface-500 hover:text-red-400 transition-colors"
                          title="Remove member"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Task Modal scoped to this team */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        defaultTeamId={id}
      />

      {/* Add Member Modal */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        title="Add Member to Team"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <p className="text-xs text-surface-400">
            Enter the registered email of the user you wish to invite to this team.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5">
              User Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="email"
                required
                placeholder="colleague@example.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5">
              Role in Team
            </label>
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white focus:outline-none focus:border-primary-500 text-sm"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-700/50">
            <button
              type="button"
              onClick={() => setIsMemberModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-surface-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isInviting}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/20 disabled:opacity-50 transition-all"
            >
              {isInviting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
