import { useQuery } from '@tanstack/react-query';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { getAchievementLinkBySecretId } from '@/features/achievement/get-achievement-link';

export const GithubClaim = () => {
  const githubAchievementsToClaim = useQuery(
    orpc.achievement.getGithubAchievementsToClaim.queryOptions()
  );

  if (!githubAchievementsToClaim.data?.length) return null;

  return (
    <div className="flex flex-col gap-2">
      {githubAchievementsToClaim.data.map((item) => (
        <Card key={item.repository}>
          <CardHeader>
            <CardTitle>{item.repository}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href={getAchievementLinkBySecretId(item.achievement.secretId)}>
                Complete
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
