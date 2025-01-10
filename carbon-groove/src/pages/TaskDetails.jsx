import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TaskDetails = ({ authToken }) => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [totalCO2, setTotalCO2] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(`/tasks/${taskId}`, {
          headers: {
            'x-auth-token': authToken,
          },
        });

        const fetchedTask = res.data.analysisData;
        setTask(fetchedTask);

        // Calculate total CO₂ emissions
        const totalEmissions = fetchedTask.reduce(
          (sum, item) => sum + parseFloat(item.totalCarbonEmissions.$numberDouble || item.totalCarbonEmissions),
          0
        );
        setTotalCO2(totalEmissions);
      } catch (err) {
        console.error(err.response?.data?.msg || err.message);
        setError(err.response?.data?.msg || 'Error fetching task details')
      }
    };

    fetchTask();
  }, [taskId, authToken]);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft((prevTime) => {
//         if (prevTime <= 1) {
//           clearInterval(timer);
//         //   alert('Time is up! The task has expired.');
//           navigate('/community-tasks'); // Redirect to community tasks
//           return 0;
//         }
//         return prevTime - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [navigate]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image to upload');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await axios.post(`/dispose/${taskId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': authToken,
        },
      });

      alert(`Verification successful! You have been rewarded ${res.data.points} points.`);
    //   navigate('/community-tasks'); // Redirect after successful submission
    } catch (err) {
      console.error(err.response?.data?.msg || err.message);
      setError(err.response?.data?.msg || 'Error verifying image')
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-6">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-6">
        {task ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-4 text-blue-700">Task Details</h2>
            <img
              src={`/uploads/trash/${task.initialImage}`}
              alt="Trash to Dispose"
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            {/* <p className="text-lg font-semibold text-gray-600 mb-2">
              <span className="text-gray-800">Time Left:</span> {formatTime(timeLeft)}
            </p> */}
            <p className="text-lg font-semibold text-gray-600 mb-2">
              <span className="text-gray-800">Total CO₂ Emissions:</span> {totalCO2.toFixed(2)} kg
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <ul>
                {task.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700 mb-2">
                    <strong>Description:</strong> {item.description}
                    <br />
                    <strong>CO₂ Contribution:</strong> {item.totalCarbonEmissions.$numberDouble || item.totalCarbonEmissions} kg
                  </li>
                ))}
              </ul>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
            />
            <button
              onClick={handleFileUpload}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Upload and Verify
            </button>
            <p className="text-center text-red-600 text-sm">{error}</p>
          </>
        ) : (
          <p className="text-center text-gray-600">Loading task details...</p>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;
