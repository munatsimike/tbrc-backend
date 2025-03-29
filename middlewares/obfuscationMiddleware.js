// deobfuscateMiddleware.js
import { deobfuscateId } from '../controllers/helpers/obfuscation.js';

export const deobfuscateMiddleware = (req, res, next) => {
  console.log('before Deobfuscating ID:', req.params.id);
  if (req.params.id) {
    try {
      req.params.id = deobfuscateId(req.params.id);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
  }
  console.log('after Deobfuscating ID:', req.params.id);
  next();
};

