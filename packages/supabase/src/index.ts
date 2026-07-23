// Repositories
export { createToolRepository } from './repositories/tool.repository';
export type { ToolRepository } from './repositories/tool.repository';

export { createBookingRepository } from './repositories/booking.repository';
export type { BookingRepository } from './repositories/booking.repository';

export { createAuthRepository } from './repositories/auth.repository';
export type { AuthRepository } from './repositories/auth.repository';

export { createMessageRepository } from './repositories/message.repository';
export type { MessageRepository, Conversation } from './repositories/message.repository';

export { createProfileRepository } from './repositories/profile.repository';
export type { ProfileRepository } from './repositories/profile.repository';

export { createReviewRepository } from './repositories/review.repository';
export type { ReviewRepository } from './repositories/review.repository';

export { createPaymentRepository } from './repositories/payment.repository';
export type { PaymentRepository, PaymentIntentResult } from './repositories/payment.repository';

export { createFavoriteRepository } from './repositories/favorite.repository';
export type { FavoriteRepository } from './repositories/favorite.repository';

// Query hooks
export { useTools, useTool, useToolsByOwner, useBlockedDates, useCreateBlockedDate, useDeleteBlockedDate, useCategories, useCreateTool, useUpdateTool, useDeleteTool } from './hooks/useTools';
export { useBookingsForRenter, useBookingsForOwner, useBooking, useCreateBooking, useUpdateBookingStatus, useRequestReturn, useConfirmReturn, usePendingRequestCount } from './hooks/useBookings';
export { useProfile, useUpdateProfile } from './hooks/useProfile';
export { useReviewsForTool, useReviewsForUser, useCreateReview } from './hooks/useReviews';
export { useFavoriteToolIds, useFavoriteTools, useToggleFavorite } from './hooks/useFavorites';
export { useUnreadMessageCount, useConversations } from './hooks/useMessages';

// Query keys
export { toolKeys, bookingKeys, profileKeys, messageKeys, reviewKeys, favoriteKeys } from './queryKeys';
export type { ToolSearchParams } from './queryKeys';
