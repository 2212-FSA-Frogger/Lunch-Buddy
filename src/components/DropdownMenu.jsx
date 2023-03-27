import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuthUser, logOut } from '../redux/slices/authSlice';
import DropDownItem from './DropDownItem';

const DropdownMenu = ({ expandMenu, setExpandMenu }) => {
  const dispatch = useDispatch();
  const authUser = useSelector(selectAuthUser);

  function handleClick() {
    setExpandMenu(false);
  }

  function handleLogout() {
    setExpandMenu(false);
    dispatch(logOut());
  }

  return (
    <div className="h-screen absolute -bottom-screen bg-white w-screen opacity-95">
      {authUser.firstName && (
        <h2 className="text-red-400 ml-7 mt-2 text-lg">
          Hello, {authUser.firstName}
        </h2>
      )}
      <ul className="flex flex-col items-center">
        {!authUser.firstName ? (
          <>
            {/* NAV LINKS WHEN NOT SIGNED IN */}
            <DropDownItem handleClick={handleClick} linkTo="/register">
              Sign Up
            </DropDownItem>
            <DropDownItem handleClick={handleClick} linkTo="/login">
              Login
            </DropDownItem>
            <DropDownItem handleClick={handleClick} linkTo="/">
              Home
            </DropDownItem>
          </>
        ) : (
          <>
            {/* NAV LINKS WHEN SIGNED IN */}
            <DropDownItem handleClick={handleClick}>Account</DropDownItem>
            <DropDownItem handleClick={handleClick}>New Meeting</DropDownItem>
            <DropDownItem handleClick={handleClick}>Messages</DropDownItem>
            <DropDownItem handleClick={handleLogout}>Logout</DropDownItem>
            <DropDownItem handleClick={handleClick} linkTo="/">
              Home
            </DropDownItem>
          </>
        )}
      </ul>
    </div>
  );
};

export default DropdownMenu;
