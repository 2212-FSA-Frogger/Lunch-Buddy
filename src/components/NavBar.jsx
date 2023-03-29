import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import bellIcon from '../assets/icons/notification.svg';
import DropdownMenu from './DropdownMenu';
import { selectAuthUser, tryToken } from '../redux/slices/authSlice';
import { fetchUser, updateUser } from '../redux/slices/userSlice';
import navbarIcon from '../assets/icons/navbar-icon.svg';
import xIcon from '../assets/icons/x-icon.svg';
import { getBusinessInfo } from '../redux/slices/meetingSlice';

const NavBar = () => {
  const [expandMenu, setExpandMenu] = useState(false);
  const dispatch = useDispatch();

  const authUser = useSelector(selectAuthUser);
  const userState = useSelector((state) => state.user.user);

  // THIS VARIABLE WILL HIDE OR SHOW THE DOT INDICATING NOTIFICATIONS
  const hasNotifications = true;

  // Turns off scroll when showing menu
  document.body.style.overflow = expandMenu ? 'hidden' : 'auto';

  function handleToggleStatus() {
    let newStatus;
    if (userState.status === 'active') {
      newStatus = 'inactive';
    } else if (userState.status === 'inactive') {
      newStatus = 'active';
    } else {
      alert('Sorry, currently your status is' + userState.status);
    }
    dispatch(updateUser({ status: newStatus }));
  }

  useEffect(() => {
    dispatch(tryToken());
  }, []);

  useEffect(() => {
    async function runDispatch() {
      if (authUser.firstName) {
        await dispatch(fetchUser(authUser.id));
      }
    }
    runDispatch();
  }, [authUser]);

  return (
    <header className="relative z-40 text-primary-gray">
      <nav className="flex border-b border-primary-gray p-4 justify-between bg-slate-50">
        <button className="h-8 flex justify-center items-center pt-1">
          <img
            className="w-8"
            src={expandMenu ? xIcon : navbarIcon}
            alt="Three lined menu icon button"
            onClick={() => setExpandMenu((prev) => !prev)}
          />
        </button>
        <button
          onClick={() => dispatch(getBusinessInfo('4xvuYoCRCdDBCvcGALUO3g'))}
        >
          Test get business
        </button>
        <ul className="flex items-center justify-center gap-8 text-center">
          {/* BUTTONS THAT SHOW ONLY WHEN SIGNED IN */}
          {authUser?.firstName ? (
            <>
              <li className="hidden md:block">
                <Link to="/account">
                  HI, {authUser.firstName.toUpperCase()}
                </Link>
              </li>

              <li className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={''}
                    className="sr-only peer"
                    checked={userState.status === 'active'}
                    onChange={handleToggleStatus}
                    // onClick={handleToggleStatus}
                  />
                  <div className="w-11 h-6 bg-white border rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-600 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-label peer-checked:border-white peer-checked:after:bg-white"></div>
                </label>
              </li>

              <li className="h-7 relative">
                <button
                  className={
                    hasNotifications &&
                    `after:content-[''] after:absolute after:top-1 after:right-1 after:text-red-400 after:bg-headers after:rounded-full after:w-2 after:h-2`
                  }
                >
                  <img
                    className="w-7 h-full"
                    src={bellIcon}
                    alt="Notification bell icon"
                  />
                </button>
              </li>
            </>
          ) : (
            //  WHEN NOT SIGNED IN SHOW BELOW
            <>
              <Link to="/">
                <h1 className="text-2xl">
                  LUNCH
                  <span className="font-clicker text-xl font-thin text-primary-gray">
                    buddy
                  </span>
                </h1>
              </Link>
            </>
          )}
        </ul>
      </nav>
      {/* DROPDOWN MENU, HIDDEN UNTIL CLICKED */}

      <DropdownMenu expandMenu={expandMenu} setExpandMenu={setExpandMenu} />
    </header>
  );
};

export default NavBar;
