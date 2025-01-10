// CommunityPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommunityPage = ({ authToken }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('/available-tasks', {
          headers: {
            'x-auth-token': authToken,
          },
        });
        setTasks(res.data.tasks);
      } catch (err) {
        console.error(err.response.data.msg);
        alert(err.response.data.msg);
      }
    };

    fetchTasks();
  }, [authToken]);

  const acceptTask = async (taskId) => {
    try {
      await axios.post(`/accept-community-task/${taskId}`, {}, {
        headers: {
          'x-auth-token': authToken,
        },
      });
      alert('Task accepted. Please dispose of the trash.');
      // Optionally refresh tasks
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (err) {
      console.error(err.response.data.msg);
      alert(err.response.data.msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Community Tasks</h2>
        {tasks.length > 0 ? (
          <ul>
            {tasks.map((task) => (
              <li key={task._id} className="mb-4 p-4 border rounded">
                <p><strong>Task ID:</strong> {task._id}</p>
                <p><strong>Location:</strong> {task.location.coordinates.join(', ')}</p>
                <button
                  onClick={() => acceptTask(task._id)}
                  className="mt-2 bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                >
                  Accept Task
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center">No available tasks at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;