/**
 * The longest each field a Reader sends the Owner may be, in characters after trimming.
 * The Owner inbox enforces them; the forms read them for their own hints.
 */
export const CONTACT_LIMITS = { name: 50, email: 254, message: 2000 } as const;

/** The longest the optional line after a piece of Feedback may be. */
export const FEEDBACK_LINE_LIMIT = 200;
