import type { CreateEventRequest } from "./event.types";

export function toCreateEventBody(payload: CreateEventRequest) {
  return {
    occasion: payload.occasion,
    date: payload.date,
    main_location: payload.mainLocation,
    description: payload.description,
    locations: payload.locations,
    title: payload.title,
    cover_image_url: payload.coverImageUrl,
    video_message_url: payload.videoMessageUrl,
    pin: payload.pin,
  };
}
