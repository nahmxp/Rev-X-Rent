import dbConnect from '../../../lib/mongodb';
import PickupRequest from '../../../models/PickupRequest';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth';
import User from '../../../models/User';

async function requireAdmin(req, res) {
  const token = await getTokenFromRequest(req);
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) return null;
  await dbConnect();
  const user = await User.findById(decoded.id);
  if (!user || !user.isAdmin) return null;
  return user;
}

export default async function handler(req, res) {
  await dbConnect();

  // GET: List all pickup requests
  if (req.method === 'GET') {
    const admin = await requireAdmin(req, res);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });
    const requests = await PickupRequest.find({}).sort({ createdAt: -1 });
    return res.status(200).json(requests);
  }

  // PATCH: Update a pickup request by ID
  if (req.method === 'PATCH') {
    const admin = await requireAdmin(req, res);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing request ID' });
    const updates = {};
    if ('price' in req.body) updates.price = req.body.price;
    if ('status' in req.body) updates.status = req.body.status;
    try {
      const updated = await PickupRequest.findByIdAndUpdate(id, updates, { new: true });
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 