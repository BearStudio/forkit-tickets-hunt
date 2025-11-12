import {
  Button,
  Container,
  Heading,
  Section,
  Text,
} from '@react-email/components';
import { User } from 'better-auth';

import i18n from '@/lib/i18n';

import { EmailFooter } from '@/emails/components/email-footer';
import { EmailLayout } from '@/emails/components/email-layout';
import { styles } from '@/emails/styles';
import { getAchievementLinkByKey } from '@/features/achievement/get-achievement-link';

export const TemplateOnboarded = (props: { language: string; user: User }) => {
  i18n.changeLanguage(props.language);
  return (
    <EmailLayout
      preview={i18n.t('emails:onboarded.preview')}
      language={props.language}
    >
      <Container style={styles.container}>
        <Heading style={styles.h1}>
          {i18n.t('emails:onboarded.title', { name: props.user.name })}
        </Heading>
        <Section style={styles.section}>
          <Text style={styles.text}>{i18n.t('emails:onboarded.intro')}</Text>
          <Button>
            <a href={getAchievementLinkByKey('onboarding_email')}>
              {i18n.t(
                'achievement:inAppAchievements.onboarding_email.triggerButton.label'
              )}
            </a>
          </Button>
        </Section>
        <EmailFooter />
      </Container>
    </EmailLayout>
  );
};

export default TemplateOnboarded;
