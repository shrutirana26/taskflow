import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useOutletContext, Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import TeamModal from '../components/TeamModal';
import { fetchTeams, deleteTeam } from '../store/slices/teamSlice';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineArrowNarrowRight,
  HiOutlineShieldCheck,
} from 'react-icons/hi';

export default function Teams() {
  const { onMenuClick } = useOutletContext();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { teams, loading } = useSelector((state) => state.teams);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const handleEdit = (team) => {
    setTeamToEdit(team);
    setIsTeamModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete team "${name}"? This action cannot be undone.`)) {
      try {
        await dispatch(deleteTeam(id)).unwrap();
        toast.success('Team deleted');
      } catch (err) {
        toast.error(err || 'Failed to delete team');
      }
    }
  };

  return (
    <div>
      <Header
        title="Teams"
        subtitle="Collaborate on projects, assign tasks, and share progress"
        onMenuClick={onMenuClick}
      >
        <button
          onClick={() => {
            setTeamToEdit(null);
            setIsTeamModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl hover:from-primary-500 hover:to-primary-400 shadow-md shadow-primary-500/20 text-sm transition-all"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Create Team</span>
        </button>
      </Header>

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {loading && teams.length === 0 ? (
          <div className="glass-light p-12 rounded-2xl border border-surface-700/50 text-center max-w-lg mx-auto mt-8">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-surface-400">Loading workspaces...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="glass-light p-12 rounded-3xl border border-surface-700/50 text-center max-w-lg mx-auto mt-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center mx-auto mb-4">
              <HiOutlineUserGroup className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No teams created yet</h3>
            <p className="text-sm text-surface-400 mb-6">
              Create your first team to bundle tasks into focused projects and collaborate with teammates.
            </p>
            <button
              onClick={() => {
                setTeamToEdit(null);
                setIsTeamModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-sm hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/20 transition-all"
            >
              <HiOutlinePlus className="w-4 h-4" /> Create Team
            </button>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const isOwner = team.owner?._id === user?._id || team.owner === user?._id;
              const membersCount = team.members?.length || 1;

              return (
                <div
                  key={team._id}
                  className="glass-light rounded-2xl border border-surface-700/50 p-6 flex flex-col justify-between card-hover group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                          style={{ backgroundColor: team.color || '#6366f1' }}
                        >
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-primary-400 transition-colors">
                            {team.name}
                          </h3>
                          {isOwner && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                              <HiOutlineShieldCheck className="w-3.5 h-3.5" /> Team Owner
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Owner Actions */}
                      {isOwner && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(team)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                            title="Edit Team"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(team._id, team.name)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Team"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-surface-400 line-clamp-2 mb-4">
                      {team.description || 'No description provided for this team.'}
                    </p>

                    {/* Member Avatars */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-2 overflow-hidden">
                        {team.members?.slice(0, 4).map((m, idx) => (
                          <div
                            key={m.user?._id || idx}
                            className="inline-block h-7 w-7 rounded-full ring-2 ring-surface-900 bg-surface-700 text-white text-[10px] font-bold flex items-center justify-center uppercase"
                            title={m.user?.name || 'Member'}
                          >
                            {m.user?.name?.charAt(0) || 'M'}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-surface-400 font-medium">
                        {membersCount} {membersCount === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  </div>

                  {/* Footer link to team detail */}
                  <div className="pt-4 border-t border-surface-700/40 flex items-center justify-between">
                    <span className="text-xs text-surface-500">
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/teams/${team._id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      <span>Open Workspace</span>
                      <HiOutlineArrowNarrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      {/* Team Modal */}
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          setTeamToEdit(null);
        }}
        teamToEdit={teamToEdit}
      />
    </div>
  );
}
