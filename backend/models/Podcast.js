import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'db.json');

// Helper to read/write the JSON file
const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

/**
 * MOCK PODCAST MODEL
 * This mimics Mongoose functions but saves to db.json
 */
class PodcastMock {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) this._id = Math.random().toString(36).substr(2, 9);
    if (!this.uploadDate) this.uploadDate = new Date();
  }

  async save() {
    const db = readDB();
    const index = db.podcasts.findIndex(p => p._id === this._id);
    if (index > -1) {
      db.podcasts[index] = { ...this };
    } else {
      db.podcasts.push({ ...this });
    }
    writeDB(db);
    return this;
  }

  static async create(data) {
    const podcast = new PodcastMock(data);
    await podcast.save();
    return podcast;
  }

  static async findById(id) {
    const db = readDB();
    const data = db.podcasts.find(p => p._id === id);
    return data ? new PodcastMock(data) : null;
  }

  static async findByIdAndUpdate(id, update) {
    const db = readDB();
    const index = db.podcasts.findIndex(p => p._id === id);
    if (index === -1) return null;
    db.podcasts[index] = { ...db.podcasts[index], ...update };
    writeDB(db);
    return new PodcastMock(db.podcasts[index]);
  }

  static async find(query = {}) {
    let { podcasts } = readDB();

    // Simple filter support for your search controller
    if (query.$or) {
      const searchTerms = query.$or.map(q => Object.values(q)[0].$regex?.toLowerCase() || "");
      podcasts = podcasts.filter(p => {
        return searchTerms.some(term =>
          (p.title && p.title.toLowerCase().includes(term)) ||
          (p.transcript && p.transcript.toLowerCase().includes(term))
        );
      });
    }

    return {
      sort: () => ({
        limit: () => podcasts.map(p => new PodcastMock(p)),
        map: (fn) => podcasts.map(p => new PodcastMock(p)).map(fn)
      }),
      select: () => ({
        sort: () => ({
          limit: () => podcasts.map(p => new PodcastMock(p))
        })
      }),
      limit: () => podcasts.map(p => new PodcastMock(p))
    };
  }
}

// Mimic the query chain for the search and list controllers
PodcastMock.find = function(query) {
  const db = readDB();
  let results = db.podcasts;

  if (query && query.$or) {
    const q = query.$or[0].title.$regex.toLowerCase();
    results = results.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.transcript.toLowerCase().includes(q)
    );
  }

  const chain = {
    select: () => chain,
    sort: () => chain,
    limit: (n) => Promise.resolve(results.slice(0, n).map(p => new PodcastMock(p))),
    then: (resolve) => resolve(results.map(p => new PodcastMock(p)))
  };
  return chain;
};

export default PodcastMock;