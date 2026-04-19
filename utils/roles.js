const ROLE_ADMIN = 'admin';
const ROLE_REVIEWER = 'reviewer';
const ROLE_VIEWER = 'viewer';

// Legacy role value still accepted to avoid breaking existing sessions/tokens.
const ROLE_DISTRICT_EDO_LEGACY = 'district_EDO';

// New canonical role value.
const ROLE_ENVIRONMENTAL_DISTRICT_OFFICER = 'Environmental District Officer';

const DISTRICT_EDO_ROLES = [
  ROLE_ENVIRONMENTAL_DISTRICT_OFFICER,
  ROLE_DISTRICT_EDO_LEGACY,
];

const normalizeRole = (role) =>
  role === ROLE_DISTRICT_EDO_LEGACY
    ? ROLE_ENVIRONMENTAL_DISTRICT_OFFICER
    : role;

module.exports = {
  ROLE_ADMIN,
  ROLE_REVIEWER,
  ROLE_VIEWER,
  ROLE_DISTRICT_EDO_LEGACY,
  ROLE_ENVIRONMENTAL_DISTRICT_OFFICER,
  DISTRICT_EDO_ROLES,
  normalizeRole,
};
