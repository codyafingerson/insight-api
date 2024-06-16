import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';
import { createTransport, type SendMailOptions, type Transporter } from 'nodemailer';

/**
 * A utility class to send emails using nodemailer and handlebars templates.
 */
export default class MailService {
    private transporter: Transporter;
    private template: HandlebarsTemplateDelegate | undefined;
    private readonly from: string;
    private to: string | undefined;
    private subject: string | undefined;

    constructor() {
        this.transporter = createTransport({
            host: process.env.MAIL_HOST,
            port: parseInt(process.env.MAIL_PORT as string),
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });

        this.from = process.env.MAIL_FROM as string;
    }

    /**
     * Send an email using the specified template.
     * @param to the email address to send the email to
     * @param subject the subject of the email
     * @param templateName the name of the template to use (excluding the .hbs extension)
     * @param data the data to pass to the template
     */
    public async sendMail(to: string, subject: string, templateName: string, data: any) {
        this.to = to;
        this.subject = subject;
        await this.loadTemplate(templateName);
        await this.send(data);
    }

    private async loadTemplate(templateName: string) {
        const filePath = path.resolve(__dirname, '..', 'templates', `../../templates/${templateName}.hbs`);

        const source = fs.readFileSync(filePath, 'utf-8').toString();
        this.template = Handlebars.compile(source);
    }

    private async send(data: any) {
        // @ts-ignore
        const html = this.template(data);
        const mailOptions: SendMailOptions = {
            from: this.from,
            to: this.to,
            subject: this.subject,
            html
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error(`Error sending email: ${error}`);
        }
    }
}