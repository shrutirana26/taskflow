const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Create a team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Team name is required' });
    }

    const team = await Team.create({
      name,
      description: description || '',
      color: color || '#6366f1',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
    });

    const populated = await Team.findById(team._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all teams for the logged-in user
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('taskCount')
      .sort('-createdAt');

    res.json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
const getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('taskCount');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Check if user is a member
    const isMember = team.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember && team.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this team' });
    }

    res.json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (owner/admin only)
const updateTeam = async (req, res, next) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the team owner can update the team' });
    }

    const { name, description, color } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color) updateData.color = color;

    team = await Team.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (owner only)
const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the team owner can delete the team' });
    }

    await Team.findByIdAndDelete(req.params.id);

    // Remove team reference from tasks
    const Task = require('../models/Task');
    await Task.updateMany({ team: req.params.id }, { $set: { team: null } });

    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to team
// @route   POST /api/teams/:id/members
// @access  Private (owner/admin only)
const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Check authorization
    const requester = team.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can add members' });
    }

    // Find user to add
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: 'User not found with that email' });
    }

    // Check if already a member
    const alreadyMember = team.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this team' });
    }

    team.members.push({
      user: userToAdd._id,
      role: role || 'member',
    });

    await team.save();

    const updated = await Team.findById(team._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private (owner/admin only)
const removeMember = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Can't remove the owner
    if (req.params.userId === team.owner.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove the team owner' });
    }

    // Check authorization
    const requester = team.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    const isSelfRemoval = req.params.userId === req.user._id.toString();

    if (!isSelfRemoval && (!requester || requester.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Only admins can remove members' });
    }

    team.members = team.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );

    await team.save();

    const updated = await Team.findById(team._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
};
