import { hygraph } from '../../src/utils/hygraph';
import { gql } from 'graphql-request';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { action, email, password } = req.body;

  try {
    if (action === 'signup') {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const createMutation = gql`
        mutation CreateUser($email: String!, $password: String!) {
          createUser(data: { email: $email, password: $password }) { id }
          publishUser(where: { email: $email }, to: PUBLISHED) { id }
        }
      `;
      await hygraph.request(createMutation, { email, password: hashedPassword });
      return res.status(201).json({ message: 'User created successfully' });
    }

    if (action === 'login') {
      const query = gql`
        query GetUser($email: String!) {
          user(where: { email: $email }) { id password email }
        }
      `;
      const data = await hygraph.request(query, { email });
      if (!data.user) return res.status(400).json({ error: 'User not found' });

      const isValid = await bcrypt.compare(password, data.user.password);
      if (!isValid) return res.status(400).json({ error: 'Invalid password' });

      const token = jwt.sign({ id: data.user.id, email: data.user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      res.setHeader('Set-Cookie', serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 604800,
        path: '/'
      }));

      return res.status(200).json({ user: { id: data.user.id, email: data.user.email } });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}