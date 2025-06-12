// hash-password.js (ES Module Version)
import bcrypt from 'bcryptjs';

// --- 1. SET YOUR NEW PASSWORD HERE ---
const passwordToHash = 'changeme123';

// --- 2. SET SALT ROUNDS (10 is standard) ---
const saltRounds = 10;

// --- 3. RUN THE SCRIPT ---
async function generateHash() {
  if (!passwordToHash) {
    console.error('\nERROR: Please set a password in the `passwordToHash` variable.\n');
    return;
  }
  
  try {
    console.log('Generating hash, please wait...');
    const hashedPassword = await bcrypt.hash(passwordToHash, saltRounds);
    
    console.log('\n✅ Hashing complete!\n');
    console.log('================================================================');
    console.log('COPY THIS ENTIRE HASH:');
    console.log(hashedPassword);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Error hashing password:', err);
  }
}

generateHash();