import bcrypt from "bcryptjs";
import Users from "../sequelizeModels/Users.js";

const getUserByUsername = async (username) => {
  try {
    const user = await Users.findOne({ where: { username }, raw: true });
    return user;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    const user = await Users.findOne({ where: { id }, raw: true });
    return user;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    throw error;
  }
};

const createUser = async (
  {username, password, name, email, phone_number, address, avatar}) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({
      username,
      name,
      password: hashedPassword,
      email,
      phone_number: phone_number,
      address,
      avatar,
    });
    console.log("Creating user:", user)
    return user.id;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (id, { username, name, email, phone_number, address, avatar }) => {
  try {
    const updateData = { username, name, email, phone_number, address, avatar };

    const [updated] = await Users.update(updateData, { where: { id } });
    console.log("Updated:", updated)
    if (updated) {
      const updatedUser = await Users.findOne({ where: { id }, raw: true });
      return updatedUser;
    }
    throw new Error('User not found');
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};


export const activateUser = async (id) => {
  try {

    const [updated] = await Users.update({ isActivated: 1 }, { where: { id } });
    console.log("Updated:", updated);
    if (updated) {
      const updatedUser = await Users.findOne({ where: { id }, raw: true });
      return updatedUser;
    }
    throw new Error("User not found");
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
export { getUserByUsername, getUserById, createUser };
