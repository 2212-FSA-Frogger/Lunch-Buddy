import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Link, useNavigate } from 'react-router-dom';
import { getMeeting, selectMeetings } from '../../redux/slices';
import {
  getBusinessInfo,
  updateMeeting,
} from '../../redux/slices/meetingSlice';
import FormButton from '../../components/FormButton';
import { updateNotificationStatus, cancelMeeting } from '../../redux/slices';
import { fetchAllNotifications } from '../../redux/slices';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const POST_NOTIFICATION_TIMEOUT = 5000;

export default function MeetingRequest({ notification, setPreventClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const meetings = useSelector(selectMeetings);

  const token = window.localStorage.getItem('token');
  const [response, setResponse] = useState(null);

  useEffect(() => {
    dispatch(
      getMeeting({
        meetingId: notification.meeting.id,
        userId: notification.toUser.id,
      })
    );
    if (notification.meeting.yelpBusinessId)
      dispatch(getBusinessInfo(notification.meeting.yelpBusinessId));
  }, [notification]);

  const yelpBusinessId = notification.meeting.yelpBusinessId;
  const yelpBusinessAddress =
    meetings.business[yelpBusinessId]?.location.display_address.join(', ');

  console.log('meeting', meetings.business);

  const localRedirect = (linkTo) => {
    navigate(linkTo);
    setTimeout(() => {
      dispatch(fetchAllNotifications({ userId: notification.toUser.id }));
    }, 500);
  };

  const handleAccept = async () => {
    setResponse('accepted');
    console.log('trying to prevent close...');
    setPreventClose(true);

    await axios.put(
      API_URL +
        `/api/user/${notification.toUser.id}/meeting/${notification.meeting.id}/confirm`,
      {},
      { headers: { authorization: token } }
    );

    setTimeout(async () => {
      dispatch(
        updateNotificationStatus({
          userId: notification.toUserId,
          notificationId: notification.id,
          updates: { isAcknowledged: true },
        })
      );

      setPreventClose(false);

      setTimeout(() => {
        dispatch(fetchAllNotifications({ userId: notification.toUser.id }));
      }, 500);
    }, POST_NOTIFICATION_TIMEOUT);
  };

  const handleReject = () => {
    setResponse('rejected');

    setTimeout(() => {
      dispatch(
        updateNotificationStatus({
          userId: notification.toUserId,
          notificationId: notification.id,
          updates: { isAcknowledged: true },
        })
      );

      dispatch(
        cancelMeeting({
          userId: notification.toUserId,
          meetingId: notification.meetingId,
        })
      );

      setTimeout(() => {
        dispatch(fetchAllNotifications({ userId: notification.toUser.id }));
      }, 500);
    }, POST_NOTIFICATION_TIMEOUT);
  };

  // Render one thing before accept/reject, render another thing after
  return (
    <React.Fragment>
      {response === null && (
        <div
          id="meeting-card"
          className="flex w-full h-fit bg-gray-100/90 rounded-2xl drop-shadow-sm my-3 items-center justify-between "
        >
          <div id="img-section" className="px-2 h-28 shrink-0">
            <img
              src={notification.fromUser.avatarUrl}
              alt="user avatar"
              className="object-cover  aspect-square w-20 h-20 rounded-[100%] z-10 bg-white p-1  drop-shadow-lg relative translate-y-[30%] "
            />
          </div>
          <div
            id="notification-details"
            className="flex flex-col self-center text-center text-xs w-full py-2"
          >
            <p className="pb-2">new buddy wants to connect</p>
            <p>{notification.fromUser.fullName.toUpperCase()}</p>
            <p>{new Date(notification.meeting.lunchDate).toLocaleString()}</p>
            <p>
              {notification.meeting?.yelpBusinessId &&
                meetings.business[yelpBusinessId]?.name}
            </p>
            <p>{notification.meeting?.yelpBusinessId && yelpBusinessAddress}</p>
            <div
              id="btn-container"
              className="flex flex-row gap-2 w-fit h-fit self-center text-xs space-5 justify-center items-center"
            >
              <FormButton handleSubmit={handleAccept}>ACCEPT </FormButton>
              <FormButton handleSubmit={handleReject}>REJECT </FormButton>
            </div>
          </div>
        </div>
      )}
      {response === 'accepted' && (
        <div
          id="meeting-card"
          className="flex w-full h-fit bg-gray-100/90 rounded-2xl drop-shadow-sm my-3 items-center justify-between "
        >
          <div id="img-section" className="px-2 h-28 shrink-0">
            <img
              src={notification.fromUser.avatarUrl}
              alt="user avatar"
              className="object-cover  aspect-square w-20 h-20 rounded-[100%] z-10 bg-white p-1  drop-shadow-lg relative translate-y-[30%] "
            />
          </div>
          <div
            id="notification-details"
            className="flex flex-col self-center text-center text-base w-full py-2"
          >
            <p className="pb-2">
              ok! we'll let {notification.fromUser.firstName} know you're in!
            </p>

            {notification.meeting?.yelpBusinessId && (
              <p>
                Meanwhile, check out{' '}
                <a
                  target="_blank"
                  href={meetings.business[yelpBusinessId]?.url}
                  className="text-headers"
                >
                  {meetings.business[yelpBusinessId]?.name}
                </a>
                !
              </p>
            )}
            {/* <div
              id="btn-container"
              className="flex flex-row gap-2 w-fit h-fit self-center text-xs space-5 justify-center items-center"
            >
              <FormButton handleSubmit={}>HOME</FormButton>
              <FormButton handleSubmit={}>MESSAGE {notification.fromUser.firstName}</FormButton>
            </div> */}
          </div>
        </div>
      )}
      {response === 'rejected' && (
        <div
          id="meeting-card"
          className="flex w-full h-fit bg-gray-100/90 rounded-2xl drop-shadow-sm my-3 items-center justify-between "
        >
          <div
            id="notification-details"
            className="flex flex-col self-center text-center text-xs w-full py-2"
          >
            <p className="pb-2 text-base">
              too bad -- we'll break it to {notification.fromUser.firstName}{' '}
              gently...
            </p>
            <div
              id="btn-container"
              className="flex flex-row gap-2 w-fit h-fit self-center text-xs space-5 justify-center items-center"
            >
              <FormButton handleSubmit={() => localRedirect('/')}>
                HOME
              </FormButton>
              <FormButton handleSubmit={() => localRedirect('/match')}>
                FIND A BUDDY
              </FormButton>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

// <button id="accept-btn" className="flex items-end button">
//       ACCEPT
//     </button>
//     <button id="reject-btn" className="flex items-end">
//       REJECT
//     </button>
