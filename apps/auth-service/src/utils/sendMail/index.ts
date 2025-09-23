import dotenv from 'dotenv';
import ejs from 'ejs';
import nodemail from 'nodemailer';
import path from 'path';
import { existsSync } from 'node:fs';

import { getAuthInlineTemplate } from './templates';

dotenv.config();

const transporter = nodemail.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

//Render an EJS email template
const renderEmailTemplate = async (templateName: string, data: Record<string, any>): Promise<string> => {
  const inlineTemplate = getAuthInlineTemplate(templateName);

  if (inlineTemplate) {
    return ejs.render(inlineTemplate, data);
  }

  const templateCandidates = [
    path.join(__dirname, '..', 'email-templates', `${templateName}.ejs`),
    path.join(
      process.cwd(),
      'apps',
      'auth-service',
      'src',
      'utils',
      'email-templates',
      `${templateName}.ejs`,
    ),
  ];

  const templatePath = templateCandidates.find((candidate) => existsSync(candidate));

  if (!templatePath) {
    throw new Error(`Email template ${templateName} not found`);
  }

  return ejs.renderFile(templatePath, data);
};

//Send email using Nodemailer
export const sendEmail = async (to: string, subject: string, templateName: string, data: Record<string, any>) => {
  try {
    const html = await renderEmailTemplate(templateName, data);

    await transporter.sendMail({
      from: `${process.env.SMTP_USER}`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.log('Error sending email', error);
    return false;
  }
};
