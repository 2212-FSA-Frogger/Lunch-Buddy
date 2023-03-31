import React, { useState, useEffect } from 'react';
import Bio from './Bio';
import TagSelect from './TagSelect';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllTags } from '../../redux/slices/tagSlice';
import FormButton from '../../components/FormButton';
import {
  getTagsByCategory,
  shapeTagsForDB,
} from '../../utilities/registerHelpers';
import {
  createNewUser,
  selectUserLoading,
  selectUserError,
  checkUserCreated,
} from '../../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';

// user tag minimums
const MINIMUM_SOCIAL = 10;
const MINIMUM_PROFESSIONAL = 1;
const MINIMUM_CUISINE = 5;

const AboutForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userLoading = useSelector(selectUserLoading);
  const userError = useSelector(selectUserError);

  const [bio, setBio] = useState('' || localStorage.getItem('aboutBio'));

  const [socialTags, setSocialTags] = useState([]);
  const [professionalTags, setProfessionalTags] = useState([]);
  const [dietaryTags, setDietaryTags] = useState([]);
  const [cuisineTags, setCuisineTags] = useState([]);

  const [minTags, setMinTags] = useState({
    Social: { minimum: MINIMUM_SOCIAL, show: false, numClicked: 0 },
    Professional: { minimum: MINIMUM_PROFESSIONAL, show: false, numClicked: 0 },
    Dietary: { minimum: 0, show: false, numClicked: 0 },
    Cuisine: { minimum: MINIMUM_CUISINE, show: false, numClicked: 0 },
  });

  const [validBio, setValidBio] = useState(true);

  const tagsInState = useSelector((state) => state.tags.tags);

  useEffect(() => {
    const form = localStorage.getItem('registerForm');
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
    if (!form) {
      navigate('/register');
    } else {
      dispatch(fetchAllTags());
    }
  }, []);

  useEffect(() => {
    if (tagsInState.length > 0) {
      setSocialTags(
        JSON.parse(localStorage.getItem('Social')) ||
          getTagsByCategory('social', tagsInState) ||
          []
      );
      setProfessionalTags(
        JSON.parse(localStorage.getItem('Professional')) ||
          getTagsByCategory('professional', tagsInState || [])
      );
      setDietaryTags(
        JSON.parse(localStorage.getItem('Dietary')) ||
          getTagsByCategory('dietary restriction', tagsInState || [])
      );
      setCuisineTags(
        JSON.parse(localStorage.getItem('Cuisine')) ||
          getTagsByCategory('cuisine', tagsInState || [])
      );
    }
  }, [tagsInState]);

  // Handles creation of new user based on user inputs
  async function handleSubmit() {
    setValidBio(!!bio);

    for (let category in minTags) {
      const minTagsCopy = { ...minTags[category] };

      setMinTags((prev) => ({
        ...prev,
        [category]: {
          minimum: minTagsCopy.minimum,
          show: minTags[category].numClicked < minTags[category].minimum,
          numClicked: minTagsCopy.numClicked,
        },
      }));
    }

    const prevPageFormData = JSON.parse(
      window.localStorage.getItem('registerForm')
    );

    prevPageFormData.tags = shapeTagsForDB(
      socialTags,
      professionalTags,
      dietaryTags,
      cuisineTags
    );

    prevPageFormData.aboutMe = bio;

    if (prevPageFormData.address2 === '') {
      delete prevPageFormData.address2;
    }

    await dispatch(createNewUser(prevPageFormData));
    const { payload: errorOnCreation } = await dispatch(checkUserCreated());
    if (errorOnCreation.error) {
      console.log(errorOnCreation.error);
    } else {
      localStorage.removeItem('registerForm');
      localStorage.removeItem('aboutBio');
      localStorage.removeItem('Social');
      localStorage.removeItem('Cuisine');
      localStorage.removeItem('Dietary');
      localStorage.removeItem('Professional');
      navigate('/');
    }
  }

  return (
    <div className=" flex flex-col items-center justify-center w-screen mx-2">
      <h1 className="my-8 text-lg font-bold text-red-400">
        Tell us about yourself
      </h1>
      <Bio setBio={setBio} bio={bio} validBio={validBio} />
      <div className="lg:flex mr-4">
        <TagSelect
          tags={socialTags}
          setter={setSocialTags}
          category="Social"
          minTags={minTags}
          setMinTags={setMinTags}
        />
        <TagSelect
          tags={professionalTags}
          setter={setProfessionalTags}
          category="Professional"
          minTags={minTags}
          setMinTags={setMinTags}
        />
        <TagSelect
          tags={dietaryTags}
          setter={setDietaryTags}
          category="Dietary"
          minTags={minTags}
          setMinTags={setMinTags}
        />
        <TagSelect
          tags={cuisineTags}
          setter={setCuisineTags}
          category="Cuisine"
          minTags={minTags}
          setMinTags={setMinTags}
        />
      </div>
      <div className="sm:max-w-lg sm:min-w-[40%] w-full px-6">
        <FormButton handleSubmit={handleSubmit}>Submit</FormButton>
      </div>
    </div>
  );
};

export default AboutForm;
