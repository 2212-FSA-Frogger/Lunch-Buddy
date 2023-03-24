import { Route, Routes } from 'react-router-dom';
import './App.css';
import MockResponsive from './components/MockResponsive';
import {
  MeetingSetup,
  BuddyList,
  MeetingRecap,
  RestaurantSuggestions,
  UserAccount
} from './pages';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<MockResponsive />}></Route>
        <Route path="/account" element={<UserAccount />}></Route>
        <Route path="/test" element={<MeetingSetup />}></Route>
        <Route path="/match" element={<RestaurantSuggestions />}></Route>
        <Route path="/match/results" element={<BuddyList />}></Route>
        <Route
          path="/match/restaurants"
          element={<RestaurantSuggestions />}
        ></Route>
        <Route path="/match/confirm" element={<MeetingRecap />}></Route>
      </Routes>
    </div>
  );
}

export default App;
