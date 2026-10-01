import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import { updateProfile } from '../store/slices/authSlice';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineIdentification,
  HiOutlineCalendar,
} from 'react-icons/hi';

export default function Profile() {
  const { onMenuClick } = useOutletContext();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Profile update state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await dispatch(updateProfile({ name: name.trim(), bio: bio.trim() })).unwrap();
      toast.success('Profile details updated');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await API.put('/users/password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'US';

  return (
    <div>
      <Header
        title="Account Settings"
        subtitle="Manage your personal profile and security credentials"
        onMenuClick={onMenuClick}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
        {/* Profile Card Overview */}
        <section className="glass-light p-6 rounded-3xl border border-surface-700/50 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl shrink-0">
            {initials}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-sm text-surface-400 mt-0.5">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-surface-400">
              <span className="flex items-center gap-1">
                <HiOutlineIdentification className="w-4 h-4 text-primary-400" />
                Role: <span className="capitalize text-white font-medium">{user?.role || 'User'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HiOutlineCalendar className="w-4 h-4 text-primary-400" />
                Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>
          </div>
        </section>

        {/* Profile Details Edit Form */}
        <section className="glass-light p-6 rounded-3xl border border-surface-700/50">
          <h3 className="text-base font-bold text-white mb-1">Personal Details</h3>
          <p className="text-xs text-surface-400 mb-6">Update your display name and bio</p>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-11 pr-4 py-2.5 bg-surface-800/30 border border-surface-700/50 rounded-xl text-surface-500 text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-surface-500 mt-1">Email cannot be changed directly</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5">
                Bio
              </label>
              <textarea
                rows="3"
                placeholder="A brief intro about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 text-sm resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-sm hover:from-primary-500 hover:to-primary-400 shadow-md shadow-primary-500/20 disabled:opacity-50 transition-all"
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </section>

        {/* Change Password Form */}
        <section className="glass-light p-6 rounded-3xl border border-surface-700/50">
          <h3 className="text-base font-bold text-white mb-1">Security & Password</h3>
          <p className="text-xs text-surface-400 mb-6">Change your account password regularly for security</p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-5 py-2.5 rounded-xl bg-surface-800 text-white font-semibold text-sm hover:bg-surface-700 border border-surface-600 disabled:opacity-50 transition-all"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
