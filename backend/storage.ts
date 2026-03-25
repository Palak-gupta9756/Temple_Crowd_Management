import { 
  CrowdData, 
  ChatHistory, 
  Booking,
  User,
  type IUser,
  type ICrowdData,
  type IChatHistory,
  type IBooking
} from "./models";
import { 
  type InsertCrowdData,
  type InsertChatHistory,
  type InsertBooking,
  type InsertUser
} from "./shared/schema";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User/Auth
  createUser(user: InsertUser): Promise<IUser>;
  findUserByEmail(email: string): Promise<IUser | null>;
  findUserById(id: string): Promise<IUser | null>;
  validatePassword(user: IUser, password: string): Promise<boolean>;
  getAllUsers(): Promise<IUser[]>;
  deleteUser(id: string): Promise<boolean>;
  
  // Crowd Management
  getCrowdDataByTemple(templeId: string): Promise<ICrowdData | null>;
  getAllCrowdData(): Promise<ICrowdData[]>;
  updateCrowdData(data: InsertCrowdData): Promise<ICrowdData>;
  getCrowdHistory(templeId: string, hoursAgo: number): Promise<ICrowdData[]>;
  
  // Chat
  saveChatMessage(message: InsertChatHistory): Promise<IChatHistory>;
  getChatHistory(sessionId: string, limit?: number): Promise<IChatHistory[]>;
  
  // Bookings
  createBooking(booking: InsertBooking): Promise<IBooking>;
  getBookingsByTemple(templeId: string): Promise<IBooking[]>;
  getAllBookings(): Promise<IBooking[]>;
  updateBookingStatus(id: string, status: string): Promise<IBooking | null>;
}

export class DatabaseStorage implements IStorage {
  // User/Auth
  async createUser(user: InsertUser): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = new User({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: hashedPassword,
    });
    return await newUser.save();
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).lean() as IUser | null;
  }

  async findUserById(id: string): Promise<IUser | null> {
    return await User.findById(id).lean() as IUser | null;
  }

  async validatePassword(user: IUser, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  async getAllUsers(): Promise<IUser[]> {
    return await User.find({}, { password: 0 })
      .sort({ createdAt: -1 })
      .lean() as IUser[];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  // Crowd Management
  async getCrowdDataByTemple(templeId: string): Promise<ICrowdData | null> {
    return await CrowdData.findOne({ templeId })
      .sort({ timestamp: -1 })
      .limit(1)
      .lean() as ICrowdData | null;
  }

  async getAllCrowdData(): Promise<ICrowdData[]> {
    const latest = await CrowdData.find()
      .sort({ timestamp: -1 })
      .lean() as ICrowdData[];
    
    // Get only the latest entry for each temple
    const temples = new Map<string, ICrowdData>();
    for (const entry of latest) {
      if (!temples.has(entry.templeId)) {
        temples.set(entry.templeId, entry);
      }
    }
    return Array.from(temples.values());
  }

  async updateCrowdData(data: InsertCrowdData): Promise<ICrowdData> {
    const newData = new CrowdData({
      ...data,
      timestamp: new Date(),
    });
    return await newData.save();
  }

  async getCrowdHistory(templeId: string, hoursAgo: number): Promise<ICrowdData[]> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hoursAgo);
    
    return await CrowdData.find({
      templeId,
      timestamp: { $gte: cutoff }
    })
      .sort({ timestamp: 1 })
      .lean() as ICrowdData[];
  }

  // Chat
  async saveChatMessage(message: InsertChatHistory): Promise<IChatHistory> {
    const newMessage = new ChatHistory({
      ...message,
      timestamp: new Date(),
    });
    return await newMessage.save();
  }

  async getChatHistory(sessionId: string, limit: number = 20): Promise<IChatHistory[]> {
    return await ChatHistory.find({ sessionId })
      .sort({ timestamp: 1 })
      .limit(limit)
      .lean() as IChatHistory[];
  }

  // Bookings
  async createBooking(booking: InsertBooking): Promise<IBooking> {
    const newBooking = new Booking({
      ...booking,
      createdAt: new Date(),
    });
    return await newBooking.save();
  }

  async getBookingsByTemple(templeId: string): Promise<IBooking[]> {
    return await Booking.find({ templeId })
      .sort({ createdAt: -1 })
      .lean() as IBooking[];
  }

  async getAllBookings(): Promise<IBooking[]> {
    return await Booking.find()
      .sort({ createdAt: -1 })
      .lean() as IBooking[];
  }

  async updateBookingStatus(id: string, status: string): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      id,
      { bookingStatus: status },
      { new: true }
    ).lean() as IBooking | null;
  }
}

export const storage = new DatabaseStorage();
