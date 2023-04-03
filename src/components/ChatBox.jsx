import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getMeetingMessages, addMessage } from '../redux/slices/meetingSlice';
const PORT = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3333';

const socket = io.connect(PORT);

export default function ChatBox() {
  // used later for getting proper params
  const { meetingId } = useParams();
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = useState('');
  const meeting = useSelector((state) => state.meetings.meeting);
  const auth = useSelector((state) => state.auth.user);
  const today = new Date();
  const dayOfMonth = today.getUTCDate();
  const monthToday = today.getMonth();
  const yearToday = today.getUTCFullYear();

  useEffect(() => {
    const asyncStart = async () => {
      const token = localStorage.getItem('token');

      const disMeeting = await dispatch(
        getMeetingMessages({
          token: token,
          meetingId,
        })
      );
      socket.emit('joinRoom', disMeeting.payload.id);
    };
    asyncStart();
    setTimeout(() => {
      const scrollAnchor = document.getElementById('scroll-here');
      scrollAnchor?.scrollIntoView();
    }, 500);
  }, []);

  useEffect(() => {
    // REMOVE .OFF WHEN DEPLOYING OR ELSE WILL NEVER SEND MSG
    socket.on('recieve-message', (d) => {
      const asyncEvent = async () => {
        const token = localStorage.getItem('token');
        setTimeout(() => {
          dispatch(
            getMeetingMessages({
              token: token,
              meetingId,
            })
          );
        }, 500);
        setTimeout(() => {
          const scrollAnchor = document.getElementById('scroll-here');
          scrollAnchor.scrollIntoView();
        }, 800);
      };
      asyncEvent();
    });
  }, [socket]);

  const onMessageSubmit = async (e) => {
    e.preventDefault();
    if (newMessage === '') return;
    else {
      const token = localStorage.getItem('token');
      const message = await dispatch(
        addMessage({
          token,
          meetingId,
          newMessage: newMessage,
        })
      );
      if (message?.error?.message) {
        alert('An error has occurred. Please try again later.');
      } else {
        socket.emit('message-event', meeting.id);
        setNewMessage('');
      }
    }
  };

  const handleEnterClick = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      onMessageSubmit(e);
    }
  };
  // checks if user is logged in
  if (!auth.id) {
    return (
      <h1>
        Please{' '}
        <Link to="/login" style={{ color: '#0000EE' }}>
          login
        </Link>{' '}
        and find a buddy to use the chat feature
      </h1>
    );
  }
  // checks if user has a buddy
  if (meeting.buddyId === undefined) {
    return (
      <div className=" text-center">
        Please find a buddy to access the chat feature
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden h-[calc(100vh_-_48px)] orange-linear-bg">
      <div className="lg:w-2/5">
        <img
          src="assets/bgImg/chatView.jpg"
          alt="Two People eating a bowl of food with chopsticks!"
          className="hidden lg:block object-cover h-full w-full"
        />
      </div>
      <div className="flex flex-col h-[calc(100vh_-_72px)] w-full lg:w-3/5 ">
        <div className="lg:bg-[#c4c4c4] lg:bg-opacity-20 lg:h-full lg:rounded-xl lg:m-8 overflow-y-auto grow">
          <div className="">
            <h2 className="text-center font-tenor pt-4 text-lg">
              {meeting.user.firstName === auth.firstName
                ? meeting.buddy.firstName
                : meeting.user.firstName}
            </h2>
            <h2 className="text-center text-gray-500">
              {monthToday}-{dayOfMonth}-{yearToday}
            </h2>
          </div>
          <div className="grow m-1 p-5 overflow-y-auto h-[calc(100svh_-180px)]">
            {meeting?.messages < 1 || meeting?.messages === undefined ? (
              <div className=" text-center">
                Don't be shy! Be the first to talk to your buddy
              </div>
            ) : (
              <>
                <div>
                  {meeting.messages.map((message) => {
                    const url =
                      meeting.user.firstName === auth.firstName
                        ? meeting.buddy.avatarUrl
                        : meeting.user.avatarUrl;
                    return (
                      <div key={message.id} className="flex">
                        {message.senderId !== auth.id && (
                          <img
                            className="self-center mr-3 w-10 h-10 rounded-full"
                            src={url}
                            alt="buddy profile image"
                          ></img>
                        )}
                        <p
                          className={` py-2 px-4  min-w-[60px] text-center my-2  break-words font-poppins  font-light  text-sm ${
                            message.senderId === auth.id
                              ? 'bg-sender-message ml-auto text-white rounded-l-full rounded-tr-full  '
                              : 'bg-buddy-message rounded-r-full rounded-tl-full '
                          }`}
                        >
                          {message.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {/* ANCHOR MESSAGE SCROLL TO BOTTOM */}
                <div id="scroll-here"></div>
              </>
            )}
          </div>
        </div>
        <form
          id="form"
          className="w-11/12  self-center h-12 lg:flex gap-3 bg-transparent"
        >
          <textarea
            type="text"
            className=" border border-black w-full rounded-2xl h-16 py-2 px-6"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleEnterClick}
          />
          <button
            type="submit"
            className=" hover:bg-orange-100 px-3 rounded-lg transition-all ease-in-out"
            onClick={onMessageSubmit}
          ></button>
        </form>
      </div>
    </div>
  );
}
