// netlify/functions/send-thankyou-email.js

const sgMail = require('@sendgrid/mail');

// 1. Get Environment Variables
// Netlify securely injects these variables at runtime.
const { SENDGRID_API_KEY, ADMIN_EMAIL, ADMIN_FROM_NAME } = process.env;

// Set the SendGrid API key
if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

// 2. Cross-Client Compatible HTML Template
// This function generates the professional, responsive thank-you email body.
const getThankYouHtml = (name) => {
    // Note: Inline CSS and HTML tables are used for compatibility (as per the guide).
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
                                    <a href="https://charlestonbattle.netlify.app" style="color: #2563eb; text-decoration: none;">Web Developer & HTML Email Specialist</a>
                                </p>
                            </td>
                        </tr>
                        
                        <tr>
                            <td align="center" style="padding: 15px 0; font-family: Arial, sans-serif; font-size: 12px; color: #6b7280; background-color: #f3f4f6; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                                <p style="margin: 0;">&copy; 2024 Charleston Battle. All rights reserved.</p>
                                <p style="margin: 0; font-size: 11px;">
                                    If you believe you received this in error, you may <a href="https://charlestonbattle.netlify.app/#contact" style="color: #6b7280; text-decoration: underline;">unsubscribe here</a>.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    `;
};


// 3. Main Handler
exports.handler = async function (event) {
    // Enforce POST method
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const { name, email, message } = data; // Destructure form fields

        if (!name || !email || !message) {
            return { statusCode: 400, body: JSON.stringify({ msg: 'Missing required form data.' }) };
        }
        
        // 1. Message to the Admin (You)
        const msgToAdmin = {
            to: ADMIN_EMAIL,
            from: { email: ADMIN_EMAIL, name: ADMIN_FROM_NAME }, // Must be your verified SendGrid sender
            subject: `NEW LEAD: Contact Form Submission from ${name}`,
            html: `
                <p>You received a new message from your portfolio contact form:</p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p style="border-left: 3px solid #10b981; padding-left: 10px;">${message.replace(/\n/g, '<br>')}</p>
                <p><strong>URL:</strong> https://charlestonbattle.netlify.app</p>
            `,
        };

        // 2. Thank-You Email to the Sender (Client)
        const msgToClient = {
            to: email, // The client's email address
            from: { email: ADMIN_EMAIL, name: ADMIN_FROM_NAME }, // Must be your verified SendGrid sender
            subject: `Thank you for reaching out, ${name}!`,
            html: getThankYouHtml(name), 
            text: `Hi ${name},\n\nThank you for reaching out! I've received your message and will be in touch within 1 business day to discuss your project. I look forward to connecting with you soon!\n\nBest regards,\nCharleston Battle`
        };

        // Send both messages simultaneously using SendGrid's batch send
        await sgMail.send([msgToAdmin, msgToClient]);

        return {
            statusCode: 200,
            body: JSON.stringify({ msg: `Message sent successfully! A confirmation email has been sent to ${email}.` }),
        };

    } catch (err) {
        console.error('SendGrid/Server Error:', err.message);
        return {
            statusCode: err.code || 500,
            body: JSON.stringify({ msg: `Sorry, there was an issue sending the email. Status: ${err.code}` }),
        };
    }
};
