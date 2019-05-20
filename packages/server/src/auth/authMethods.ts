import * as jwt from 'jsonwebtoken';
import userModel, { User } from '../modules/user/userModel';
import { JWT } from '../config';

/**
 * Gets user using the email
 * @param {string} token - Headers token
 * @returns {User} - returns the context user
 */

export const getUser = async (token: string): Promise<User> => {
  if (!token) {
    return null
  }

  try {
    const decodedToken: any = jwt.verify(token.substring(4), JWT);

    const user = await userModel.findOne({ email: decodedToken.id });

    return user
  } catch (err) {
    return null
  }
};
