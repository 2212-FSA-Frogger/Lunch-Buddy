const router = require('express').Router();
const {
  requireToken,
  isAdmin,
  sameUserOrAdmin,
} = require('../authMiddleware.cjs');

const { User, Tag, Category } = require('../../db/index.cjs');
const locationSeed = require('../../utilities/locationSeed.cjs');
const { Op } = require('sequelize');

// user tag minimums
const MINIMUM_SOCIAL = 10;
const MINIMUM_PROFESSIONAL = 1;
const MINIMUM_CUISINE = 5;

router.get('/', requireToken, isAdmin, async (req, res, next) => {
  /**
   * GET /api/user
   * Admin-only: return a listing of all users
   */
  try {
    /**
     * TODO: pagination
     */
    const allUsers = await User.findAll({
      attributes: {
        exclude: ['password'],
      },
    });
    res.status(200).json(allUsers);
  } catch (err) {
    next(err);
  }
});
router.post('/local/demo/user', async (req, res, next) => {
  try {
    console.log(req.body.localUsers, req.body.center, req.body.radius);
    await User.update(
      {
        lastLong: req.body.center.longitude,
        lastLat: req.body.center.latitude,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    await locationSeed(
      req.body.localUsers,
      req.body.center,
      req.body.radius,
      req.body.city,
      req.body.dtate
    );
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});
//
router.get(
  '/:userId',
  requireToken,
  sameUserOrAdmin,
  async (req, res, next) => {
    /**
     * GET /api/user/:userId
     * return details of given user
     */
    try {
      const userId = +req.params.userId;

      const user = await User.findByPk(userId, {
        include: { model: Tag, include: Category },
        attributes: {
          exclude: ['password', 'avgRating', 'reportCount', 'strikeCount'],
        },
      });
      if (!user) return res.status(404).send(`No such user id: ${userId}`);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/', async (req, res, next) => {
  /**
   * POST /api/user
   * Create new user
   * Pass in array of tag ids
   */
  try {
    // destructure to filter out any other weird things that might be
    // passed along on the body object
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      gender,
      address1,
      address2,
      city,
      state,
      zip,
      avatarUrl,
      aboutMe,
      tags,
    } = req.body;

    // build up new user object, *excluding* tags
    // (we'll tack these on after initial user creation)
    const newUserData = {
      firstName,
      lastName,
      email,
      password,
      age,
      gender,
      address1,
      address2,
      city,
      state,
      zip,
      avatarUrl,
      aboutMe,
    };

    // clean up object for unrequired fields
    // reject for missing required fields
    for (let key of Object.keys(newUserData)) {
      if (
        (key === 'address2' || key === 'avatarUrl') &&
        newUserData[key] === undefined
      ) {
        delete newUserData[key];
      } else if (newUserData[key] === undefined) {
        return res
          .status(400)
          .send('Cannot create user: missing required information');
      }
    }

    // verify tags meet count-by-category requirements; reject if not

    const tagCollection = await Category.findAll({
      include: {
        model: Tag,
        where: {
          id: {
            [Op.in]: tags,
          },
        },
      },
    });

    let cats = tagCollection.map((cat) => cat.categoryName);
    if (
      !cats.includes('professional') ||
      !cats.includes('social') ||
      !cats.includes('cuisine')
    ) {
      return res
        .status(400)
        .send('Cannot create user: missing required tag category');
    }

    for (let i = 0; i < tagCollection.length; i++) {
      let currentCat = tagCollection[i].categoryName;
      let currentTagCount = tagCollection[i].tags.length;
      let meetsReq = true;

      if (currentCat === 'social' && currentTagCount < MINIMUM_SOCIAL)
        meetsReq = false;
      if (
        currentCat === 'professional' &&
        currentTagCount < MINIMUM_PROFESSIONAL
      )
        meetsReq = false;
      if (currentCat === 'cuisine' && currentTagCount < MINIMUM_CUISINE)
        meetsReq = false;

      if (!meetsReq)
        return res
          .status(400)
          .send('Cannot create user: minimum tag requirements not met');
    }

    // create user
    const newUser = await User.create(newUserData);
    await newUser.addTags(tags);

    const finalUser = await User.findByPk(newUser.id, {
      include: [Tag],
      attributes: {
        exclude: ['password', 'avgRating', 'reportCount', 'strikeCount'],
      },
    });

    // return new user info

    res.status(200).json(finalUser);
  } catch (err) {
    next(err);
  }
});

router.put(
  '/:userId',
  requireToken,
  sameUserOrAdmin,
  async (req, res, next) => {
    /**
     * PUT /api/user/:userId
     * Update user profile (normal profile fields)
     * If updating tags, *include full collection* of ids (not just adds)
     */
    try {
      const userId = +req.params.userId;

      // big destructure to filter out unwanted fields from user-provided inputs
      const {
        firstName,
        lastName,
        email,
        password,
        age,
        gender,
        address1,
        address2,
        city,
        state,
        zip,
        avatarUrl,
        aboutMe,
        tags,
        isVerified,
        role,
        status,
      } = req.body;

      const updatePackage = {
        firstName,
        lastName,
        email,
        password,
        age,
        gender,
        address1,
        address2,
        city,
        state,
        zip,
        avatarUrl,
        aboutMe,
        tags,
        isVerified,
        role,
        status,
      };

      // iterate over update package & strip out any missing fields

      for (let key of Object.keys(updatePackage)) {
        if (updatePackage[key] === undefined || updatePackage[key] === null)
          delete updatePackage[key];
      }

      // reject if non-admin attempting to change admin-only fields
      if (
        (updatePackage.isVerified !== undefined &&
          updatePackage.isVerified !== req.user.isVerified) ||
        updatePackage.role === 'admin' ||
        (updatePackage.status !== undefined &&
          !['active', 'inactive'].includes(updatePackage.status))
      ) {
        if (req.user.role !== 'admin')
          return res
            .status(403)
            .send('Requested changes require admin privileges');
      }

      /**
       * Check that tag collection meets minimum requirements per-category
       * (only need to do this if tags were passed in)
       */

      // convert passed-in tag IDs to tag collection grouped by category
      if (updatePackage.tags && updatePackage.tags.length > 0) {
        const tagCollection = await Category.findAll({
          include: {
            model: Tag,
            where: {
              id: {
                [Op.in]: tags,
              },
            },
          },
        });

        // check that required categories are all present
        let cats = tagCollection.map((cat) => cat.categoryName);
        if (
          !cats.includes('professional') ||
          !cats.includes('social') ||
          !cats.includes('cuisine')
        ) {
          return res
            .status(400)
            .send('Cannot update user: missing required tag category');
        }

        // iterate over category groups & check for minimum length
        for (let i = 0; i < tagCollection.length; i++) {
          let currentCat = tagCollection[i].categoryName;
          let currentTagCount = tagCollection[i].tags.length;
          let meetsReq = true;

          if (currentCat === 'social' && currentTagCount < MINIMUM_SOCIAL)
            meetsReq = false;
          if (
            currentCat === 'professional' &&
            currentTagCount < MINIMUM_PROFESSIONAL
          )
            meetsReq = false;
          if (currentCat === 'cuisine' && currentTagCount < MINIMUM_CUISINE)
            meetsReq = false;

          if (!meetsReq)
            return res
              .status(400)
              .send('Cannot update user: minimum tag requirements not met');
        }
      }

      // find requested user
      const userToUpdate = await User.findByPk(userId, {
        include: [Tag],
        attributes: { exclude: ['password'] },
      });

      if (!userToUpdate)
        return res
          .status(404)
          .send(`Cannot update: no such user id: ${userId}`);

      // make requested changes
      await userToUpdate.update(updatePackage);

      // return updated user
      const updatedUser = await User.findByPk(userToUpdate.id, {
        attributes: {
          exclude: ['password', 'avgRating', 'reportCount', 'strikeCount'],
        },
      });

      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:userId', requireToken, isAdmin, async (req, res, next) => {
  /**
   * DELETE /api/user/:userId
   * Admin-only: delete user account
   * presently having trouble with this: cannot delete where user
   * is present as a buddy in meeting table...
   */
  try {
    const userId = +req.params.userId;

    const destroyCount = await User.destroy({
      where: { id: userId },
      cascade: true,
      limit: 1,
    });

    if (destroyCount > 0) return res.sendStatus(204);
    else
      return res
        .status(404)
        .send(`Nothing deleted: no such user id: ${userId}`);
  } catch (err) {
    next(err);
  }
});

router.put(
  '/:userId/location',
  requireToken,
  sameUserOrAdmin,
  async (req, res, next) => {
    /**
     * PUT /api/user/:userId/location
     * Update user's lat/long location
     */
    try {
      const { lat, long } = req.body;
      const userId = +req.params.userId;

      if (lat === undefined || long === undefined) {
        return res
          .status(400)
          .send('Cannot update location: missing parameters');
      }

      const thisUser = await User.findByPk(userId, {
        attributes: {
          exclude: ['password'],
        },
      });

      if (!thisUser)
        return res
          .status(404)
          .send(`Cannot update location: no such user id: ${userId}`);

      await thisUser.update({ lastLat: lat, lastLong: long });
      res.status(200).send(thisUser);
    } catch (err) {
      next(err);
    }
  }
);

// split off Meeting section of User route into separate module
router.use('/:userId/meeting', require('./userMeeting.cjs'));

module.exports = router;
