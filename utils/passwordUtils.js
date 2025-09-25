import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

//function to hash password using bcrypt
export const passwordHasher = async (password) => {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    return hashed;
}

//function to compare plain password with hashed one
export const passwordChecker = async (password, hashedPassword) => {
    const match = bcrypt.compare(password, hashedPassword);
    return match; //true or false
}