/**
 * ID Validator
 * Since we switched to a local JSON DB, we accept any string ID.
 */
export function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id) {
      return res.status(400).json({ error: 'Missing ID' });
    }
    next();
  };
}