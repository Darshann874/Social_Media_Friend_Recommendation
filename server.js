const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory user data and friendships
let users = [
  { id: 1, name: 'Alice', friends: [2, 3] },
  { id: 2, name: 'Bob', friends: [1, 4] },
  { id: 3, name: 'Charlie', friends: [1] },
  { id: 4, name: 'Diana', friends: [2] },
  { id: 5, name: 'Eve', friends: [] },
];

// Helper function to get mutual friend count
function mutualFriendsCount(userId, otherUserId) {
  const user = users.find(u => u.id === userId);
  const otherUser = users.find(u => u.id === otherUserId);
  if (!user || !otherUser) return 0;
  const mutuals = user.friends.filter(fid => otherUser.friends.includes(fid));
  return mutuals.length;
}

// Root route to confirm server is running
app.get('/', (req, res) => {
  res.send('Social Media Friend Recommendation API is running.');
});

// GET all users
app.get('/users', (req, res) => {
  res.json(users.map(u => ({ id: u.id, name: u.name })));
});

// GET friend recommendations for a user
app.get('/users/:id/recommendations', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const recommendations = users
    .filter(u => u.id !== userId && !user.friends.includes(u.id))
    .map(u => ({
      id: u.id,
      name: u.name,
      mutualFriends: mutualFriendsCount(userId, u.id)
    }))
    .sort((a, b) => b.mutualFriends - a.mutualFriends);

  res.json(recommendations);
});

// GET user's friends
app.get('/users/:id/friends', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const friends = user.friends.map(fid => {
    const f = users.find(u => u.id === fid);
    return { id: f.id, name: f.name };
  });
  res.json(friends);
});

// POST add friend
app.post('/users/:id/add-friend', (req, res) => {
  const userId = parseInt(req.params.id);
  const friendId = req.body.friendId;
  if (!friendId) return res.status(400).json({ error: 'friendId required' });

  const user = users.find(u => u.id === userId);
  const friend = users.find(u => u.id === friendId);
  if (!user || !friend) return res.status(404).json({ error: 'User or friend not found' });

  if (user.friends.includes(friendId)) {
    return res.status(400).json({ error: 'Already friends' });
  }

  user.friends.push(friendId);
  friend.friends.push(userId);

  res.json({ message: 'Friend added successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
