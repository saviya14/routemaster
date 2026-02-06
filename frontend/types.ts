// Authentication Types
export interface User {
  id: number;
  email: string;
  username: string;
  fullName: string | null;
  role: "user" | "admin";
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  tokenType: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Travel Types
export enum TravelStyle {
  ADVENTURE = "Adventure",
  CULTURAL = "Cultural",
  SPIRITUAL = "Spiritual",
  NATURE = "Nature/Wildlife",
}

export interface Destination {
  id: string;
  name: string;
  category: TravelStyle;
  description: string;
  image: string;
  duration: string;
  distanceFromPrevious: string;
  costLKR: number;
  rating: number;
  reviewsCount: number;
  openingHours: string;
  coordinates: [number, number];
  highlights: string[];
}

export interface UserPreferences {
  styles: TravelStyle[];
  startDate: string;
  endDate: string;
  budget: number;
  startLocation: string;
}

export interface RouteStep {
  destinationId: string;
  mode: "Car" | "Train" | "TukTuk";
  duration: string;
  distance: string;
}

export interface RecommendationExplainability {
  destinationId: string;
  matchScore: number;
  factors: {
    interestMatch: number;
    rating: number;
    budgetFit: number;
    proximity: number;
  };
  reasoning: string;
}

// Backend API Response Types
export interface DayItinerary {
  locations: string[];
  description: string;
  meals: string;
  accommodation: string | null;
  transport: string;
}

export interface EstimatedCost {
  entranceFees: number;
  meals: number;
  transport: number;
  accommodation?: number;
  guide?: number;
  total: number;
}

export interface TravelRecommendation {
  id: number;
  travelStyles: string[];
  days: number;
  startLocation: string;
  budget: number;
  budgetCategory: string;
  itinerary: Record<string, DayItinerary>;
  estimatedCost: EstimatedCost;
  highlights: string[];
  score?: number;
}

export interface RecommendationResponse {
  success: boolean;
  totalResults: number;
  recommendations: TravelRecommendation[];
}

export interface RecommendationRequest {
  travelStyles: string[];
  days: number;
  startLocation: string;
  budget: number;
}

// User Preferences & Saved Itineraries
export interface UserPreferenceResponse {
  id: number;
  userId: number;
  preferredTravelStyles: { styles: string[] } | null;
  preferredBudgetRange: string | null;
  preferredStartLocation: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedItineraryResponse {
  id: number;
  userId: number;
  combinationId: number;
  title: string | null;
  notes: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationInfo {
  id: string;
  name: string;
  district: string;
  timeRequired: number;
  entranceFee: number;
  description: string;
  coordinates: [number, number] | null;
}

export interface StartLocationInfo {
  id: number;
  name: string;
  coordinates: [number, number] | null;
}

// Admin - Location Management Types
export interface Location {
  id: number;
  stringId: string;
  name: string;
  category: string;
  district: string;
  timeRequired: number;
  entranceFee: number;
  description: string;
  coordinates: { lat: number; lng: number } | [number, number] | null;
}

export interface LocationCreate {
  stringId: string;
  name: string;
  category: string;
  district: string;
  timeRequired: number;
  entranceFee: number;
  description: string;
  coordinates?: { lat: number; lng: number } | [number, number] | null;
}

export interface LocationUpdate {
  stringId?: string;
  name?: string;
  category?: string;
  district?: string;
  timeRequired?: number;
  entranceFee?: number;
  description?: string;
  coordinates?: { lat: number; lng: number } | [number, number] | null;
}

export interface LocationListResponse {
  total: number;
  locations: Location[];
}
