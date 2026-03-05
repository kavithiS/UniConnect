import { User } from '../models/User.js';

export const getUserById = async (id) => {
  return await User.findById(id);
};

export const getAllUsers = async () => {
  return await User.find();
};

export const updateUser = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

export default { getUserById, getAllUsers, updateUser, deleteUser };
