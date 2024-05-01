import React, { createContext, useEffect, useCallback, useState, useReducer, useContext } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Callback from './Callback';
import Login from './Login';
import Layout from './Layout';

axios.defaults.withCredentials = true;

export const CounterContext = createContext();
const AuthContext = createContext();

const counterReducer = (state, action) => {
  switch (action.type) {
    case 'SET':
      return { ...state, [action.email]: { count: action.count, mycount: action.mycount } };
    case 'INCREMENT':
      return {
        ...state,
        [action.email]: { ...state[action.email], count: state[action.email].count + 1 }
      };
    case 'DECREMENT':
      return {
        ...state,
        [action.email]: { ...state[action.email], count: state[action.email].count - 1 }
      };
    case 'mySET':
      return {
        ...state,
        [action.email]: { ...state[action.email], mycount: action.mycount }
      };
    case 'myINCREMENT':
      return {
        ...state,
        [action.email]: { ...state[action.email], mycount: state[action.email].mycount + 1 }
      };
    case 'myDECREMENT':
      return {
        ...state,
        [action.email]: { ...state[action.email], mycount: state[action.email].mycount - 1 }
      };
    default:
      return state;
  }
};

const AuthContextProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(null);
  const [user, setUser] = useState(null);

  const checkLoginState = useCallback(async () => {
    try {
      const {
        data: { loggedIn: logged_in, user }
      } = await axios.get(`http://localhost:5000/auth/logged_in`);
      setLoggedIn(logged_in);
      user && setUser(user);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    checkLoginState();
  }, [checkLoginState]);

  return <AuthContext.Provider value={{ loggedIn, checkLoginState, user }}>{children}</AuthContext.Provider>;
};

const Home = () => {
  const { loggedIn, user } = useContext(AuthContext);
  if (loggedIn === true) return <Layout AuthContext={AuthContext} email={user.email} />;
  if (loggedIn === false) return <Login />;
  return <></>;
};

const router = createBrowserRouter([
  {
    path: '/*',
    element: <Home />,
  },
  {
    path: '/auth/callback',
    element: <Callback AuthContext={AuthContext} />,
  },
]);

function App() {
  const [state, dispatch] = useReducer(counterReducer, {});

  return (
    <AuthContextProvider>
      <CounterContext.Provider value={{ state, dispatch }}>
        <RouterProvider router={router} />
      </CounterContext.Provider>
    </AuthContextProvider>
  );
}

export default App;
