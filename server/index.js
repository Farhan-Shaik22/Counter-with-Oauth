import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import queryString from 'query-string';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const config = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    redirectUrl: process.env.REDIRECT_URL,
    clientUrl: process.env.CLIENT_URL,
    tokenSecret: process.env.TOKEN_SECRET,
    tokenExpiration: 36000,
    postUrl: 'https://jsonplaceholder.typicode.com/posts',
};

const authParams = queryString.stringify({
    client_id: config.clientId,
    redirect_uri: config.redirectUrl,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    state: 'standard_oauth',
    prompt: 'consent',
});

const getTokenParams = (code) =>
    queryString.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUrl,
    });

const app = express();

app.use(
    cors({
        origin: [config.clientUrl],
        credentials: true,
    })
);

app.use(cookieParser());

mongoose.connect('mongodb://0.0.0.0:27017/counter_db')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

const counterSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    count: { type: Number, default: 0 },
    mycount: { type: Number, default: 0 }
}, { collection: 'counters' });

const Counter = mongoose.model('Counter', counterSchema);

const auth = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        jwt.verify(token, config.tokenSecret);
        return next();
    } catch (err) {
        console.error('Error: ', err);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Routes
app.get('/api/counter/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const counter = await Counter.findOne({ email });
        res.json(counter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/api/counter/increment/:email', async (req, res) => {
    const { email } = req.params;
    try {
        let counter = await Counter.findOne({ email });
        if (!counter) {
            counter = new Counter({ email });
        }
        counter.count++;
        await counter.save();
        res.json(counter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});
app.post('/api/counter/create/:email', async (req, res) => {
    const { email } = req.params; // Extract email from URL parameters
    try {
        // Check if a counter document already exists for the email
        let counter = await Counter.findOne({ email });
        
        // If no counter document exists, create a new one
        if (!counter) {
            counter = new Counter({ email });
            await counter.save();
        }
        
        res.json(counter); // Return the created or existing counter document
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});


app.post('/api/counter/myincrement/:email', async (req, res) => {
    const { email } = req.params;
    try {
        let counter = await Counter.findOne({ email });
        if (!counter) {
            counter = new Counter({ email });
        }
        counter.mycount++;
        await counter.save();
        res.json(counter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/api/counter/decrement/:email', async (req, res) => {
    const { email } = req.params;
    try {
        let counter = await Counter.findOne({ email });
        if (!counter) {
            counter = new Counter({ email });
        }
        counter.count--;
        await counter.save();
        res.json(counter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/api/counter/mydecrement/:email', async (req, res) => {
    const { email } = req.params;
    try {
        let counter = await Counter.findOne({ email });
        if (!counter) {
            counter = new Counter({ email });
        }
        counter.mycount--;
        await counter.save();
        res.json(counter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/auth/url', (_, res) => {
    res.json({
        url: `${config.authUrl}?${authParams}`,
    })
});

app.get('/auth/token', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: 'Authorization code must be provided' });
    try {
        const tokenParam = getTokenParams(code);
        const {
            data: { id_token },
        } = await axios.post(`${config.tokenUrl}?${tokenParam}`);
        if (!id_token) return res.status(400).json({ message: 'Auth error' });
        const { email, name, picture } = jwt.decode(id_token);
        const user = { name, email, picture };
        const token = jwt.sign({ user }, config.tokenSecret, { expiresIn: config.tokenExpiration });
        res.cookie('token', token, { maxAge: config.tokenExpiration, httpOnly: true });
        res.json({ user });
    } catch (err) {
        console.error('Error: ', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
});

app.get('/auth/logged_in', (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.json({ loggedIn: false });
        const { user } = jwt.verify(token, config.tokenSecret);
        const newToken = jwt.sign({ user }, config.tokenSecret, { expiresIn: config.tokenExpiration });
        res.cookie('token', newToken, { maxAge: config.tokenExpiration, httpOnly: true });
        res.json({ loggedIn: true, user });
    } catch (err) {
        res.json({ loggedIn: false });
    }
});

app.post('/auth/logout', (_, res) => {
    res.clearCookie('token').json({ message: 'Logged out' });
});

app.get('/user/posts', auth, async (_, res) => {
    try {
        const { data } = await axios.get(config.postUrl);
        res.json({ posts: data?.slice(0, 5) });
    } catch (err) {
        console.error('Error: ', err);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
