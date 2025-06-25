import dbConnect from '../../lib/mongodb';
import PickupRequest from '../../models/PickupRequest';
import { getTokenFromRequest, verifyToken } from '../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    // Anyone can create a pickup request
    const { customerName, email, phone, pickupTime, pickupLocation, dropLocation, carCategory, headcount } = req.body;
    let user = null;
    try {
      const token = await getTokenFromRequest(req);
      if (token) {
        const decoded = verifyToken(token);
        if (decoded && decoded.id) {
          user = decoded.id;
        }
      }
    } catch (e) {}
    try {
      const pickupRequest = await PickupRequest.create({
        customerName,
        email,
        phone,
        pickupTime,
        pickupLocation,
        dropLocation,
        carCategory,
        headcount,
        user
      });
      return res.status(201).json(pickupRequest);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    // Allow logged-in users to see their pickup requests, or fetch by email if provided
    let userId = null;
    let email = req.query.email;
    try {
      const token = await getTokenFromRequest(req);
      if (token) {
        const decoded = verifyToken(token);
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      }
    } catch (e) {}
    if (!userId && !email) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      let query = {};
      if (userId) {
        query.user = userId;
      } else if (email) {
        query.email = email;
      }
      const requests = await PickupRequest.find(query).sort({ createdAt: -1 });
      return res.status(200).json(requests);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 