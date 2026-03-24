export type EventLocation = {
  label: string;
};

export type CreateEventRequest = {
  occasion: string;
  date: string;
  mainLocation: string;
  description: string;
  locations: EventLocation[];
  title: string;
  coverImageUrl?: string;
  videoMessageUrl?: string;
  pin: string;
};

export type EventInvitePayload = {
  eventSlug: string;
  inviteUrl: string;
  qrPayload: string;
};

export type EventInvitationView = {
  eventSlug: string;
  title: string;
  invitationText: string;
  coverImageUrl: string | null;
  videoUrl: string | null;
};

export type EventRoomContext = {
  event: {
    slug: string;
    title: string;
  };
  viewer: {
    email: string;
    username: string | null;
    avatarUrl: string | null;
    eventRole: "host" | "guest";
  };
};

export type EventState = {
  latestInvite: EventInvitePayload | null;
};
