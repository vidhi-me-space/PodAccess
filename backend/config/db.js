import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, '..', 'db.json');

const connectDB = async () => {
  console.log('🚀 Using Local JSON Database (No Internet/Atlas Required)');

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ podcasts: [] }, null, 2));
    console.log('📁 Created new db.json file');
  }
};

export default connectDB;