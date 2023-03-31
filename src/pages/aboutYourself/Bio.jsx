import React, { useEffect, useState } from 'react';

const Bio = ({ setBio, bio, validBio }) => {
  return (
    <div className="relative mb-4 w-4/5">
      <label className="text-red-400 font-semibold block text-sm sm:text-base absolute -top-3 left-3 bg-white px-1">
        Bio
      </label>
      <textarea
        className={`w-full px-4 rounded-2xl focus:outline-none border border-slate-700 h-24 py-4 ${
          validBio ? '' : 'border-headers'
        }`}
        onChange={(e) => {
          localStorage.setItem('aboutBio', e.target.value);
          setBio(e.target.value);
        }}
        value={bio}
        placeholder={validBio ? '' : 'Please enter bio'}
      />
    </div>
  );
};

export default Bio;
