import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';

const CounterHome = ({ AuthContext }) => {
  const { user } = useContext(AuthContext);
  const [counterData, setCounterData] = useState({ count: 0, mycount: 0 });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !user.email) return;

        const response = await axios.get(`http://localhost:5000/api/counter/${user.email}`);
        const counter = response.data;

        if (!counter) {
          const newCounterResponse = await axios.post(`http://localhost:5000/api/counter/create/${user.email}`);
          setCounterData(newCounterResponse.data);
        } else {
          setCounterData(counter);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching or creating counter data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Count: {counterData.count}</h1>
      <h1>My Count: {counterData.mycount}</h1>
    </div>
  );
};

export default CounterHome;
