import React, { useContext, useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import { CounterContext } from './App';

const CounterPage = ({ AuthContext }) => {
  const { state, dispatch } = useContext(CounterContext);
  const { user } = useContext(AuthContext);
  const [initialState, setInitialState] = useState({ count: 0, mycount: 0 });

  const fetchCounter = useCallback(async () => {
    try {
      if (!user || !user.email) return;
  
      const response = await axios.get(`http://localhost:5000/api/counter/${user.email}`);
      setInitialState({ count: response.data.count, mycount: response.data.mycount });
      dispatch({ type: 'SET', count: response.data.count });
      dispatch({ type: 'mySET', mycount: response.data.mycount });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch, user]);

  useEffect(() => {
    fetchCounter();
  }, [fetchCounter]);

  const incrementCounter = useCallback(async () => {
    try {
      await axios.post(`http://localhost:5000/api/counter/increment/${user.email}`);
      setInitialState(prevState => ({ ...prevState, count: prevState.count + 1 }));
      dispatch({ type: 'INCREMENT' });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch, user]);
  
  const decrementCounter = useCallback(async () => {
    try {
      await axios.post(`http://localhost:5000/api/counter/decrement/${user.email}`);
      setInitialState(prevState => ({ ...prevState, count: prevState.count - 1 }));
      dispatch({ type: 'DECREMENT' });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch, user]);
  
  const incrementMyCounter = useCallback(async () => {
    try {
      await axios.post(`http://localhost:5000/api/counter/myincrement/${user.email}`);
      setInitialState(prevState => ({ ...prevState, mycount: prevState.mycount + 1 }));
      dispatch({ type: 'myINCREMENT' });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch, user]);
  
  const decrementMyCounter = useCallback(async () => {
    try {
      await axios.post(`http://localhost:5000/api/counter/mydecrement/${user.email}`);
      setInitialState(prevState => ({ ...prevState, mycount: prevState.mycount - 1 }));
      dispatch({ type: 'myDECREMENT' });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch, user]);

  return (
      <div>
        <h2>Counter</h2>
        <p>Count: {initialState.count}</p>
        <button onClick={incrementCounter}>Increment Count</button>
        <button onClick={decrementCounter}>Decrement Count</button>
        <p>My Count: {initialState.mycount}</p>
        <button onClick={incrementMyCounter}>Increment My Count</button>
        <button onClick={decrementMyCounter}>Decrement My Count</button>
      </div>
  );
};

export default CounterPage;
