// The choices in the Application Status dropdown, in the order a search usually goes
export const APPLICATION_STATUSES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

// CSS class for a status label, e.g. 'Interviewing' -> 'status-interviewing'.
// Jobs with no status yet count as 'Saved'; older free-text statuses get a neutral label.
export const statusClass = (status) => {
  const known = APPLICATION_STATUSES.find((s) => s.toLowerCase() === (status || 'saved').toLowerCase());
  return known ? `status-${known.toLowerCase()}` : 'status-other';
};
