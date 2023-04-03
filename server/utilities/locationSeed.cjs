const geolib = require('geolib');
const { User, Tag, Category } = require('../db/index.cjs');
const seedUserTags = require('./seedUserTags.cjs');

const SEARCH_RADIUS = 5;
const METERS_PER_MILE = 1609.344;
const MIN_PASSWORD_LENGTH = 8;

const milesToMeters = (miles) => {
  const meters = miles * METERS_PER_MILE;
  return meters;
};

const letters = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
];

const localUsers = [
  {
    firstName: 'Andre',
    lastName: 'Platano (Demo User)',
    email: null,
    password: '123456789',
    age: 25,
    gender: 'M',
    address1: '2 Crest Line Pass',
    address2: null,
    city: 'Bronx',
    state: 'NY',
    lastLat: null,
    lastLong: null,
    zip: 10451,
    avatarUrl: '/assets/demoUserImg/M1.jpg',
    aboutMe:
      'As a journalist, I spend my days writing and researching stories. But when I am off, you can find me at the beach, practicing yoga, or trying out new restaurants in town.',
    isVerified: true,
    role: 'user',
    status: 'active',
  },
  {
    firstName: 'Lettuce',
    lastName: 'Fungrass (Demo User)',
    email: null,
    password: 'VtBW9r43wf4e453L',
    age: 23,
    gender: 'F',
    address1: '35359 Forest Crossing',
    address2: null,
    city: 'Brooklyn',
    state: 'NY',
    lastLat: null,
    lastLong: null,
    zip: 11228,
    avatarUrl: '/assets/demoUserImg/F16.jpg',
    aboutMe:
      'I am a UX designer who loves to paint, take photos, and spend time with my family and friends on the weekends.',
    isVerified: false,
    role: 'user',
    status: 'active',
  },
  {
    firstName: 'Sarah',
    lastName: 'Brown (Demo User)',
    email: null,
    password: 'SpXEMQm4533454rff4',
    age: 30,
    gender: 'F',
    address1: '928 Maryland Drive',
    address2: 'Suite 79',
    city: 'Brooklyn',
    state: 'NY',
    lastLat: null,
    lastLong: null,
    zip: 11228,
    avatarUrl: '/assets/demoUserImg/F5.jpg',
    aboutMe:
      'I am a teacher who loves to spend my free time reading, writing, and practicing mindfulness.',
    isVerified: false,
    role: 'user',
    status: 'active',
  },
];

/**
 * inputData: list of mock user inputs
 * origin: object containing {latitude, longitude}
 * radius: max distance away from origin, given in miles
 *
 * creates & returns array of User instances with lat/long properties set
 *  to random coordinates relative to origin
 */
async function locationSeed(
  inputData = localUsers,
  origin,
  radius = SEARCH_RADIUS,
  city,
  state
) {
  const userData = inputData.map((user) => {
    let userEmail = '';
    for (let i = 0; i < 12; i++) {
      const letternum = Math.floor(Math.random() * 25);
      userEmail += letters[letternum];
    }
    user.email = `${userEmail}@demo.demo`;
    if (city) {
      user.city = city;
    }
    if (state) {
      user.state = state;
    }
    //generate random coords within 5 miles radius of plantUser
    const randomCoordinate = geolib.computeDestinationPoint(
      origin,
      Math.random() * milesToMeters(radius),
      Math.random() * 360
    );

    user.lastLat = randomCoordinate.latitude;
    user.lastLong = randomCoordinate.longitude;

    // if we've generated mock user data with passwords too short (oops),
    // tack on a few extra characters
    if (user.password.length < MIN_PASSWORD_LENGTH)
      user.password = user.password + 'q34hf9psana12asd8asd49fbas';
    return user;
  });

  const seededUsers = await User.bulkCreate(userData, {
    validate: true,
    individualHooks: true,
  });

  const allTags = await Tag.findAll();
  const allCategories = await Category.findAll();

  await seedUserTags(allCategories, allTags, seededUsers);

  console.log('finished demo data for your location!');
  return;
}

module.exports = locationSeed;
