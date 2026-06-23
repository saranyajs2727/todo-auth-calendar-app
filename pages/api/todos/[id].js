import { verifyToken, updateTodo, deleteTodo } from '../../../lib/auth';

export default function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const todo = updateTodo(id, req.body);
      res.status(200).json(todo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      deleteTodo(id);
      res.status(200).json({ message: 'Todo deleted' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
