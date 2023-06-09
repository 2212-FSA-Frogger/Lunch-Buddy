import React, { useEffect, useRef } from 'react';
import { default as mapPinBlue } from '../assets/icons/map-pin-blue.png';

export default function MapComponent({ center, zoom, points }) {
  const ref = useRef();

  useEffect(() => {
    const map = new window.google.maps.Map(ref.current, {
      center,
      zoom,
    });

    const pin = new google.maps.Marker(
      {
        position: center,
        icon: {
          url: mapPinBlue,
          scaledSize: new google.maps.Size(20, 30),
        },
        title: 'You are here!',
      },
      []
    );
    pin.setMap(map);

    if (points.businesses?.length > 0) {
      for (let i = 0; i < points.businesses.length; i++) {
        const rest = new google.maps.Marker({
          position: {
            lat: points.businesses[i].coordinates.latitude,
            lng: points.businesses[i].coordinates.longitude,
          },
          title: points.businesses[i].name,
        });

        rest.setMap(map);
      }
    }
  }, [points]);

  return (
    <div
      className="w-96 aspect-square rounded-lg shadow-md lg:w-full lg:max-h-full"
      ref={ref}
      id="map"
    />
  );
}
