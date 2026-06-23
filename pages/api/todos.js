import { hygraph } from '../../src/utils/hygraph';
import { gql } from 'graphql-request';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  if (!cookies.token) return res.status(401).json({ error: 'Unauthorized' });

  let user;
  try {
    user = jwt.verify(cookies.token, process.env.JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { method, body } = req;

  try {
    // 1. GET / READ
    if (method === 'GET') {
      const query = gql`
        query GetUserTodos($userId: ID!) {
          todos(where: { user: { id: $userId } }) {
            id title date status
          }
        }
      `;
      const data = await hygraph.request(query, { userId: user.id });
      return res.status(200).json(data.todos);
    }

    // 2. POST / CREATE
    if (method === 'POST') {
      const mutation = gql`
        mutation CreateTodo($title: String!, $date: Date!, $userId: ID!) {
          createTodo(data: { title: $title, date: $date, status: "PENDING", user: { connect: { id: $userId } } }) {
            id title date status
          }
        }
      `;
      const data = await hygraph.request(mutation, { title: body.title, date: body.date, userId: user.id });
      
      // Auto-publish to bypass Hygraph draft stage limits
      await hygraph.request(gql`mutation { publishTodo(where: { id: "${data.createTodo.id}" }, to: PUBLISHED) { id } }`);
      return res.status(201).json(data.createTodo);
    }

    // 3. PUT / UPDATE
    if (method === 'PUT') {
      const mutation = gql`
        mutation UpdateTodo($id: ID!, $title: String!, $date: Date!, $status: String!) {
          updateTodo(where: { id: $id }, data: { title: $title, date: $date, status: $status }) {
            id title date status
          }
          publishTodo(where: { id: $id }, to: PUBLISHED) { id }
        }
      `;
      const data = await hygraph.request(mutation, { id: body.id, title: body.title, date: body.date, status: body.status });
      return res.status(200).json(data.updateTodo);
    }

    // 4. DELETE
    if (method === 'DELETE') {
      const mutation = gql`
        mutation DeleteTodo($id: ID!) {
          deleteTodo(where: { id: $id }) { id }
        }
      `;
      await hygraph.request(mutation, { id: req.query.id });
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}