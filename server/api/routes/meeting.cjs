const router = require('express').Router();
const {
  Meeting,
  Message,
  Rating,
  Notification,
} = require('../../db/index.cjs');
const {
  requireToken,
  isAdmin,
  sameUserOrAdmin,
} = require('../authMiddleware.cjs');
const { Op } = require('sequelize');

router.post('/', requireToken, async (req, res, next) => {
  try {
    const userId = +req.user.id;
    const { buddyId, lunchDate, yelpBusinessId } = req.body;
    const bodyKeys = { buddyId, lunchDate, yelpBusinessId };
    for (let key in bodyKeys) {
      if (bodyKeys[key] === undefined || bodyKeys[key] === null)
        delete bodyKeys[key];
    }
    if (buddyId === undefined) {
      res.status(404).send('please provide a buddyId');
    } else {
      const [newMeeting, wasCreated] = await Meeting.findOrCreate({
        where: {
          [Op.or]: [{ userId: userId }, { buddyId: userId }],
          // isClosed: false,
          meetingStatus: 'confirmed',
        },
        defaults: { ...bodyKeys, meetingStatus: 'pending', userId: userId },
      });
      if (wasCreated === false) {
        res
          .status(409)
          .send(
            'Cannot create meeting: user already has confirmed meeting with this buddy'
          );
      } else {
        res.status(200).json(newMeeting);
      }
    }
  } catch (err) {
    next(err);
  }
});

router.put('/:meetingId', requireToken, async (req, res, next) => {
  const { isClosed, lunchDate, yelpBusinessId } = req.body;
  const bodyKeys = { isClosed, lunchDate, yelpBusinessId };
  for (let key in bodyKeys) {
    if (bodyKeys[key] === undefined || bodyKeys[key] === null)
      delete bodyKeys[key];
  }
  try {
    const meeting = await Meeting.findByPk(req.params.meetingId);
    if (meeting && meeting.userId !== req.user.id && !isClosed) {
      // prevent date / venue updates from "buddy"
      if (req.user.role !== 'admin')
        return res
          .status(403)
          .send('Only originator may change meeting details');
    }
    if (meeting) {
      res.json(await meeting.update(bodyKeys));
    } else {
      res.status(404).send('Meeting not found with id ' + req.params.meetingId);
    }
  } catch (err) {
    next(err);
  }
});

// only admins can get full past meeting info
router.get('/:meetingId', requireToken, async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.meetingId, {
      include: [
        { model: Message },
        {
          model: Rating,
          attributes: {
            exclude: ['rating', 'isReport', 'reportComment', 'reportIsUpheld'],
          },
        },
      ],
    });
    if (meeting) {
      res.json(meeting);
    } else {
      res.status(404).send('Meeting not found with id ' + req.params.meetingId);
    }
  } catch (err) {
    next(err);
  }
});

// only admins can remove past meetings
router.delete('/:meetingId', requireToken, isAdmin, async (req, res, next) => {
  try {
    const destroyCount = await Meeting.destroy({
      where: {
        id: req.params.meetingId,
      },
      limit: 1,
    });
    if (destroyCount > 0) {
      res
        .send(204)
        .status(`successfully removed meeting ${req.params.meetingId}`);
    } else {
      res.status(404).send(`meeting with ID ${req.params.meetingId} not found`);
    }
  } catch (err) {
    next(err);
  }
});

// want to check if user is logged in and user is in meeting
router.get('/:meetingId/messages', requireToken, async (req, res, next) => {
  try {
    const meeting = await Meeting.findByPk(req.params.meetingId, {
      include: [
        {
          association: 'user',
          attributes: ['firstName', 'lastName', 'fullName', 'avatarUrl'],
        },
        {
          association: 'buddy',
          attributes: ['firstName', 'lastName', 'fullName', 'avatarUrl'],
        },
        {
          model: Message,
        },
      ],
    });
    if (meeting) {
      if (
        req.user.id === meeting.userId ||
        req.user.id === meeting.buddyId ||
        req.user.role === 'admin'
      ) {
        res.json(meeting);
      } else {
        res.status(403).send('User is not found in meeting');
      }
    } else {
      res.status(404).send('Meeting not found with id ' + req.params.meetingId);
    }
  } catch (err) {
    next(err);
  }
});

router.post('/:meetingId/messages', requireToken, async (req, res, next) => {
  try {
    let correctRecip;
    const meeting = await Meeting.findByPk(req.params.meetingId);
    if (req.user.id === meeting.userId || req.user.id === meeting.buddyId) {
      if (req.user.id === meeting.userId) {
        correctRecip = meeting.buddyId;
      } else {
        correctRecip = meeting.userId;
      }
      const newMessage = await Message.create({
        recipientId: correctRecip,
        meetingId: req.params.meetingId,
        message: req.body.message,
        senderId: req.user.id,
      });
      if (newMessage) {
        res.status(200).json(newMessage);
      } else {
        res.status(404).send('message failed on creation');
      }
    } else {
      res.status(404).send(`User is not in meeting ${req.params.meetingId}`);
    }
  } catch (err) {
    next(err);
  }
});

// want to check if user is logged in and user is in meeting
router.post('/:meetingId/rating', requireToken, async (req, res, next) => {
  try {
    const { isReport, reportComment } = req.body;
    const bodyKeys = { isReport, reportComment };
    for (let key in bodyKeys) {
      if (bodyKeys[key] === undefined || bodyKeys[key] === null)
        delete bodyKeys[key];
    }
    let correctRecip;
    const meeting = await Meeting.findByPk(req.params.meetingId);
    if (req.user.id === meeting.userId || req.user.id === meeting.buddyId) {
      if (
        bodyKeys['isReport'] !== undefined &&
        bodyKeys['reportComment'] === undefined
      ) {
        res.status(409).send(`please include a reason for reporting`);
      } else if (
        bodyKeys['isReport'] === undefined &&
        bodyKeys['reportComment'] !== undefined
      ) {
        res
          .status(409)
          .send(`please change report to true or remove reportComment`);
      } else if (req.user.id === meeting.userId) {
        correctRecip = meeting.buddyId;
      } else {
        correctRecip = meeting.userId;
      }
      const [rating, wasCreated] = await Rating.findOrCreate({
        where: {
          meetingId: req.params.meetingId,
          userId: req.user.id,
        },
        defaults: {
          userId: req.user.id,
          buddyId: correctRecip,
          rating: req.body.rating,
          isReport: bodyKeys['isReport'],
          reportComment: bodyKeys['reportComment'],
        },
      });
      if (wasCreated === false) {
        res.status(409).send(`User already created a rating`);
      } else {
        // acknowledge related ratingRequested notification
        const ratingNotification = await Notification.update(
          { isAcknowledged: true },
          {
            where: {
              meetingId: meeting.id,
              toUserId: req.user.id,
              notificationType: 'ratingRequested',
            },
          }
        );
        console.log(
          'acknowledging rating request notification:',
          ratingNotification
        );
        res.status(200).json(rating);
      }
    } else {
      res.status(404).send(`User is not in meeting ${req.params.meetingId}`);
    }
  } catch (err) {
    next(err);
  }
});

router.put(
  '/rating/:ratingId',
  requireToken,
  isAdmin,
  async (req, res, next) => {
    try {
      const rating = await Rating.update(
        { reportIsUpheld: req.body.reportIsUpheld },
        {
          where: {
            id: req.params.ratingId,
            isReport: true,
          },
        }
      );
      if (typeof req.body.reportIsUpheld !== 'boolean') {
        res
          .status(400)
          .send('Please provide reportIsUpheld type boolean in body');
      }
      if (rating[0] !== 0) {
        res.status(200).json(rating);
      } else {
        res.status(404).send('Rating not found with id ' + req.params.ratingId);
      }
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
