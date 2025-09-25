import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({to, subject, html, text}) => {
  const { data, error } = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: [to],
    subject: subject,
    html: html,
    text: text
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
}

