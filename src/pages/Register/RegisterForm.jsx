import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FormButton from '../../components/FormButton';
import { listOfStates } from '../../utilities/registerHelpers';
import { INVALID_CLASS } from '../../utilities/invalidInputClass';

// setting a couple defaults here so we keep the starting value if we proceed without changing
const inputs = JSON.parse(localStorage.getItem('registerForm')) || {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  address1: '',
  address2: '',
  city: '',
  state: 'NY',
  zip: '',
  age: '18',
  gender: 'DidNotDisclose',
};

const requiredFields = [
  'firstName',
  'lastName',
  'email',
  'password',
  'confirmPassword',
  'address1',
  'city',
  'state',
  'zip',
  'age',
  'gender',
];

const RegisterForm = () => {
  const navigate = useNavigate();

  const [formInputs, setFormInputs] = useState(inputs);

  const [inputValidator, setInputValidator] = useState(
    requiredFields.reduce((accumulator, field) => {
      accumulator[field] = false;
      return accumulator;
    }, {})
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const missingFields = [];

    const tempFields = { ...formInputs };
    const tempValidator = requiredFields.reduce((accumulator, field) => {
      accumulator[field] = false;
      return accumulator;
    }, {});

    for (let field of requiredFields) {
      if (formInputs[field] === '') {
        missingFields.push(field);
        tempValidator[field] = true;
      }
      if (
        formInputs[field] !== '' &&
        field === 'email' &&
        !validateEmail(formInputs.email)
      ) {
        tempFields.email = '';
        tempValidator[field] = true;
        missingFields.push(field);
      }
      if (
        formInputs[field] !== '' &&
        field === 'password' &&
        !validatePassword()
      ) {
        tempFields.password = '';
        tempFields.confirmPassword = '';
        missingFields.push('password', 'confirmPassword');
        tempValidator[field] = true;
        tempValidator.confirmPassword = true;
      }
      if (
        formInputs[field] !== '' &&
        field === 'zip' &&
        !validateZip(formInputs.zip)
      ) {
        tempFields.zip = '';
        missingFields.push(field);
        tempValidator[field] = true;
      }
    }
    setInputValidator(tempValidator);
    setFormInputs(tempFields);

    if (
      missingFields.length > 0 &&
      Object.values(tempValidator).some((field) => field)
    ) {
      // console.log(missingFields.join(','));
      // alert(`Missing required fields: ${missingFields.join(', ')}`);
    } else {
      const inputsCopy = { ...formInputs };
      localStorage.setItem('registerForm', JSON.stringify(inputsCopy));
      navigate('/register/aboutyourself');
    }
  };

  const validateZip = (zip) => {
    const valid = /^\d+$/;
    return valid.test(zip);
  };

  const validateEmail = (email) => {
    // from https://www.w3docs.com/snippets/javascript/how-to-validate-an-e-mail-using-javascript.html
    let valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return valid.test(email);
  };

  const validatePassword = (password) => {
    return (
      formInputs.password.length >= 8 &&
      formInputs.password === formInputs.confirmPassword
    );
  };

  return (
    <div className=" flex justify-center lg:grow items-center h-[calc(100vh_-_75px)] overflow-hidden text-primary-gray">
      <div
        id="form-container"
        className="lg:basis-1/2 flex flex-col justify-center items-center  basis-full overflow-auto h-full pb-16 pt-24"
      >
        <div className="h-full lg:w-4/5 md:w-3/5 w-4/5">
          <form className="bg-white grid grid-cols-6 justify-center mx-4 gap-x-2 gap-y-6 lg:px-8 pb-6">
            <h1 className="text-center text-2xl mb-6 text-headers font-bold font-sans col-span-full">
              SIGN UP
            </h1>
            <div className="relative col-span-3 w-full">
              <label className="text-label font-semibold block text-xs  absolute -top-3 left-3 bg-white px-1">
                First Name
              </label>
              <input
                className={`${
                  inputValidator.firstName ? INVALID_CLASS : null
                }  w-full px-4 py-2 rounded-lg focus:outline-none h-10 border border-primary-gray`}
                placeholder={
                  inputValidator.firstName ? 'Enter first name' : null
                }
                value={formInputs.firstName}
                onChange={(e) =>
                  setFormInputs((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="relative col-span-3 w-full">
              <label className="text-label font-semibold block text-xs absolute -top-3 left-3 bg-white px-1">
                Last Name
              </label>
              <input
                className={`${
                  inputValidator.lastName ? INVALID_CLASS : null
                }  w-full px-4 py-2 rounded-lg focus:outline-none h-10 border border-primary-gray`}
                placeholder={inputValidator.lastName ? 'Enter last name' : null}
                value={formInputs.lastName}
                onChange={(e) =>
                  setFormInputs((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="relative col-span-full">
              <label className="text-label font-semibold block text-xs absolute -top-3 left-3 bg-white px-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required={true}
                className={`${
                  inputValidator.email ? INVALID_CLASS : null
                }  w-full px-4 py-2 rounded-lg focus:outline-none h-10 border border-primary-gray`}
                placeholder={inputValidator.email ? 'Enter email' : null}
                value={formInputs.email}
                onChange={(e) =>
                  setFormInputs((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="relative col-span-full">
              <label className="text-label font-semibold block text-xs absolute -top-3 left-3 bg-white px-1">
                Password
              </label>
              <input
                type="password"
                className={`${
                  inputValidator.password ? INVALID_CLASS : null
                }  w-full px-4 py-2 rounded-lg focus:outline-none h-10 border border-primary-gray`}
                placeholder={inputValidator.password ? 'Enter password' : null}
                value={formInputs.password}
                onChange={(e) =>
                  setFormInputs((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
            </div>
            <div className="relative col-span-full">
              <label className="text-label font-semibold block text-xs absolute -top-3 left-3 bg-white px-1">
                Confirm Password
              </label>
              <input
                type="password"
                className={`${
                  inputValidator.confirmPassword ? INVALID_CLASS : null
                }  w-full px-4 py-2 rounded-lg focus:outline-none h-10 border border-primary-gray`}
                placeholder={
                  inputValidator.confirmPassword ? 'Confirm password' : null
                }
                value={formInputs.confirmPassword}
                onChange={(e) =>
                  setFormInputs((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
            </div>
            <div className="relative col-span-4">
              <label className="text-label font-semibold block text-xs absolute -top-3 left-3 bg-white px-1">
                Address 1
              </label>
              <input
                className={`${
                  inputValidator.address1 ? INVALID_CLASS : null
                }  w-full px-4 py-2 rounded-lg focus:outline-none h-10 border border-primary-gray`}
                placeholder={inputValidator.address1 ? 'Enter address' : null}
                value={formInputs.address1}
                onChange={(e) =>
                  setFormInputs((prev) => ({
                    ...prev,
                    address1: e.target.value,
                  }))
                }
              />
            </div>
            <div className="relative col-span-2">
              <label className="text-label font-semibold block text-xs absolute -top-3 left-3 bg-white px-1">
                Address 2
              </label>
              <input
                className="w-full px-4 py-2 rounded-lg focus:outline-none h-10 border border-primary-gray"
                value={formInputs.address2}
                onChange={(e) =>
                  setFormInputs((prev) => ({
                    ...prev,
                    address2: e.target.value,
                  }))
                }
              />
            </div>
            <div className="relative col-span-4">
              <label className="text-label font-semibold block text-xs absolute -top-3 left-3 bg-white px-1">
                City
              </label>
              <input
                className={`${
                  inputValidator.city ? INVALID_CLASS : null
                }  w-full px-4 py-2 rounded-lg focus:outline-none h-10 border border-primary-gray`}
                placeholder={inputValidator.city ? 'Enter city' : null}
                value={formInputs.city}
                onChange={(e) =>
                  setFormInputs((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>
            <div className="relative col-span-2">
              <label className="text-label font-semibold block text-xs absolute -top-3 left-3 bg-white px-1">
                State
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg focus:outline-none h-10 border border-primary-gray text-xs bg-white"
                onChange={(e) =>
                  setFormInputs((prev) => ({ ...prev, state: e.target.value }))
                }
                defaultValue={inputs.state}
              >
                {listOfStates.map((state) => {
                  return (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="relative col-span-2">
              <label className="text-label font-semibold block text-xs absolute -top-3 left-3 bg-white px-1">
                Zip
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                name="zip"
                minLength="5"
                maxLength="9"
                className={`${
                  inputValidator.zip ? INVALID_CLASS : null
                }  w-full px-4 py-2 rounded-lg focus:outline-none h-10 border border-primary-gray`}
                placeholder={inputValidator.zip ? 'Enter zip' : null}
                value={formInputs.zip}
                onChange={(e) =>
                  setFormInputs((prev) => ({ ...prev, zip: e.target.value }))
                }
              />
            </div>
            <div className="relative col-span-2">
              <label className="text-label font-semibold block text-xs absolute -top-3 left-3 bg-white px-1">
                Age
              </label>
              <input
                type="number"
                className={`${
                  inputValidator.age ? INVALID_CLASS : null
                }  w-full px-4 py-2 rounded-lg focus:outline-none h-10 border border-primary-gray text-xs focus:border-primary-gray active:border-primary-gray active:ring-primary-gray focus:ring-primary-gray outline-0 focus:bg-white`}
                value={formInputs.age || 18}
                min={18}
                max={119}
                onChange={(e) =>
                  setFormInputs((prev) => ({ ...prev, age: e.target.value }))
                }
              />
            </div>
            <div className="relative col-span-2">
              <label className="text-label font-semibold block text-xs absolute -top-3 left-3 bg-white px-1">
                Gender
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg focus:outline-none text-xs h-10 border border-primary-gray bg-white"
                onChange={(e) =>
                  setFormInputs((prev) => ({ ...prev, gender: e.target.value }))
                }
                defaultValue={inputs.gender}
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
                <option value="DidNotDisclose">Prefer Not To Say</option>
              </select>
            </div>
            <div className="col-span-full md:w-3/5 md:mx-auto">
              <FormButton handleSubmit={handleSubmit}>CONTINUE</FormButton>
            </div>
          </form>
          <p className="text-center">
            already have an account?{' '}
            <Link to="/login">
              <span className="text-headers hover:underline">sign in</span>
            </Link>
          </p>
        </div>
      </div>
      <div
        id="bg-img"
        className="bg-cover 
        bg-[url('/assets/bgImg/signUpView.jpg')] basis-1/2 hidden lg:block h-full"
        alt="person smearing a dip on toast, at a restaurant with wine, plates, coffee"
      ></div>
    </div>
  );
};

export default RegisterForm;
