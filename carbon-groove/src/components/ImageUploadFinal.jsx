// UploadTrash.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadTrash = ({ authToken }) => {
  const [file, setFile] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const navigate = useNavigate();

  const onChange = (e) => {
    setFile(e.target.files[0]);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to retrieve location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!file || !latitude || !longitude) {
      alert('Please select an image and ensure location access is granted.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);

    try {
      const res = await axios.post('/upload-trash', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': authToken,
        },
      });

      alert(res.data.msg);
      navigate(`/task-details/${res.data.taskId}`); 
    } catch (err) {
      console.error(err.response?.data?.msg || err.message);
      alert(err.response?.data?.msg || 'Error uploading image');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Upload Trash</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Select an Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={onChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            type="button"
            onClick={getLocation}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 mb-4"
          >
            Get Current Location
          </button>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadTrash;