import * as bcrypt from 'bcryptjs';

/**
 * Gets user using the email
 * @param {string} plainPassword - Request body password
 * @param {string} hash - Hashed password
 * @returns {string}
 */
export const authenticate = (plainPassword: string, hash: string): boolean => bcrypt.compareSync(plainPassword, hash);

/**
 * Encrypt user password
 * @param {string} plainPassword - The title of the book.
 * @returns {string}
 */
export const encryptPassword = (plainPassword): string => bcrypt.hashSync(plainPassword, 8);