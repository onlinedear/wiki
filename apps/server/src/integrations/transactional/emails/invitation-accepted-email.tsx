import { Section, Text } from '@react-email/components';
import * as React from 'react';
import { content, paragraph } from '../css/styles';
import { MailBody } from '../partials/partials';

interface Props {
  invitedUserName: string;
  invitedUserEmail: string;
}

export const InvitationAcceptedEmail = ({
  invitedUserName,
  invitedUserEmail,
}: Props) => {
  return (
    <MailBody>
      <Section style={content}>
        <Text style={paragraph}>您好，</Text>
        <Text style={paragraph}>
          {invitedUserName} ({invitedUserEmail}) 已接受您的邀请，
          现在已成为工作空间的成员。
        </Text>
      </Section>
    </MailBody>
  );
};

export default InvitationAcceptedEmail;
