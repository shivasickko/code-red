import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EcoRewards = ({authToken}) => {
  const [userPoints, setUserPoints] = useState(0);
  const [rewardCode, setRewardCode] = useState('');
  //sample rewards to simulate
  const [rewards, setRewards] = useState( [
    {
      "id": 1,
      "brand": "Amazon",
      "offer": "₹500 off on eco-friendly products",
      "points": 400,
      "category": "Shopping",
      "validUntil": "2024-12-31"
    },
    {
      "id": 2,
      "brand": "Swiggy",
      "offer": "30% off on sustainable packaging restaurants",
      "points": 300,
      "category": "Food Delivery",
      "validUntil": "2024-12-31"
    },
    {
      "id": 3,
      "brand": "Flipkart",
      "offer": "₹200 off on recycled products",
      "points": 200,
      "category": "Shopping",
      "validUntil": "2024-12-31"
    },
    {
      "id": 4,
      "brand": "Apple",
      "offer": "1 month free Apple Music subscription",
      "points": 400,
      "category": "Entertainment",
      "validUntil": "2024-12-31"
    },
    {
      "id": 5,
      "brand": "Samsung",
      "offer": "10% off on energy-efficient appliances",
      "points": 400,
      "category": "Electronics",
      "validUntil": "2024-12-31"
    },
    {
      "id": 6,
      "brand": "Blinkit",
      "offer": "Free delivery on organic products",
      "points": 300,
      "category": "Grocery",
      "validUntil": "2024-12-31"
    },
    {
      "id": 7,
      "brand": "Zepto",
      "offer": "50% off on organic fruits and vegetables",
      "points": 400,
      "category": "Grocery",
      "validUntil": "2024-12-31"
    },
    {
      "id": 8,
      "brand": "Zomato",
      "offer": "40% off on eco-friendly restaurants",
      "points": 300,
      "category": "Food Delivery",
      "validUntil": "2024-12-31"
    },
    {
      "id": 9,
      "brand": "McDonald's",
      "offer": "Free upgrade to eco-friendly packaging",
      "points": 200,
      "category": "Food & Beverages",
      "validUntil": "2024-12-31"
    },
    {
      "id": 10,
      "brand": "Bamboo India",
      "offer": "25% off on bamboo essentials",
      "points": 300,
      "category": "Sustainable Living",
      "validUntil": "2024-12-31"
    },
    {
      "id": 11,
      "brand": "EcoStore",
      "offer": "₹200 off on biodegradable home products",
      "points": 250,
      "category": "Home & Living",
      "validUntil": "2024-12-31"
    },
    {
      "id": 12,
      "brand": "Urban Company",
      "offer": "20% off on eco-friendly cleaning services",
      "points": 350,
      "category": "Services",
      "validUntil": "2024-12-31"
    },
    {
      "id": 13,
      "brand": "BigBasket",
      "offer": "30% off on organic groceries",
      "points": 400,
      "category": "Grocery",
      "validUntil": "2024-12-31"
    },
    {
      "id": 14,
      "brand": "Starbucks",
      "offer": "Extra rewards on bringing reusable cups",
      "points": 200,
      "category": "Food & Beverages",
      "validUntil": "2024-12-31"
    },
    {
      "id": 15,
      "brand": "The Body Shop",
      "offer": "40% off on vegan beauty products",
      "points": 350,
      "category": "Beauty",
      "validUntil": "2024-12-31"
    }
  ]
);

  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const response = await axios.get('/user', {
            headers: {
              'x-auth-token': authToken,
            },
          }); // Adjust this endpoint
        setUserPoints(response.data.points);
      } catch (error) {
        console.error('Error fetching user points:', error);
      }
    };

    fetchUserPoints();
  }, []);

  const redeemReward = async (reward) => {
    if (userPoints < reward.points) {
      alert('You do not have enough points for this reward.');
      return;
    }

    try {
      const response = await axios.post(`/redeem-reward/${reward.id}`, {
        points: reward.points,
      });

      setUserPoints((prevPoints) => prevPoints - reward.points);
      setRewardCode(response.data.rewardCode); // Assuming reward code is returned
      alert(`Reward redeemed! Your reward code is: ${response.data.rewardCode}`);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('An error occurred while redeeming the reward.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl">
        <h2 className="text-3xl font-bold text-center text-green-600 mb-6">
          EcoRewards
        </h2>

        <div className="mb-4">
          <p className="text-lg text-center">
            Your Points: <span className="font-bold">{userPoints}</span>
          </p>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-blue-100 p-4 rounded-lg shadow-md flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold text-blue-600">
                  {reward.brand}
                </h3>
                <p className="text-sm text-gray-700 mt-2">{reward.offer}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Category: {reward.category}
                </p>
                <p className="text-sm text-gray-500">
                  Valid Until: {reward.validUntil}
                </p>
                <p className="text-lg font-bold text-green-600 mt-2">
                  Points Required: {reward.points}
                </p>
              </div>

              <button
                onClick={() => redeemReward(reward)}
                disabled={userPoints < reward.points}
                className={`mt-4 py-2 px-4 rounded-lg text-white ${
                  userPoints >= reward.points
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {userPoints >= reward.points ? 'Redeem Reward' : 'Insufficient Points'}
              </button>
            </div>
          ))}
        </div>

        {rewardCode && (
          <div className="bg-green-100 p-4 rounded-lg mt-6">
            <h3 className="text-xl font-semibold text-green-600">
              Your Reward Code
            </h3>
            <p className="text-lg font-bold">{rewardCode}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EcoRewards;
