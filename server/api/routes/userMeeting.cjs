const { Op } = require('sequelize');
const router = require('express').Router({ mergeParams: true });
const { Meeting, User } = require('../../db/index.cjs');
const { requireToken, sameUserOrAdmin } = require('../authMiddleware.cjs');
const validUser = require('../validUserMiddleware.cjs');

const { SAFE_USER_FIELDS } = require('../../constants.cjs');

router.get(
  '/',
  requireToken,
  sameUserOrAdmin,
  validUser,
  async (req, res, next) => {
    /**
     * GET /api/user/:userId/meeting
     * return a list of all meetings associated with userId
     */
    try {
      const userMeetings = await Meeting.findAll({
        where: {
          [Op.or]: [
            { userId: req.params.userId },
            { buddyId: req.params.userId },
          ],
        },
        include: [
          {
            association: 'user',
            attributes: SAFE_USER_FIELDS,
          },
          {
            association: 'buddy',
            attributes: SAFE_USER_FIELDS,
          },
        ],
      });
      res.status(200).json(userMeetings);
    } catch (error) {
      console.error('Error retrieving meetings, please try again later.');
      next(error);
    }
  }
);

router.get(
  '/:meetingId',
  requireToken,
  sameUserOrAdmin,
  validUser,
  async (req, res, next) => {
    /**
     * GET /api/user/:userId/meeting/:meetingId
     * get details of a single meeting
     */
    try {
      const meeting = await Meeting.findOne({
        where: {
          [Op.or]: [
            { userId: req.params.userId },
            { buddyId: req.params.userId },
          ],
          id: req.params.meetingId,
        },
        include: [
          {
            association: 'user',
            attributes: SAFE_USER_FIELDS,
          },
          {
            association: 'buddy',
            attributes: SAFE_USER_FIELDS,
          },
        ],
      });
      if (!meeting) {
        return res
          .status(404)
          .send('No meeting found matching this user and meetingId.');
      } else if (
        req.user.id !== meeting.userId &&
        req.user.id !== meeting.buddyId &&
        req.user.role !== 'admin'
      ) {
        res.status(403).send('You are unable to view this meeting.');
      } else {
        res.status(200).json(meeting);
      }
    } catch (error) {
      console.error(
        'Error trying to view meeting date. Please try again later.'
      );
      next(error);
    }
  }
);

router.put(
  '/:meetingId/date',
  requireToken,
  sameUserOrAdmin,
  validUser,
  async (req, res, next) => {
    /**
     * PUT /api/user/:userId/meeting/:meetingId/date
     * update date of given meeting ID
     */
    const { lunchDate } = req.body;
    try {
      const meeting = await Meeting.findOne({
        where: {
          [Op.or]: [
            { userId: req.params.userId },
            { buddyId: req.params.userId },
          ],
          id: req.params.meetingId,
        },
      });
      if (!meeting) {
        return res
          .status(404)
          .send('No meeting found matching user and meetingId to update.');
      } else if (req.user.id !== meeting.userId && req.user.role !== 'admin') {
        res.status(403).send('You are unable to edit this meeting.');
      } else {
        const updatedMeeting = await meeting.update({ lunchDate });
        res.status(200).json(updatedMeeting);
      }
    } catch (error) {
      console.error(
        'Error trying to change meeting date. Please try again later.'
      );
      next(error);
    }
  }
);

router.put(
  '/:meetingId/confirm',
  requireToken,
  sameUserOrAdmin,
  async (req, res, next) => {
    try {
      const meetingToUpdate = await Meeting.findByPk(+req.params.meetingId);
      await meetingToUpdate.update({ meetingStatus: 'confirmed' });

      res.status(200).json(meetingToUpdate);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:meetingId/cancel',
  requireToken,
  sameUserOrAdmin,
  validUser,
  async (req, res, next) => {
    /**
     * PUT /api/user/:userId/meeting/:meetingId/cancel
     * set meeting status to 'closed'
     */
    try {
      const userId = +req.params.userId;

      const meeting = await Meeting.findOne({
        where: {
          [Op.or]: [{ userId: userId }, { buddyId: userId }],
          id: req.params.meetingId,
        },
      });

      if (!meeting) {
        return res
          .status(404)
          .send('No meeting found matching user and meetingId to cancel.');
      } else if (
        req.user.id !== meeting.userId &&
        req.user.id !== meeting.buddyId &&
        req.user.role !== 'admin'
      ) {
        res.status(403).send('You are unable to edit this meeting.');
      } else {
        // determine notification type based on pre-updated meeting status + sender
        let notificationType;
        if (meeting.status === 'confirmed' || meeting.userId === userId) {
          notificationType = 'meetingCancelled';
        } else {
          notificationType = 'inviteRejected';
        }
        const updatedMeeting = await meeting.update({
          meetingStatus: 'cancelled',
        });

        await meeting.createNotification({
          toUserId:
            meeting.userId === userId ? meeting.buddyId : meeting.userId,
          fromUserId: userId,
          notificationType,
        });

        // clear out now-outdated notifications

        // const oldNotifications = await Notification.findAll({
        //   where: {
        //     toUser:
        //   }
        // })

        res.status(200).json(updatedMeeting);
      }
    } catch (error) {
      console.error('Error trying to cancel meeting. Please try again later.');
      next(error);
    }
  }
);

module.exports = router;
