/**
 * Server states turned into something a person can act on. Deliberately says
 * what to DO, not what went wrong internally — "you're too far away" beats
 * "outside_radius", and neither reveals where the geofence actually is.
 */

/**
 * Being too far away and having a fix too vague to trust are two different
 * facts about the phone, and exactly one message to the person holding it.
 *
 * The server separates them and should keep separating them — a manager
 * reading the Attempts page needs to tell "clocking in from home" apart from
 * "cheap handset indoors". But the employee can do nothing with that
 * distinction. The previous wording told them to step outside so the phone
 * could see the sky, which is both odd to read and useless advice to someone
 * whose job is indoors; either way what they need to hear is that we could not
 * place them at work.
 */
const NOT_CLOSE_ENOUGH = {
  title: 'You are not within the allowed proximity',
  body: 'You need to be at the workplace to mark attendance. Move closer and try again.',
}

export function markFailureMessage(state: string): { title: string; body: string } {
  switch (state) {
    case 'invalid_credentials':
      return {
        title: 'That PIN was not right',
        body: 'Check the four digits and try again. Ask your manager if you have forgotten it.',
      }
    case 'pin_locked':
      return {
        title: 'Too many wrong tries',
        body: 'For safety this is locked for 15 minutes. Ask your manager to mark you in the meantime.',
      }
    case 'pin_not_set':
      return {
        title: 'You have no PIN yet',
        body: 'Ask your manager to send you a link to set one up.',
      }
    case 'outside_radius':
    case 'location_accuracy_low':
      return NOT_CLOSE_ENOUGH
    case 'location_required':
      return {
        title: 'Location is needed',
        body: 'Allow location for this site, then try again.',
      }
    case 'window_closed':
      return {
        title: 'It is outside marking hours',
        body: 'Attendance can only be marked during the hours your workplace has set.',
      }
    case 'self_mark_disabled':
      return {
        title: 'Self-marking is switched off',
        body: 'Your workplace is not using this yet. Your manager will mark you.',
      }
    case 'not_clocked_in':
      return {
        title: 'You have not clocked in today',
        body: 'Clock in first — you can only clock out afterwards.',
      }
    case 'invalid_link':
      return {
        title: 'This link has expired',
        body: 'Attendance links only work for the day they were sent. Use today’s link.',
      }
    default:
      return {
        title: 'Something went wrong',
        body: 'Please try again. If it keeps happening, ask your manager to mark you.',
      }
  }
}
