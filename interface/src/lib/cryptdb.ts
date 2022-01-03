import crypto from "crypto";

const algorithm = process.env?.ALGORITHM; //algorithm to use
const password = process.env?.ENCRYPTION_KEY; //password to use
const salt = process.env?.SALT; //salt to use

export const encryptKey = (text: string) => {
  if (!algorithm || !password || !salt) {
    throw new Error('Missing algorithm, password or salt');
  }

  const key = crypto.scryptSync(password, salt, 24); //create key
  const iv = crypto.randomBytes(16).toString('hex').slice(0, 16); // generate different ciphertext everytime
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex'); // encrypted text
  
  return `${encrypted}@${iv}`;
};

export const decryptKey = (text: string) => {
  if (!algorithm || !password || !salt) {
    throw new Error('Missing algorithm, password or salt');
  }

  const key = crypto.scryptSync(password, salt, 24); //create key
  const [decText, iv] = text.split('@');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = decipher.update(decText, 'hex', 'utf8') + decipher.final('utf8'); //deciphered text

  return decrypted;
};