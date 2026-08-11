const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VolunteerProfile = require('../models/VolunteerProfile');
const NGOProfile = require('../models/NGOProfile');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforngoconnectapp12345', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user (Volunteer or NGO)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Force default status/roles to prevent privilege escalation
    const finalRole = (role === 'admin') ? 'volunteer' : role || 'volunteer';
    const status = (finalRole === 'ngo') ? 'pending' : 'active'; // NGOs start as pending verification or default to active

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      phone,
      location,
      status: 'active' // For local testing ease, let users be active, NGOs can be pending admin verification
    });

    if (user) {
      // Create empty profiles based on role
      if (finalRole === 'volunteer') {
        await VolunteerProfile.create({
          userId: user._id,
          profileCompletion: 20 // Starts with registration info
        });
      } else if (finalRole === 'ngo') {
        await NGOProfile.create({
          userId: user._id,
          organizationName: name,
          email: email,
          phone: phone,
          registrationNumber: req.body.registrationNumber || `NGO-${Math.floor(100000 + Math.random() * 900000)}`,
          city: req.body.city || 'Default City',
          state: req.body.state || 'Default State',
          verificationStatus: 'Pending',
          foundedYear: req.body.foundedYear || new Date().getFullYear()
        });
      }

      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'suspended') {
        res.status(403);
        throw new Error('Your account has been suspended. Please contact admin.');
      }

      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage,
        token: generateToken(user._id)
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details & profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === 'volunteer') {
      profile = await VolunteerProfile.findOne({ userId: user._id }).populate('badges');
    } else if (user.role === 'ngo') {
      profile = await NGOProfile.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Onboard a user (complete details)
// @route   PUT /api/auth/onboard
// @access  Private
const onboardUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'volunteer') {
      const { bio, skills, interests, preferredCauses, experience, availability, city, state, country } = req.body;
      
      const updatedProfile = await VolunteerProfile.findOneAndUpdate(
        { userId: user._id },
        {
          bio,
          skills,
          interests,
          preferredCauses,
          experience,
          availability,
          city,
          state,
          country,
          profileCompletion: 100
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Onboarding completed successfully',
        profile: updatedProfile
      });
    } else if (user.role === 'ngo') {
      const { organizationName, description, registrationNumber, phone, website, address, city, state, causes, foundedYear } = req.body;

      const updatedProfile = await NGOProfile.findOneAndUpdate(
        { userId: user._id },
        {
          organizationName,
          description,
          registrationNumber,
          phone,
          website,
          address,
          city,
          state,
          causes,
          foundedYear
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'NGO Onboarding completed successfully',
        profile: updatedProfile
      });
    } else {
      res.status(400);
      throw new Error('Invalid user role for onboarding');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/update
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Update core User details
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.location = req.body.location || user.location;
    user.profileImage = req.body.profileImage || user.profileImage;

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    let updatedProfile = null;
    if (user.role === 'volunteer') {
      const { bio, skills, interests, preferredCauses, experience, availability, city, state } = req.body;
      
      updatedProfile = await VolunteerProfile.findOneAndUpdate(
        { userId: user._id },
        { bio, skills, interests, preferredCauses, experience, availability, city, state },
        { new: true }
      );
    } else if (user.role === 'ngo') {
      const { organizationName, description, registrationNumber, website, address, city, state, causes, foundedYear } = req.body;
      
      updatedProfile = await NGOProfile.findOneAndUpdate(
        { userId: user._id },
        { organizationName, description, registrationNumber, website, address, city, state, causes, foundedYear },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
      profile: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  onboardUser,
  updateProfile
};
