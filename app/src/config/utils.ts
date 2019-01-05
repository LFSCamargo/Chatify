import gravatar from 'gravatar'

export const gravatarURL = (accountName: string) =>
  gravatar.url(accountName, { s: '100', r: 'x', d: 'retro' }, true)
