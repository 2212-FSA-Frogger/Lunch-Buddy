import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormButton from '../../components/FormButton';
import { useSelector, useDispatch } from 'react-redux';
import {
  requestLogin,
  successfulLogin,
  tryToken,
} from '../../redux/slices/authSlice';
import { selectAuthStatus } from '../../redux/slices/authSlice';

const inputs = {
  email: '',
  password: '',
};

const SignInForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formInputs, setFormInputs] = useState(inputs);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(requestLogin(formInputs));
    const authState = await dispatch(successfulLogin());
    if (authState.payload.error) {
      alert(authState.payload.error);
    } else {
      dispatch(tryToken());
      navigate('/');
    }
  };
  return (
    <div className="h-screen flex justify-center lg:grow items-center">
      <div className="w-full xs:w-4/5 sm:w-3/5 md:w-2/3">
        <form className="bg-white p-10 rounded-lg lg:w-3/4 mx-auto flex flex-col ">
          <h1 className="text-center text-2xl mb-6 text-red-400 font-bold font-sans">
            Sign In
          </h1>
          <div className="relative my-6">
            <label
              className="text-red-400 font-semibold block text-md absolute -top-3 left-3 bg-white px-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full px-4 py-2 rounded-lg focus:outline-none border border-gray-800"
              type="text"
              name="email"
              value={formInputs.email}
              onChange={(e) =>
                setFormInputs((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          <div className="relative mt-6">
            <label
              className="text-red-400 font-semibold block text-md absolute -top-3 left-3 bg-white px-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full px-4 py-2 rounded-lg focus:outline-none border border-gray-800"
              type="password"
              name="password"
              value={formInputs.password}
              onChange={(e) =>
                setFormInputs((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </div>
          <FormButton handleSubmit={handleSubmit}>Sign In</FormButton>
          <p className="my-4 text-xs sm:text-base text-center">
            Don't have an account? Create one{' '}
            <Link to={'/register'}>
              <span className="text-red-400 hover:underline">here</span>
            </Link>
          </p>
        </form>
      </div>
      <img
        className="w-1/2 hidden lg:block"
        src="/assets/bgImg/signInView.jpg"
        alt="top down image of 5 people reaching in to a table of food"
      />
    </div>
  );
};

export default SignInForm;
