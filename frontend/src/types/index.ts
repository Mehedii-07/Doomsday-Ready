export interface MoviePrerequisiteBrief {
  id: number;
  title: string;
}

export interface Movie {
  id: number;
  title: string;
  release_year: number;
  runtime: number;
  watched: boolean;
  prerequisites: MoviePrerequisiteBrief[];
  prerequisite_ids: number[];
}

export interface MovieCreatePayload {
  title: string;
  release_year: number;
  runtime: number;
  watched?: boolean;
  prerequisite_ids?: number[];
}

export interface MovieUpdatePayload {
  title?: string;
  release_year?: number;
  runtime?: number;
  watched?: boolean;
  prerequisite_ids?: number[];
}

export interface RewatchPlan {
  target_movie: MoviePrerequisiteBrief;
  rewatch_order: Movie[];
  total_count: number;
  watched_count: number;
  remaining_runtime: number;
}

export interface Cinema {
  id: number;
  name: string;
  bundle_sizes: number[];
}

export interface BookingResult {
  possible: boolean;
  message: string;
  cinema_id?: number;
  cinema_name?: string;
  group_size?: number;
  total_bundles?: number | null;
  breakdown?: Record<string, number> | null;
  bundle_sizes?: number[];
}

export interface ApiError {
  detail: string;
  code?: string;
}
