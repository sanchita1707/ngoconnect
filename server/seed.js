const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const VolunteerProfile = require('./models/VolunteerProfile');
const NGOProfile = require('./models/NGOProfile');
const Opportunity = require('./models/Opportunity');
const Application = require('./models/Application');
const Participation = require('./models/Participation');
const ResourceNeed = require('./models/ResourceNeed');
const Campaign = require('./models/Campaign');
const Event = require('./models/Event');
const Notification = require('./models/Notification');
const Badge = require('./models/Badge');
const Review = require('./models/Review');
const Report = require('./models/Report');
const Category = require('./models/Category');
const Story = require('./models/Story');

dotenv.config();

const runSeeding = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ngoconnect';
    await mongoose.connect(connStr);
    console.log('Connected to database for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await VolunteerProfile.deleteMany({});
    await NGOProfile.deleteMany({});
    await Opportunity.deleteMany({});
    await Application.deleteMany({});
    await Participation.deleteMany({});
    await ResourceNeed.deleteMany({});
    await Campaign.deleteMany({});
    await Event.deleteMany({});
    await Notification.deleteMany({});
    await Badge.deleteMany({});
    await Review.deleteMany({});
    await Report.deleteMany({});
    await Category.deleteMany({});
    await Story.deleteMany({});
    console.log('Cleared existing collection entries...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Seed Badges
    console.log('Seeding achievements badges...');
    const badgesData = [
      { name: '🌱 First Volunteer', description: 'Completed your first volunteering activity!', icon: 'Leaf', requirement: 'first_participation', xpReward: 100 },
      { name: '⭐ 10 Hours Completed', description: 'Contributed 10 or more hours of volunteer service.', icon: 'Clock', requirement: '10_hours', xpReward: 200 },
      { name: '🏆 50 Hours Champion', description: 'Contributed 50 or more hours of volunteer service.', icon: 'Award', requirement: '50_hours', xpReward: 500 },
      { name: '🌍 100 Hours Impact Leader', description: 'Reached a massive milestone of 100+ volunteer hours!', icon: 'Globe', requirement: '100_hours', xpReward: 1000 },
      { name: '❤️ Helping Hand', description: 'Achieved an impact score of 200+ by assisting multiple causes.', icon: 'Heart', requirement: 'helping_hand', xpReward: 150 },
      { name: '🚨 Crisis Supporter', description: 'Stepped up during a critical or urgent crisis situation.', icon: 'Activity', requirement: 'crisis_supporter', xpReward: 250 },
      { name: '🌳 Green Warrior', description: 'Completed an environment or plantation activity.', icon: 'ShieldAlert', requirement: 'green_warrior', xpReward: 150 },
      { name: '📚 Education Champion', description: 'Helped teach or distribute education materials.', icon: 'BookOpen', requirement: 'education_champion', xpReward: 150 }
    ];
    const seededBadges = await Badge.insertMany(badgesData);
    console.log(`Seeded ${seededBadges.length} badges.`);

    // 2. Seed Categories
    console.log('Seeding cause categories...');
    const categoriesData = [
      { name: '🌱 Environment', description: 'Nature, cleanup, and climate support', icon: 'Leaf' },
      { name: '📚 Education', description: 'Teaching, literacy, and books distribution', icon: 'BookOpen' },
      { name: '❤️ Healthcare', description: 'Medical camps, blood donation, wellness drives', icon: 'Activity' },
      { name: '🍲 Food Support', description: 'Feeding programs and meal distributions', icon: 'Utensils' },
      { name: '👶 Child Welfare', description: 'Orphanage support, mentorship, toys', icon: 'Heart' },
      { name: '👵 Elder Care', description: 'Senior citizen companionships and care homes', icon: 'UserCheck' },
      { name: '🐾 Animal Welfare', description: 'Stray rescue, shelter assistance, and feeding', icon: 'ShieldAlert' },
      { name: '🏘️ Community Development', description: 'Slum development, painting, rebuilding', icon: 'MapPin' },
      { name: '🩸 Blood Donation', description: 'Emergency blood drives', icon: 'Activity' },
      { name: '🌳 Tree Plantation', description: 'Afforestation and green cover campaigns', icon: 'Globe' }
    ];
    const seededCategories = await Category.insertMany(categoriesData);
    console.log(`Seeded ${seededCategories.length} categories.`);

    // 3. Create Admin Account
    console.log('Creating Admin Account...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ngoconnect.demo',
      password: 'password123',
      role: 'admin',
      phone: '9876543210',
      location: 'Mumbai',
      status: 'active'
    });

    // 4. Create 8 NGOs
    console.log('Seeding NGO Accounts and Profiles...');
    const ngoUsersData = [
      { name: 'GreenEarth Trust', email: 'greenearth@ngo.demo', city: 'Mumbai', state: 'Maharashtra', causes: ['🌱 Environment', '🌳 Tree Plantation'] },
      { name: 'EduFuture India', email: 'edufuture@ngo.demo', city: 'Delhi', state: 'Delhi NCR', causes: ['📚 Education'] },
      { name: 'HealthFirst Foundation', email: 'healthfirst@ngo.demo', city: 'Pune', state: 'Maharashtra', causes: ['❤️ Healthcare', '🩸 Blood Donation'] },
      { name: 'HungerFree Foundation', email: 'hungerfree@ngo.demo', city: 'Bangalore', state: 'Karnataka', causes: ['🍲 Food Support'] },
      { name: 'LittleStars Childcare', email: 'littlestars@ngo.demo', city: 'Mumbai', state: 'Maharashtra', causes: ['👶 Child Welfare'] },
      { name: 'SecondHome Seniors', email: 'secondhome@ngo.demo', city: 'Delhi', state: 'Delhi NCR', causes: ['👵 Elder Care'] },
      { name: 'Paws & Claws Shelter', email: 'pawsclaws@ngo.demo', city: 'Pune', state: 'Maharashtra', causes: ['🐾 Animal Welfare'] },
      { name: 'CityBuilders Community', email: 'citybuilders@ngo.demo', city: 'Hyderabad', state: 'Telangana', causes: ['🏘️ Community Development'] }
    ];

    // Add Demo NGO
    ngoUsersData.unshift({
      name: 'Impact India NGO',
      email: 'ngo@ngoconnect.demo',
      city: 'Mumbai',
      state: 'Maharashtra',
      causes: ['📚 Education', '🍲 Food Support', '🌱 Environment']
    });

    const ngoUsers = [];
    const ngoProfiles = [];

    for (let index = 0; index < ngoUsersData.length; index++) {
      const u = ngoUsersData[index];
      const user = await User.create({
        name: u.name,
        email: u.email,
        password: 'password123',
        role: 'ngo',
        phone: `900000000${index}`,
        location: u.city,
        status: 'active'
      });

      const profile = await NGOProfile.create({
        userId: user._id,
        organizationName: u.name,
        description: `${u.name} is a committed non-profit organization focused on making tangible improvements in ${u.causes.join(' and ')} across the community.`,
        registrationNumber: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
        email: u.email,
        phone: `900000000${index}`,
        website: `www.${u.name.toLowerCase().replace(/[^a-z]/g, '')}.org`,
        address: `Sector-${index + 1}, Main Road`,
        city: u.city,
        state: u.state,
        causes: u.causes,
        verificationStatus: 'Verified', // Pre-verify all for seeding
        trustScore: 80 + Math.floor(Math.random() * 15),
        foundedYear: 2010 + index
      });

      ngoUsers.push(user);
      ngoProfiles.push(profile);
    }
    console.log(`Seeded ${ngoUsers.length} NGOs.`);

    // 5. Create 20 Volunteers
    console.log('Seeding Volunteer Accounts and Profiles...');
    const volunteerNames = [
      'Amit Sharma', 'Priya Patel', 'Rohit Verma', 'Ananya Sen', 'Vikram Rao', 
      'Neha Gupta', 'Rahul Nair', 'Sneha Joshi', 'Devendra Singh', 'Kavita Mehta', 
      'Sidharth Malhotra', 'Riya Sen', 'Kunal Kapoor', 'Shalini Varma', 'Aditya Roy', 
      'Pooja Bhatia', 'Manoj Tiwari', 'Divya Khosla', 'Sandeep Reddy', 'Meera Nair'
    ];

    const volunteerCities = ['Mumbai', 'Delhi', 'Pune', 'Bangalore', 'Hyderabad'];
    const volunteerSkills = [
      ['Teaching', 'Mentorship', 'Public Speaking'],
      ['Event Planning', 'Social Media', 'Communication'],
      ['Web Design', 'Data Entry', 'Photography'],
      ['First Aid', 'Patient Care', 'Driving'],
      ['Planting', 'Gardening', 'Physical Labor'],
      ['Cooking', 'Food Distribution', 'Inventory Management'],
      ['Writing', 'Translation', 'Content Creation']
    ];
    const volunteerCauses = [
      ['📚 Education', '👶 Child Welfare'],
      ['🌱 Environment', '🌳 Tree Plantation'],
      ['❤️ Healthcare', '🩸 Blood Donation'],
      ['🍲 Food Support', '👵 Elder Care'],
      ['🐾 Animal Welfare', '🌱 Environment'],
      ['🏘️ Community Development', '📚 Education']
    ];

    const volunteerUsers = [];
    const volunteerProfiles = [];

    // Add Demo Volunteer
    const demoVolUser = await User.create({
      name: 'Demo Volunteer',
      email: 'volunteer@ngoconnect.demo',
      password: 'password123',
      role: 'volunteer',
      phone: '8888888888',
      location: 'Mumbai',
      status: 'active'
    });

    const demoVolProfile = await VolunteerProfile.create({
      userId: demoVolUser._id,
      bio: 'I am a passionate helper who loves contributing to green environment, education, and feeding drives.',
      skills: ['Teaching', 'Event Planning', 'Communication'],
      interests: ['Children education', 'Gardening', 'Food packing'],
      preferredCauses: ['📚 Education', '🌱 Environment', '🍲 Food Support'],
      experience: 'Volunteered locally for 2 years in school plantation programs.',
      availability: { weekdays: true, weekends: true },
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      volunteerHours: 12,
      impactScore: 180,
      xp: 1500,
      level: 'Contributor',
      badges: [seededBadges[0]._id, seededBadges[7]._id], // First Volunteer, Education Champion
      profileCompletion: 100
    });

    volunteerUsers.push(demoVolUser);
    volunteerProfiles.push(demoVolProfile);

    // Create 20 volunteers
    for (let i = 0; i < volunteerNames.length; i++) {
      const name = volunteerNames[i];
      const city = volunteerCities[i % volunteerCities.length];
      const email = `${name.toLowerCase().replace(' ', '')}@gmail.demo`;
      const skills = volunteerSkills[i % volunteerSkills.length];
      const causes = volunteerCauses[i % volunteerCauses.length];

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'volunteer',
        phone: `98765000${i < 10 ? '0' + i : i}`,
        location: city,
        status: 'active'
      });

      // Calculate XP, hours and levels to make leaderboard dynamic
      const hours = 5 + (i * 4); // 5 to 81 hours
      const people = hours * 3;
      const xp = (hours * 100) + 100 + (i * 50); // Leveling up variations
      const impactScore = (hours * 5) + (people * 10);
      
      let level = 'Newcomer';
      if (xp >= 8000) level = 'Social Hero';
      else if (xp >= 4000) level = 'Impact Leader';
      else if (xp >= 2000) level = 'Community Champion';
      else if (xp >= 1000) level = 'Contributor';
      else if (xp >= 500) level = 'Helper';

      const earnedBadges = [];
      earnedBadges.push(seededBadges[0]._id); // All have completed at least one
      if (hours >= 10) earnedBadges.push(seededBadges[1]._id);
      if (hours >= 50) earnedBadges.push(seededBadges[2]._id);
      if (causes.includes('🌱 Environment') || causes.includes('🌳 Tree Plantation')) {
        earnedBadges.push(seededBadges[6]._id);
      }

      const profile = await VolunteerProfile.create({
        userId: user._id,
        bio: `Enthusiastic volunteer interested in giving back to society via ${causes.join(', ')}.`,
        skills,
        interests: ['Social service', 'Mentorship'],
        preferredCauses: causes,
        experience: 'Participated in various college and local community service events.',
        availability: { weekdays: i % 2 === 0, weekends: true },
        city,
        state: city === 'Mumbai' || city === 'Pune' ? 'Maharashtra' : 'Out of State',
        country: 'India',
        volunteerHours: hours,
        impactScore,
        xp,
        level,
        badges: earnedBadges,
        profileCompletion: 100
      });

      volunteerUsers.push(user);
      volunteerProfiles.push(profile);
    }
    console.log(`Seeded ${volunteerUsers.length} Volunteers.`);

    // 6. Seed Opportunities (22 Open/Completed Opportunities)
    console.log('Seeding Opportunities...');
    const opportunityTitles = [
      { title: 'Weekend Tree Plantation Drive', cat: '🌱 Environment', skills: ['Planting', 'Gardening'], desc: 'Join us to plant 500 saplings in the suburbs. Gloves and tools will be provided.', urgency: 'Normal' },
      { title: 'Evening School Math Tutor', cat: '📚 Education', skills: ['Teaching', 'Mentorship'], desc: 'Teach primary school students basic maths and geometry during week evenings.', urgency: 'Important' },
      { title: 'Blood Donation Camp Coordinator', cat: '❤️ Healthcare', skills: ['Event Planning', 'Communication'], desc: 'Assist in registrations, queue management, and volunteer catering at our healthcare clinic.', urgency: 'Urgent' },
      { title: 'Orphanage Feeding & Food Distribution', cat: '🍲 Food Support', skills: ['Cooking', 'Food Distribution'], desc: 'Help prepare meals and distribute food kits to 200 children in the local community shelter.', urgency: 'Critical' },
      { title: 'Digital Literacy for Seniors', cat: '📚 Education', skills: ['Teaching', 'Patience'], desc: 'Instruct senior citizens on using smartphones, messaging apps, and online banking systems.', urgency: 'Normal' },
      { title: 'Stray Feeding & Rescue Operations', cat: '🐾 Animal Welfare', skills: ['Animal Handling', 'Driving'], desc: 'Drive shelter vans to distribute food and identify strays requiring veterinary care.', urgency: 'Important' },
      { title: 'Community Slum Paint Drive', cat: '🏘️ Community Development', skills: ['Physical Labor', 'Painting'], desc: 'Paint community walls and sanitise public spaces to encourage cleanliness.', urgency: 'Normal' },
      { title: 'Tree Sapling Distribution Camp', cat: '🌱 Environment', skills: ['Event Planning', 'Communication'], desc: 'Distribute organic plant saplings and instruct residents on care methodologies.', urgency: 'Normal' },
      { title: 'Primary English Teacher Support', cat: '📚 Education', skills: ['Teaching', 'Mentorship'], desc: 'Assist school teachers in conducting pronunciation workshops and spelling tests.', urgency: 'Important' },
      { title: 'General Medical Health Checkup', cat: '❤️ Healthcare', skills: ['Medical Assistance', 'Patient Care'], desc: 'Help manage visitor logs, measure blood pressure, and issue medicine vouchers.', urgency: 'Critical' }
    ];

    const opportunities = [];

    // Create 22 Opportunities by spreading across NGOs
    for (let k = 0; k < 22; k++) {
      const item = opportunityTitles[k % opportunityTitles.length];
      const ngoIndex = k % ngoUsers.length;
      const date = new Date();
      date.setDate(date.getDate() + (k % 2 === 0 ? 5 : -5)); // half are upcoming, half are past

      const opp = await Opportunity.create({
        ngoId: ngoUsers[ngoIndex]._id,
        title: `${item.title} #${k + 1}`,
        description: item.desc,
        category: item.cat,
        requiredSkills: item.skills,
        location: `${ngoProfiles[ngoIndex].city} Local Center`,
        city: ngoProfiles[ngoIndex].city,
        state: ngoProfiles[ngoIndex].state,
        date,
        startTime: '09:00 AM',
        endTime: '01:00 PM',
        volunteersNeeded: 10 + k,
        volunteersJoined: k % 2 === 0 ? 3 : 10,
        image: `https://images.unsplash.com/photo-${k % 2 === 0 ? '1554124424-c1a14de3fdb5' : '1488521787991-ed7bbaae773c'}?auto=format&fit=crop&w=600&q=80`,
        status: k % 2 === 0 ? 'Open' : 'Completed',
        urgency: item.urgency
      });

      opportunities.push(opp);
    }
    console.log(`Seeded ${opportunities.length} opportunities.`);

    // 7. Seed Resource Needs (12 requests)
    console.log('Seeding Resource Needs...');
    const resourcesData = [
      { title: 'Books for Community Library', desc: 'Need secondary school reference textbooks and storybooks for underprivileged youth.', cat: 'Books', req: 150, received: 110, unit: 'Books' },
      { title: 'Groceries for Community Kitchen', desc: 'Rice, wheat flour, and cooking oil requested to run daily community food kitchens.', cat: 'Food', req: 500, received: 250, unit: 'kg' },
      { title: 'First Aid Medical Supplies', desc: 'Bandages, antiseptic lotions, thermometers, and basic clinic sanitizers required.', cat: 'Medical Supplies', req: 50, received: 12, unit: 'Kits' },
      { title: 'Winter Clothing & Blankets', desc: 'Blankets and thermal wear needed for pavement dwellers ahead of winter months.', cat: 'Clothes', req: 200, received: 195, unit: 'Pieces' },
      { title: 'Recycled Computers for IT Lab', desc: 'Desktops or laptops in working condition for running digital skills classrooms.', cat: 'Computers', req: 10, received: 3, unit: 'Computers' },
      { title: 'Study Desks & Chairs', desc: 'Wooden tables and benches to accommodate 40 children in our free tuition room.', cat: 'Furniture', req: 20, received: 20, unit: 'Sets' }
    ];

    const seededResources = [];
    for (let r = 0; r < 12; r++) {
      const dataItem = resourcesData[r % resourcesData.length];
      const ngoIndex = r % ngoUsers.length;
      
      let status = 'Open';
      if (dataItem.received === dataItem.req) status = 'Fulfilled';
      else if (dataItem.received > 0) status = 'Partially Fulfilled';

      // Setup contributors
      const contributors = [];
      if (dataItem.received > 0) {
        contributors.push({
          volunteerId: volunteerUsers[r % volunteerUsers.length]._id,
          quantity: dataItem.received,
          date: new Date()
        });
      }

      const resNeed = await ResourceNeed.create({
        ngoId: ngoUsers[ngoIndex]._id,
        title: `${dataItem.title} #${r + 1}`,
        description: dataItem.desc,
        category: dataItem.cat,
        quantityRequired: dataItem.req,
        quantityReceived: dataItem.received,
        unit: dataItem.unit,
        urgency: r % 4 === 0 ? 'Urgent' : 'Normal',
        location: ngoProfiles[ngoIndex].city,
        requiredBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status,
        contributors
      });
      seededResources.push(resNeed);
    }
    console.log(`Seeded ${seededResources.length} Resource Needs.`);

    // 8. Seed Campaigns
    console.log('Seeding Campaigns...');
    const campaignNames = [
      { title: 'Clean City Green City Drive', desc: 'Fundraising and volunteer support to clean and plant trees in three major slums.', goal: 'Clear 3 landfill sites & plant 1000 saplings' },
      { title: 'Rural IT Literacy Program', desc: 'Help us set up 5 rural IT schools with computing equipment and standard study books.', goal: 'Rs. 5,00,000 for Computer Labs Setup' },
      { title: 'Feed the Homeless Winter Initiative', desc: 'Distributing warm evening meals and blankets to homeless citizens.', goal: '5000 Blankets & Meal Packs' }
    ];

    for (let c = 0; c < campaignNames.length; c++) {
      const cItem = campaignNames[c];
      const ngoIndex = c % ngoUsers.length;
      await Campaign.create({
        ngoId: ngoUsers[ngoIndex]._id,
        title: cItem.title,
        description: cItem.desc,
        goal: cItem.goal,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'Active',
        image: `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80`
      });
    }
    console.log('Seeded campaigns.');

    // 9. Seed Events
    console.log('Seeding Events...');
    const eventNames = [
      { title: 'Social Service Career & Scope Webinar', desc: 'Learn how to construct a professional path in the social impact vertical.', capacity: 100, location: 'Online Zoom' },
      { title: 'Youth Volunteer Leadership Summit', desc: 'A day-long summit with panel debates, success stories, and local impact ideas.', capacity: 50, location: 'St. Xavier Hall Auditorium' },
      { title: 'Animal Rescue Techniques Seminar', desc: 'Learn stray handling protocols, bird emergency rescue, and pet first-aid methods.', capacity: 30, location: 'Paws Shelter Pune Center' }
    ];

    for (let e = 0; e < eventNames.length; e++) {
      const eItem = eventNames[e];
      const ngoIndex = e % ngoUsers.length;
      await Event.create({
        ngoId: ngoUsers[ngoIndex]._id,
        title: eItem.title,
        description: eItem.desc,
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        location: eItem.location,
        capacity: eItem.capacity,
        attendees: [volunteerUsers[e % volunteerUsers.length]._id]
      });
    }
    console.log('Seeded events.');

    // 10. Seed Applications
    console.log('Seeding Applications...');
    // Create some applications (Pending, Accepted, Completed)
    for (let a = 0; a < 15; a++) {
      const volUser = volunteerUsers[a % volunteerUsers.length];
      const opp = opportunities[a % opportunities.length];

      let status = 'Pending';
      if (a % 3 === 1) status = 'Accepted';
      else if (a % 3 === 2) status = 'Completed';

      await Application.create({
        opportunityId: opp._id,
        volunteerId: volUser._id,
        message: 'I am highly interested in supporting this cause and have matching skillsets.',
        status,
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reviewedAt: status !== 'Pending' ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : null
      });
    }
    console.log('Seeded applications.');

    // 11. Seed Participation Logs & dynamic reviews/stories
    console.log('Seeding Participation records...');
    for (let p = 0; p < 8; p++) {
      const volUser = volunteerUsers[p % volunteerUsers.length];
      const opp = opportunities[p % opportunities.length];
      const certId = `CERT-${opp._id.toString().substring(18)}-${volUser._id.toString().substring(18)}-${Math.floor(1000 + Math.random() * 9000)}`.toUpperCase();

      await Participation.create({
        volunteerId: volUser._id,
        opportunityId: opp._id,
        ngoId: opp.ngoId,
        hours: 6 + p,
        activityDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        feedback: 'Excellent work by the volunteer. Diligent and timely contribution.',
        peopleImpacted: 15 + p,
        verifiedByNGO: true,
        certificateId: certId
      });

      // Seed Reviews
      await Review.create({
        reviewerId: volUser._id,
        ngoId: opp.ngoId,
        opportunityId: opp._id,
        rating: 4 + (p % 2),
        comment: 'Very well structured activity. Felt extremely safe and the coordinators were supporting.'
      });
    }
    console.log('Seeded participation logs and NGO reviews.');

    // Recalculate NGO profiles trust score after seeding reviews
    const { recalculateNGOTrustScore } = require('./controllers/reviewController');
    for (let ngo of ngoUsers) {
      await recalculateNGOTrustScore(ngo._id);
    }
    console.log('Recalculated trust scores for seeded NGOs.');

    // 12. Seed Success Stories
    console.log('Seeding Success Stories...');
    const storiesData = [
      { title: 'How EarthSave Restored the Creek Cover', desc: 'Over 20 volunteers came together to clear plastic garbage from the suburban creek and planted 150 local saplings alongside. The local ecosystem is seeing birds returning.', category: '🌱 Environment', volunteers: 20, hours: 80, people: 1200 },
      { title: 'Digital Classes Bring Light to Rural Children', desc: 'EduFuture installed 3 recycled desktop systems in a village school. Today, 45 children are attending digital classes, learning typing, internet search, and painting applications.', category: '📚 Education', volunteers: 8, hours: 240, people: 450 }
    ];

    for (let s = 0; s < storiesData.length; s++) {
      const sItem = storiesData[s];
      await Story.create({
        authorId: ngoUsers[s % ngoUsers.length]._id,
        ngoId: ngoUsers[s % ngoUsers.length]._id,
        title: sItem.title,
        description: sItem.desc,
        category: sItem.category,
        image: `https://images.unsplash.com/photo-${s === 0 ? '1464822759023-fed622ff2c3b' : '1509062522246-3755977927d7'}?auto=format&fit=crop&w=600&q=80`,
        volunteersCount: sItem.volunteers,
        hours: sItem.hours,
        peopleImpacted: sItem.people
      });
    }
    console.log('Seeded success stories.');

    // 13. Create some Notifications
    console.log('Seeding Notifications...');
    await Notification.create({
      userId: demoVolUser._id,
      title: '🏆 Welcome to NGOConnect!',
      message: 'Explore open opportunities, set up your skills and causes, and start creating impact today!',
      type: 'info'
    });
    console.log('Seeded notifications.');

    console.log('Database Seeding Successful! Connection closing...');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Database Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

runSeeding();
