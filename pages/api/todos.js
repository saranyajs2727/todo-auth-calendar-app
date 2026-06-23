import { hygraph } from '../../src/utils/hygraph';
import { gql } from 'graphql-request';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  if (!cookies.token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let user;
  try {
    user = jwt.verify(cookies.token, process.env.JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { method, body, query } = req;

  try {
    if (method === 'GET') {
      const getQuery = gql`
        query GetUserTodos($userId: ID!) {
          todos(
            where: { appUsers_some: { id: $userId } }
            orderBy: date_ASC
          ) {
            id
            title
            date
          }
        }
      `;

      const data = await hygraph.request(getQuery, {
        userId: user.id,
      });

      return res.status(200).json(data?.todos ?? []);
    }
    if (method === 'POST') {
      if (!body.title || !body.date) {
        return res.status(400).json({
          error: 'Title and date are required',
        });
      }

      const createMutation = gql`
        mutation CreateTodo($title: String!, $date: Date!, $userId: ID!) {
          createTodo(
            data: {
              title: $title
              date: $date
              appUsers: { connect: [{ id: $userId }] }
            }
          ) {
            id
            title
            date
          }
        }
      `;

      const data = await hygraph.request(createMutation, {
        title: body.title,
        date: body.date,
        userId: user.id,
      });

      if (!data?.createTodo) {
        return res.status(500).json({
          error: 'Failed to create todo',
        });
      }

      return res.status(201).json(data.createTodo);
    }
    if (method === 'PUT') {
      if (!body.id || !body.title || !body.date) {
        return res.status(400).json({
          error: 'ID, title, and date are required',
        });
      }

      const updateMutation = gql`
        mutation UpdateTodo($id: ID!, $title: String!, $date: Date!) {
          updateTodo(
            where: { id: $id }
            data: {
              title: $title
              date: $date
            }
          ) {
            id
            title
            date
          }
        }
      `;

      const data = await hygraph.request(updateMutation, {
        id: body.id,
        title: body.title,
        date: body.date,
      });

      if (!data?.updateTodo) {
        return res.status(500).json({
          error: 'Failed to update todo',
        });
      }

      return res.status(200).json(data.updateTodo);
    }
    if (method === 'DELETE') {
      if (!query.id) {
        return res.status(400).json({
          error: 'Todo ID is required',
        });
      }

      const deleteMutation = gql`
        mutation DeleteTodo($id: ID!) {
          deleteTodo(where: { id: $id }) {
            id
          }
        }
      `;

      const data = await hygraph.request(deleteMutation, {
        id: query.id,
      });

      if (!data?.deleteTodo) {
        return res.status(500).json({
          error: 'Failed to delete todo',
        });
      }

      return res.status(200).json({
        success: true,
        id: query.id,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Todo API error:', error);

    return res.status(500).json({
      error: error.message || 'Server error',
      details:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined,
    });
  }
}