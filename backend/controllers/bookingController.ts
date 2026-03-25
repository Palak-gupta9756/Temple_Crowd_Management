import { Request, Response } from "express";
import { storage } from "../storage";
import { insertBookingSchema } from "../shared/schema";

export const bookingController = {
  // Create booking
  async create(req: Request, res: Response) {
    try {
      const validated = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validated);
      res.status(201).json(booking);
    } catch (error: any) {
      console.error("Booking error:", error);
      if (error.errors) {
        console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
        res.status(400).json({ error: "Invalid booking data", details: error.errors });
      } else {
        res.status(400).json({ error: "Invalid booking data", message: error.message });
      }
    }
  },

  // Get bookings by temple
  async getByTemple(req: Request, res: Response) {
    try {
      const { templeId } = req.params;
      const bookings = await storage.getBookingsByTemple(templeId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  },

  // Get all bookings
  async getAll(req: Request, res: Response) {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  },

  // Update booking status (admin)
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["Pending", "Confirmed", "Cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const booking = await storage.updateBookingStatus(id, status);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ error: "Failed to update booking status" });
    }
  },
};
