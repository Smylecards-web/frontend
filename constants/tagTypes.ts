export const TAG_TYPES = {
  AUTH: "Auth",
  EVENT: "Event",
  INVITATION: "Invitation",
} as const;

export const TAG_TYPE_LIST = Object.values(TAG_TYPES);

export type TagType = (typeof TAG_TYPE_LIST)[number];
