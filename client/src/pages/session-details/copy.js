export function getRsvpHeading(status, isMember) {
  if (status.state === 'ended') {
    return isMember ? 'You went to this session' : 'This session has ended'
  }

  return isMember ? 'You’re attending' : 'Join this session'
}

export function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toLocaleUpperCase()
}
