const db = require('./database.cjs');
const Category = require('./models/Category.cjs');
const Meeting = require('./models/Meeting.cjs');
const Message = require('./models/Message.cjs');
const Rating = require('./models/Rating.cjs');
const Tag = require('./models/Tag.cjs');
const User = require('./models/User.cjs');

/**
 * ASSOCIATIONS
 */

User.belongsToMany(Tag, { through: 'user_tags' });
Tag.belongsToMany(User, { through: 'user_tags' });

Tag.belongsTo(Category);
Category.hasMany(Tag);

User.hasMany(Meeting);
Meeting.belongsTo(User);

/**
 * TODO: I commented out the senderId in messages model --
 * make sure the association/seeding works, and then go delete comments
 */
User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { foreignKey: 'senderId' });

Meeting.hasMany(Message);
Message.belongsTo(Meeting);

Meeting.hasMany(Rating);
Rating.belongsTo(Meeting);

Rating.belongsTo(User, { foreignKey: 'buddyId' });
User.hasMany(Rating, { foreignKey: 'buddyId' });

/**
 * USER INSTANCE METHODS
 * (placed here to avoid circular dependencies)
 */

User.prototype.avgRating = async () => {
  const scoreCount = await Rating.count({ where: { buddyId: this.id } });
  const scoreSum = await Rating.sum('rating', {
    where: { buddyId: this.id },
  });
  if (!scoreCount || !scoreSum >= 0) return null;
  return scoreSum / scoreCount;
};

User.prototype.meetingCount = async () => {
  const userCount = await Meeting.count({ where: { userId: this.id } });
  const buddyCount = await Meeting.count({ where: { buddyId: this.id } });
  return userCount + buddyCount;
};

User.prototype.reportCount = async () => {
  const count = await Rating.count({
    where: { buddyId: this.id, isReport: true },
  });
  return count || 0;
};

User.prototype.strikeCount = async () => {
  const count = await Rating.count({
    where: { buddyId: this.id, isReport: true, isUpheld: true },
  });
  return count || 0;
};

// pretty much just for testing

const testUserData = {
  firstName: 'Sheffy',
  lastName: 'Orwin',
  email: 'sorwin0@google.com.au',
  password: 'SFYTgvdMCu',
  age: 51,
  gender: 'M',
  address1: '459 Fuller Street',
  address2: null,
  city: 'El Paso',
  state: 'TX',
  lastLat: null,
  lastLong: null,
  zip: '79945',
  avatarURL: 'http://dummyimage.com/144x100.png/dddddd/000000',
  aboutMe: 'Other specified disorders of esophagus',
  isVerified: false,
  role: 'user',
  status: 'active',
};

const testUserCreate = async () => {
  await db.sync({ force: true });
  // let testUser = await User.create(ratingData);
  await db.close();
};

testUserCreate();

module.exports = {
  Category,
  Meeting,
  Message,
  Rating,
  Tag,
  User,
};
