export interface ToolSearchParams {
  lat: number;
  lng: number;
  radiusMiles?: number | undefined;
  query?: string | undefined;
  categoryId?: number | undefined;
}

export const toolKeys = {
  all: ['tools'] as const,
  lists: () => ['tools', 'list'] as const,
  list: (params: ToolSearchParams) => ['tools', 'list', params] as const,
  detail: (id: string) => ['tools', 'detail', id] as const,
  byOwner: (ownerId: string) => ['tools', 'owner', ownerId] as const,
  blockedDates: (toolId: string) => ['tools', 'blocked-dates', toolId] as const,
  categories: () => ['categories'] as const,
  projectTypes: () => ['project-types'] as const,
  serviceAreas: () => ['service-areas'] as const,
};

export const bookingKeys = {
  all: ['bookings'] as const,
  forRenter: (renterId: string) => ['bookings', 'renter', renterId] as const,
  forOwner: (ownerId: string) => ['bookings', 'owner', ownerId] as const,
  detail: (id: string) => ['bookings', 'detail', id] as const,
  pendingCount: (ownerId: string) => ['bookings', 'pending-count', ownerId] as const,
};

export const profileKeys = {
  detail: (userId: string) => ['profiles', userId] as const,
};

export const messageKeys = {
  list: (bookingId: string) => ['messages', bookingId] as const,
  unreadCount: (userId: string) => ['messages', 'unread-count', userId] as const,
  conversations: (userId: string) => ['messages', 'conversations', userId] as const,
};

export const reviewKeys = {
  forTool: (toolId: string) => ['reviews', 'tool', toolId] as const,
  forUser: (userId: string) => ['reviews', 'user', userId] as const,
};

export const favoriteKeys = {
  all: (userId: string) => ['favorites', userId] as const,
  ids: (userId: string) => ['favorites', userId, 'ids'] as const,
  tools: (userId: string) => ['favorites', userId, 'tools'] as const,
};
