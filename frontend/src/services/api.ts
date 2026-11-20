import {
  Movie,
  MovieCreatePayload,
  MovieUpdatePayload,
  RewatchPlan,
  Cinema,
  BookingResult,
  ApiError,
} from '../types';

const getApiBase = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const cleaned = envUrl.trim().replace(/\/$/, '');
  return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
};

const API_BASE = getApiBase();

export class CustomApiError extends Error {
  status: number;
  data: ApiError;

  constructor(status: number, data: ApiError) {
    super(typeof data.detail === 'string' ? data.detail : 'API Error');
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new CustomApiError(response.status, data as ApiError);
  }

  return data as T;
}

export const api = {
  // Movies
  getMovies: () => request<Movie[]>('/movies'),
  getMovie: (id: number) => request<Movie>(`/movies/${id}`),
  createMovie: (payload: MovieCreatePayload) =>
    request<Movie>('/movies', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateMovie: (id: number, payload: MovieUpdatePayload) =>
    request<Movie>(`/movies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteMovie: (id: number) =>
    request<void>(`/movies/${id}`, {
      method: 'DELETE',
    }),
  getRewatchOrder: (id: number) =>
    request<RewatchPlan>(`/movies/${id}/rewatch-order`),

  // Cinemas
  getCinemas: () => request<Cinema[]>('/cinemas'),
  getCinema: (id: number) => request<Cinema>(`/cinemas/${id}`),
  createCinema: (payload: { name: string; bundle_sizes: number[] }) =>
    request<Cinema>('/cinemas', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getBooking: (cinemaId: number, groupSize: number) =>
    request<BookingResult>(`/cinemas/${cinemaId}/booking?groupSize=${groupSize}`),

  // Health & Admin
  checkHealth: () => request<{ status: string }>('/health'),
  resetDatabase: () =>
    request<{ status: string; message: string }>('/reset', {
      method: 'POST',
    }),
};
