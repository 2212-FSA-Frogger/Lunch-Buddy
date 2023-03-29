import React from 'react';

export default function Location() {
  const getLocationJs = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      console.log(latitude, longitude);
    });
  };
  getLocationJs();
  return <div className="hidden">Location</div>;
}
