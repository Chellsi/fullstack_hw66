import bcrypt from 'bcryptjs';

const initialUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  },
  {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    password: bcrypt.hashSync('user123', 10),
    role: 'user'
  }
];

const users = [...initialUsers];

export function findUserByEmail(email) {
  return users.find((user) => user.email === email) || null;
}

export function findUserByUsername(username) {
  return users.find((user) => user.username === username) || null;
}

export function findUserById(id) {
  return users.find((user) => user.id === id) || null;
}

export function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
}

export async function createUser({ username, email, password, role = 'user' }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: String(users.length + 1),
    username,
    email,
    password: hashedPassword,
    role
  };

  users.push(newUser);
  return sanitizeUser(newUser);
}

export function getAllUsers() {
  return users.map(sanitizeUser);
}
