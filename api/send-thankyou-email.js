import sgMail from '@sendgrid/mail';

// 1. Set the API Key
// We check if the key exists to avoid crashing if env vars are missing
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// 2. The Rich HTML Email Helper (Restored!)
// This is your original, professional HTML table layout.
const getThankYouHtml = (name) => {
    return `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f9fafb" role="presentation">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;" role="presentation">
                        
                        <tr>
                            <td align="center" style="padding: 25px 0 15px 0; background-color: #2563eb; border-radius: 8px 8px 0 0;">
                                <h1 style="font-family: Arial, sans-serif; font-size: 24px; color: #ffffff; margin: 0; font-weight: bold;">
                                    Charleston Battle
                                </h1>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #1f2937;">
                                <p style="margin-top: 0;">Hi ${name || 'there'},</p>
                                <p>Thank you so much for reaching out! I've successfully received your message and appreciate you taking the time to connect regarding your project needs.</p>
                                
                                <p style="margin: 20px 0; padding: 15px; border-left: 4px solid #10b981; background-color: #f0fdf4;">
                                    I am personally reviewing your inquiry and will be in touch within **1 business day** to discuss how my web development expertise—especially in **HTML Email and E-Commerce**—can help you succeed.
                                </p>
                                
                                <p style="margin-top: 25px;">Best regards,</p>
                                <p style="margin: 0; font-weight: bold;">Charleston Battle</p>
                                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                                    <a href="https://charlestonbattle.vercel.app" style="color: #2563eb; text-decoration: none;">Web Developer & HTML Email Specialist</a>
                                </p>
                            </td>
                        </tr>
                        
                        <tr>
                            <td align="center" style="padding: 15px 0; font-family: Arial, sans-serif; font-size: 12px; color: #6b7280; background-color: #f3f4f6; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                                <p style="margin: 0;">&copy; 2024 Charleston Battle. All rights reserved.</p>
                                <p style="margin: 0; font-size: 11px;">
                                    If you believe you received this in error, you may <a href="https://charlestonbattle.vercel.app/#contact" style="color: #6b7280; text-decoration: underline;">unsubscribe here</a>.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    `;
};

// 3. The Vercel Handler (ES Module Syntax)
export default async function handler(req, res) {
    // Ensure we only accept POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).send('Method Not Allowed');
    }

    try {
        // Vercel automatically parses JSON bodies, so we can destructure directly
        const { name, email, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ msg: 'Missing required form data.' });
        }

        // 1. Message to Admin (You)
        const msgToAdmin = {
            to: process.env.ADMIN_EMAIL,
            from: { 
                email: process.env.ADMIN_EMAIL, 
                name: process.env.ADMIN_FROM_NAME 
            },
            subject: `NEW LEAD: Contact Form Submission from ${name}`,
            html: `
                <p>You received a new message from your portfolio contact form:</p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p style="border-left: 3px solid #10b981; padding-left: 10px;">${message.replace(/\n/g, '<br>')}</p>
                <p><strong>URL:</strong> https://charlestonbattle.vercel.app</p>
            `,
        };

        // 2. Message to Client (The HTML Email)
        const msgToClient = {
            to: email,
            from: { 
                email: process.env.ADMIN_EMAIL, 
                name: process.env.ADMIN_FROM_NAME 
            },
            subject: `Thank you for reaching out, ${name}!`,
            html: getThankYouHtml(name), // <--- Using your helper function here!
            text: `Hi ${name},\n\nThank you for reaching out! I've received your message and will be in touch within 1 business day to discuss your project.\n\nBest regards,\nCharleston Battle`
        };

        // Send both emails
        await sgMail.send([msgToAdmin, msgToClient]);

        // Success Response
        return res.status(200).json({ 
            success: true, 
            message: `Message sent successfully! A confirmation email has been sent to ${email}.` 
        });

    } catch (error) {
        console.error('SendGrid Error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Sorry, there was an issue sending the email.',
            error: error.message
        });
    }
}
