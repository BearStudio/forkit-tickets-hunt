export const fetchGithubStarred = (
  repositorySlug: string,
  accessToken: string
) => {
  return fetch(`https://api.github.com/user/starred/${repositorySlug}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  });
};
