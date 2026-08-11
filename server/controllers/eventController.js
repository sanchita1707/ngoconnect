const Event = require('../models/Event');
const Notification = require('../models/Notification');
const VolunteerProfile = require('../models/VolunteerProfile');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({})
      .populate('ngoId', 'name profileImage')
      .sort({ date: 1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private (NGO only)
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, startTime, endTime, location, capacity } = req.body;

    const event = await Event.create({
      ngoId: req.user._id,
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      capacity
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join an event
// @route   POST /api/events/:id/join
// @access  Private (Volunteer/User)
const joinEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    if (event.attendees.includes(req.user._id)) {
      res.status(400);
      throw new Error('You have already registered for this event');
    }

    if (event.attendees.length >= event.capacity) {
      res.status(400);
      throw new Error('This event is already at full capacity');
    }

    // Add user to attendees
    event.attendees.push(req.user._id);
    await event.save();

    // Reward small XP bonus (50 XP) for joining/registering an event
    const profile = await VolunteerProfile.findOne({ userId: req.user._id });
    if (profile) {
      profile.xp += 50;
      await profile.save();

      // Notify Volunteer
      await Notification.create({
        userId: req.user._id,
        title: '🎉 Registered for Event',
        message: `You successfully registered for "${event.title}". +50 XP awarded!`,
        type: 'event'
      });
    }

    // Notify NGO
    await Notification.create({
      userId: event.ngoId,
      title: 'New Event Registration',
      message: `${req.user.name} registered for your event: "${event.title}".`,
      type: 'event'
    });

    res.json({
      success: true,
      message: 'Successfully registered for this event',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events for NGO
// @route   GET /api/events/ngo
// @access  Private (NGO only)
const getNGOEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ ngoId: req.user._id })
      .sort({ date: 1 });

    res.json({
      success: true,
      events
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  createEvent,
  joinEvent,
  getNGOEvents
};
