import { Section, Text } from '@react-email/components';
import * as React from 'react';
import { content, paragraph } from '../css/styles';
import { MailBody } from '../partials/partials';

interface Props {
  username?: string;
}

export const ChangePasswordEmail = ({ username }: Props) => {
  return (
    <MailBody>
      <Section style={content}>
        <Text style={paragraph}>您好 {username}，</Text>
        <Text style={paragraph}>
          这是一封确认邮件，您的密码已成功修改。
        </Text>
      </Section>
    </MailBody>
  );
};

export default ChangePasswordEmail;
