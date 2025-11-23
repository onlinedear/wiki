import { Section, Text, Button } from '@react-email/components';
import * as React from 'react';
import { button, content, paragraph } from '../css/styles';
import { MailBody } from '../partials/partials';

interface Props {
  inviteLink: string;
}

export const InvitationEmail = ({ inviteLink }: Props) => {
  return (
    <MailBody>
      <Section style={content}>
        <Text style={paragraph}>您好，</Text>
        <Text style={paragraph}>您已被邀请加入 NoteDoc。</Text>
        <Text style={paragraph}>
          请点击下方按钮接受此邀请。
        </Text>
      </Section>
      <Section
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: '15px',
          paddingBottom: '15px',
        }}
      >
        <Button href={inviteLink} style={button}>
          接受邀请
        </Button>
      </Section>
    </MailBody>
  );
};

export default InvitationEmail;
