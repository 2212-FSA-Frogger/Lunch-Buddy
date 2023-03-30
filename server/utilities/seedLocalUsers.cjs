const geolib = require('geolib');
const { User } = require('../db/index.cjs');

const SEARCH_RADIUS = 5;
const METERS_PER_MILE = 1609.344;
const MIN_PASSWORD_LENGTH = 8;

const milesToMeters = (miles) => {
  const meters = miles * METERS_PER_MILE;
  return meters;
};

/**
 * inputData: list of mock user inputs
 * origin: object containing {latitude, longitude}
 * radius: max distance away from origin, given in miles
 *
 * creates & returns array of User instances with lat/long properties set
 *  to random coordinates relative to origin
 */
async function seedLocalUsers(inputData, origin, radius = SEARCH_RADIUS) {
  const userData = inputData.map((user) => {
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

  return seededUsers;
}

module.exports = seedLocalUsers;
