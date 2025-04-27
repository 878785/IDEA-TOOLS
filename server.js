const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Static public folder
app.use(express.static('public'));
app.use(express.json());

// Load database files
let codes = require('./codes.json');
let accounts = require('./accounts.json');
let ideas = require('./ideas.json');

// Verify Payment Code
app.post('/verify-code', (req, res) => {
    const { code } = req.body;
    if (codes.includes(code)) {
        return res.json({ success: true });
    } else {
        return res.json({ success: false });
    }
});

// Fetch Ideas Based on Type
app.get('/get-ideas/:type', (req, res) => {
    const type = req.params.type;
    if (ideas[type]) {
        return res.json({ ideas: ideas[type] });
    } else {
        return res.json({ ideas: [] });
    }
});

// Add New Idea and Calculate Coins
app.post('/add-idea', (req, res) => {
    const { idea } = req.body;
    if (!ideas.userIdeas) {
        ideas.userIdeas = [];
    }
    ideas.userIdeas.push(idea);

    // 1000 ideas = 1 coin
    const totalUserIdeas = ideas.userIdeas.length;
    const coinsEarned = Math.floor(totalUserIdeas / 1000);

    // Save ideas back to file
    fs.writeFileSync('./ideas.json', JSON.stringify(ideas, null, 2));

    return res.json({ success: true, coins: coinsEarned });
});

// Withdraw Coins
app.post('/withdraw', (req, res) => {
    const { email } = req.body;
    const user = accounts.find(acc => acc.email === email);

    if (user) {
        // For now, just return success
        return res.json({ success: true, message: 'Withdrawal Successful! 1000 coins = 10₹' });
    } else {
        return res.json({ success: false, message: 'Account not found!' });
    }
});

// Register New User
app.post('/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
        return res.json({ success: false, message: 'All fields are required!' });
    }
    
    const existingUser = accounts.find(acc => acc.email === email);
    if (existingUser) {
        return res.json({ success: false, message: 'Email already registered!' });
    }

    accounts.push({ name, email, phone, password, coins: 0 });
    fs.writeFileSync('./accounts.json', JSON.stringify(accounts, null, 2));

    return res.json({ success: true, message: 'Account created successfully!' });
});

// AI Body Create based on description
app.post('/generate-custom-body', (req, res) => {
    const { description } = req.body;
    if (!description) {
        return res.json({ success: false, message: 'Description is required!' });
    }

    const randomId = Math.floor(Math.random() * 1000);
    const imageUrl = `https://api.dicebear.com/8.x/adventurer/png?seed=${encodeURIComponent(description)}-${randomId}`;

    return res.json({ success: true, imageUrl });
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
