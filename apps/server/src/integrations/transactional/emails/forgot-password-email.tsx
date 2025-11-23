import { Button, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { button, content, paragraph } from '../css/styles';
import { MailBody } from '../partials/partials';

interface Props {
  username: string;
  resetLink: string;
}

export const ForgotPasswordEmail = ({ username, resetLink }: Props) => {
  return (
    <MailBody>
      <Section style={content}>
        <Text style={paragraph}>您好 {username}，</Text>
        <Text style={paragraph}>
          我们收到了您重置密码的请求。
        </Text>
          <Link href={resetLink}> 点击此处设置新密码</Link>
        <Text style={paragraph}>
          如果您没有请求重置密码，请忽略此邮件。
        </Text>
      </Section>
    </MailBody>
  );
};

export default ForgotPasswordEmail;
