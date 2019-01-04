import * as jwt from 'jsonwebtoken';
import userModel, { User } from './userModel';
import { GraphQLContext } from '../../graphqlTypes';
import { encryptPassword, authenticate } from '../../auth/encryption';
import { JWT } from '../../config';

interface RegisterArgs {
	name: string;
	password: string;
	email: string;
}

interface LoginArgs {
	email: string;
	password: string;
}

interface UserQueryArgs {
	_id: string;
}

interface UsersListArgs {
	first: number;
	after: number;
	search: string;
}

export default {
	Query: {
		me: (root, args, context: GraphQLContext) => userModel.findOne({ _id: context.user._id }),
		user: async (root, { _id }: UserQueryArgs, context) => {
			const user = await userModel.findOne({ _id });

			if (!user) {
				throw new Error('User not found');
			}

			return user
		},
		users: async (root, { first, after, search }: UsersListArgs, context) => {
			const limit = first ? first : 10;

			const args = search ? {
				name: {
					$regex: new RegExp(`^${search}`, 'ig'),
				},
				active: true
			} : { active: true };

			if (!context.user) {
				throw new Error('You are not authenticated');
			}

			if (!after) {
				const edges = await userModel.find(args).limit(limit);
				const count = await userModel.find(args).limit(limit).count();
				return {
					count,
					edges
				}
			}

			const edges = await userModel.find(args).limit(limit).skip(after);
			const count = await userModel.find(args).limit(limit).skip(after).count();
			return {
				count,
				edges
			}
		},
	},
	Mutation: {
		login: async (root, { password, email }: LoginArgs, context) => {
			const user = await userModel.findOne({ email }).select('+password');
			
			if (!user) {
				throw new Error('Invalid email or password');
			}
			
			const isPasswordCorrect = authenticate(password, user.password);
	
			if (!isPasswordCorrect) {
				throw new Error('Invalid email or password')
			}
	
			const token = `JWT ${jwt.sign({ id: user.email }, JWT)}`;
	
			return {
				token,
			};
		},
		register: async (root, { name, password, email }: RegisterArgs, context) => {
			const user = await userModel.findOne({ email });
	
			if (user) {
				throw new Error('This email is already in use');
			}
	
			const newUser = new userModel({
				name,
				password: encryptPassword(password),
				email
			});
	
			await newUser.save();
	
			const token = `JWT ${jwt.sign({ id: email }, JWT)}`;
	
			return {
				token,
			};
		}
	},
}