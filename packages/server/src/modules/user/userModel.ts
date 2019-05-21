import * as mongoose from 'mongoose';

export interface User extends mongoose.Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  active: boolean;
}

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

export default mongoose.model<User>('User', Schema);