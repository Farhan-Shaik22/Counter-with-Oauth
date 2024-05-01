import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Row, Col } from 'antd';
import GoogleButton from 'react-google-button';
import OAuthImage from './assets/google_oauth.jpg';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Gets authentication url from backend server
      const {
        data: { url },
      } = await axios.get(`http://localhost:5000/auth/url`);
      // Navigate to consent screen
      console.log(url);
      window.location.assign(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='user-profile'>
      <div className='login-card'>
        <Row justify={'center'} align={'middle'} gutter={10}>
          <Col md={16} style={{ margin: '0px', display: 'flex', alignItems: 'center' }}>
            <img src={OAuthImage} className='OAuthImage' alt='OAuthImage' />
          </Col>
          <Col md={8}>
            <h2>Login</h2>
            <GoogleButton
              className='google-login-btn'
              type='light' // can be light or dark
              onClick={() => {
                handleLogin();
              }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Login;
