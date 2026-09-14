export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: string; // ISO
}

export interface BirthProfile {
  userId: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm, 24h
  timeUnknown: boolean;
  placeLabel: string;
  latitude: number;
  longitude: number;
  updatedAt: string; // ISO
}

export interface TarotDrawRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD, local draw date (one free draw per day)
  spread: "single" | "three" | "celtic-cross";
  cardIds: number[];
  reversed: boolean[];
  note: string | null;
  createdAt: string; // ISO
}

export interface DbShape {
  users: Record<string, User>;
  usersByEmail: Record<string, string>; // email -> userId
  birthProfiles: Record<string, BirthProfile>; // userId -> profile
  tarotDraws: Record<string, TarotDrawRecord>; // id -> draw
}
