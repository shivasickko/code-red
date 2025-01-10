import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);

  const onChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': authToken,
        },
      });

      setItems(res.data.items);
    } catch (err) {
      console.error(err.response?.data?.msg || err.message);
      alert(err.response?.data?.msg || 'Error uploading image');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-200 flex flex-col items-center py-10">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-6">
        Carbon Footprint Analyzer
      </h2>
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Select an Image:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
        >
          Upload and Analyze
        </button>
      </form>

      {items.length > 0 && (
        <div className="mt-10 w-full max-w-2xl px-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Detected Items:
          </h3>
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li
                key={index}
                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-medium text-gray-800">
                    {item.item}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Carbon Emissions:{' '}
                    <span className="font-semibold">
                      {item.totalCarbonEmissions} kg CO₂e
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;