import { hygraph } from '../../src/utils/hygraph';
import { gql } from 'graphql-request';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { action, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    if (action === 'signup') {
      const checkQuery = gql`
        query GetAppUser($email: String!) {
          appUsers(where: { email: $email }, first: 1) {
            id
          }
        }
      `;

      const checkData = await hygraph.request(checkQuery, { email });

      if (checkData?.appUsers?.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const createMutation = gql`
        mutation CreateAppUser($email: String!, $password: String!) {
          createAppUser(data: { email: $email, password: $password }) {
            id
            email
          }
        }
      `;

      const userData = await hygraph.request(createMutation, {
        email,
        password: hashedPassword,
      });

      if (!userData?.createAppUser) {
        return res.status(500).json({ error: 'Failed to create user' });
      }

      return res.status(201).json({
        message: 'User created successfully. Please log in.',
      });
    }

    if (action === 'login') {
      const query = gql`
        query GetUsers($email: String!) {
          appUsers(where: { email: $email }, first: 1) {
            id
            email
            password
          }
        }
      `;

      const data = await hygraph.request(query, { email });

      console.log('Hygraph response:', JSON.stringify(data, null, 2));

      const user = data?.appUsers?.[0];

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      if (!user.password) {
        return res.status(500).json({ error: 'Password missing in database' });
      }

      const isValid = await bcrypt.compare(password, user.password);

      console.log('Password valid:', isValid);

      if (!isValid) {
        return res.status(400).json({ error: 'Invalid password' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.setHeader(
        'Set-Cookie',
        serialize('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
      );

      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return res.status(405).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      error: error.message || 'Authentication failed',
    });
  }
}