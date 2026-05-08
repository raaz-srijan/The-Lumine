import { ENV } from "../config/env.js";
import { transporter } from "./transporter.js";


//VERIFY-REGISTER-EMAIL
export const verifyRegisterEmail = async (email: string, token: string) => {
    const verifyUrl = `${ENV.FRONTEND_URL}/verify/${token}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lumine | Verify Account</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfcfc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin-top: 40px; margin-bottom: 40px; border: 1px solid #eeeeee;">
            <!-- Logo Section -->
            <tr>
                <td style="padding: 50px 0; text-align: center;">
                    <div style="display: inline-block; width: 50px; height: 50px; line-height: 50px; background-color: #111111; color: #ffffff; font-size: 24px; font-weight: bold; border-radius: 8px; margin-bottom: 15px;">L</div>
                    <h1 style="margin: 0; font-family: 'Times New Roman', serif; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; color: #111111;">Lumine</h1>
                    <p style="margin: 5px 0 0; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #999999;">Exclusive Beauty Suite</p>
                </td>
            </tr>
            
            <!-- Hero Divider -->
            <tr>
                <td style="padding: 0 40px;">
                    <div style="height: 1px; background-color: #f0f0f0;"></div>
                </td>
            </tr>

            <!-- Main Content -->
            <tr>
                <td style="padding: 50px 40px; text-align: center;">
                    <h2 style="font-family: 'Times New Roman', serif; font-size: 22px; color: #111111; margin-bottom: 20px; font-weight: normal; italic">Welcome to the inner circle.</h2>
                    <p style="color: #555555; font-size: 15px; line-height: 1.8; margin-bottom: 30px;">
                        To finalize your registry with <strong>Lumine</strong> and begin your journey toward effortless beauty, please confirm your membership by clicking below.
                    </p>
                    
                    <a href="${verifyUrl}" style="background-color: #111111; color: #ffffff; padding: 18px 35px; text-decoration: none; font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: inline-block; border-radius: 2px;">
                        Verify Membership
                    </a>
                </td>
            </tr>

            <!-- Details Section -->
            <tr>
                <td style="padding: 0 40px 50px; text-align: center;">
                    <p style="color: #999999; font-size: 12px; line-height: 1.6;">
                        This link is valid for 24 hours. If the button above does not work, please use the following secure URL:
                        <br>
                        <a href="${verifyUrl}" style="color: #C5A059; text-decoration: underline;">${verifyUrl}</a>
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="padding: 40px; background-color: #111111; text-align: center;">
                    <p style="margin: 0; color: #ffffff; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;">&copy; 2026 Lumine Beauty Group</p>
                    <p style="margin: 10px 0 0; color: #666666; font-size: 10px;">If you did not request this invitation, please ignore this email.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
    
    try {
        const info = await transporter.sendMail({
            from: `"The Lumine" <${ENV.SMTP_MAIL}>`, 
            to: email,
            subject: "Confirm Your Lumine Membership",
            html: htmlContent,
        });

        console.log("Lumine Verification Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Lumine Mail Error:", error);
        throw new Error("Failed to send verification email");
    }
};

//REQUEST-APPROVED
export const requestApproved = async (email: string) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lumine | Request Approved</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfcfc; margin: 0; padding: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin-top: 40px; margin-bottom: 40px; border: 1px solid #eeeeee;">
            
            <!-- Header Section -->
            <tr>
                <td style="padding: 40px 0; text-align: center; background-color: #111111;">
                    <div style="display: inline-block; width: 40px; height: 40px; line-height: 40px; background-color: #C5A059; color: #111111; font-size: 20px; font-weight: bold; border-radius: 4px; margin-bottom: 15px;">L</div>
                    <h1 style="margin: 0; font-family: 'Times New Roman', serif; font-size: 22px; letter-spacing: 5px; text-transform: uppercase; color: #ffffff;">Lumine</h1>
                </td>
            </tr>

            <!-- Success Icon / Graphic -->
            <tr>
                <td style="padding: 50px 40px 20px; text-align: center;">
                    <div style="font-size: 40px; margin-bottom: 10px;">✨</div>
                    <h2 style="font-family: 'Times New Roman', serif; font-size: 26px; color: #111111; margin: 0; font-weight: normal; font-style: italic;">Access Granted.</h2>
                    <p style="margin-top: 10px; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #C5A059; font-weight: bold;">Your request has been approved</p>
                </td>
            </tr>

            <!-- Body Content -->
            <tr>
                <td style="padding: 0 50px 40px; text-align: center;">
                    <p style="color: #555555; font-size: 15px; line-height: 1.8; margin-bottom: 30px;">
                        We are pleased to inform you that your recent request at <strong>Lumine</strong> has been reviewed and successfully approved by our specialists. 
                    </p>
                    
                    <div style="background-color: #f9f9f9; border: 1px solid #eeeeee; padding: 25px; border-radius: 4px; margin-bottom: 30px;">
                        <p style="margin: 0; font-size: 13px; color: #111111; line-height: 1.6;">
                            You can now access your personalized dashboard to manage your appointments, explore exclusive services, and view your curated beauty history.
                        </p>
                    </div>

                    <a href="${ENV.FRONTEND_URL}/dashboard" style="background-color: #111111; color: #ffffff; padding: 18px 35px; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: inline-block; border-radius: 2px;">
                        Enter the Suite
                    </a>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="padding: 40px; background-color: #fafafa; border-top: 1px solid #eeeeee; text-align: center;">
                    <p style="margin: 0; color: #111111; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-weight: bold;">Lumine Beauty Group</p>
                    <p style="margin: 8px 0 0; color: #999999; font-size: 10px;">Aesthetics. Precision. Elegance.</p>
                    <div style="margin-top: 20px;">
                        <a href="#" style="text-decoration: none; color: #C5A059; font-size: 11px; margin: 0 10px;">Instagram</a>
                        <a href="#" style="text-decoration: none; color: #C5A059; font-size: 11px; margin: 0 10px;">Concierge</a>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    try {
        const info = await transporter.sendMail({
            from: `"The Lumine" <${ENV.SMTP_MAIL}>`,
            to: email,
            subject: "Your Lumine Request: Approved",
            html: htmlContent,
        });

        return info;
    } catch (error) {
        console.error("Lumine Approval Mail Error:", error);
        throw new Error("Failed to send approval email");
    }
};

//USER-REVOKED
export const userRevoked = async (email: string, name: string) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lumine | Access Update</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfcfc; margin: 0; padding: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin-top: 40px; margin-bottom: 40px; border: 1px solid #eeeeee;">
            
            <!-- Branding Header -->
            <tr>
                <td style="padding: 40px 0; text-align: center; background-color: #111111;">
                    <h1 style="margin: 0; font-family: 'Times New Roman', serif; font-size: 22px; letter-spacing: 5px; text-transform: uppercase; color: #ffffff;">Lumine</h1>
                </td>
            </tr>

            <!-- Content Section -->
            <tr>
                <td style="padding: 60px 50px; text-align: center;">
                    <h2 style="font-family: 'Times New Roman', serif; font-size: 22px; color: #111111; margin: 0 0 20px; font-weight: normal; font-style: italic;">Notice of Access Deactivation.</h2>
                    
                    <p style="color: #555555; font-size: 14px; line-height: 1.8; margin-bottom: 25px; text-align: left;">
                        Dear ${name || 'User'},
                    </p>
                    
                    <p style="color: #555555; font-size: 14px; line-height: 1.8; margin-bottom: 25px; text-align: left;">
                        This communication is to formally notify you that your administrative access to the <strong>Lumine Digital Suite</strong> has been concluded by the system owner, effective immediately.
                    </p>
                    
                    <div style="background-color: #fff5f5; border: 1px solid #ffe3e3; padding: 20px; text-align: left; margin-bottom: 30px;">
                        <p style="margin: 0; font-size: 12px; color: #c53030; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Security Notice:</p>
                        <p style="margin: 5px 0 0; font-size: 13px; color: #742a2a; line-height: 1.5;">
                            Your credentials have been deactivated. All scheduled tasks, inventory permissions, and registry access points associated with this account are now void.
                        </p>
                    </div>

                    <p style="color: #999999; font-size: 12px; line-height: 1.6;">
                        If you believe this deactivation requires further clarification, please contact your primary branch manager or the salon owner directly.
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="padding: 40px; background-color: #fafafa; border-top: 1px solid #eeeeee; text-align: center;">
                    <p style="margin: 0; color: #111111; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-weight: bold;">Lumine Security Protocol</p>
                    <p style="margin: 8px 0 0; color: #999999; font-size: 9px;">This is an automated security log. No reply is required.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    try {
        const info = await transporter.sendMail({
            from: `"The Lumine" <${ENV.SMTP_MAIL}>`,
            to: email,
            subject: "Lumine | Notice of Access Conclusion",
            html: htmlContent,
        });

        return info;
    } catch (error) {
        console.error("Lumine Security Mail Error:", error);
        throw new Error("Failed to send deactivation email");
    }
};

//USER-ROLE-ASSIGNED
export const userRoleAssigned = async (email: string, name: string, roleName: string) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lumine | Role Appointment</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfcfc; margin: 0; padding: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin-top: 40px; margin-bottom: 40px; border: 1px solid #eeeeee; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
            
            <tr>
                <td style="padding: 50px 0; text-align: center; background-color: #111111;">
                    <div style="display: inline-block; width: 45px; height: 45px; line-height: 45px; background-color: #C5A059; color: #111111; font-size: 22px; font-weight: bold; border-radius: 50%; margin-bottom: 15px;">L</div>
                    <h1 style="margin: 0; font-family: 'Times New Roman', serif; font-size: 24px; letter-spacing: 6px; text-transform: uppercase; color: #ffffff;">Lumine</h1>
                </td>
            </tr>

            <tr>
                <td style="padding: 60px 50px; text-align: center;">
                    <h2 style="font-family: 'Times New Roman', serif; font-size: 26px; color: #111111; margin: 0 0 15px; font-weight: normal; font-style: italic;">A New Appointment.</h2>
                    <p style="margin-top: 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #C5A059; font-weight: bold;">Official Role Designation</p>
                    
                    <p style="color: #555555; font-size: 15px; line-height: 1.8; margin: 30px 0;">
                        Greetings ${name},<br><br>
                        Your profile within the <strong>Lumine Digital Suite</strong> has been updated. You have been formally appointed to the following position:
                    </p>
                    
                    <div style="background-color: #fafafa; border: 1px dashed #C5A059; padding: 30px; margin-bottom: 35px; border-radius: 4px;">
                        <span style="display: block; font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Designated Title</span>
                        <span style="font-family: 'Times New Roman', serif; font-size: 28px; color: #111111; font-style: italic;">${roleName}</span>
                    </div>

                    <p style="color: #666666; font-size: 14px; line-height: 1.8; margin-bottom: 40px;">
                        Your permissions and suite access have been synchronized to reflect this new role. You may now explore your updated dashboard and tools.
                    </p>

                    <a href="${ENV.FRONTEND_URL}/dashboard" style="background-color: #111111; color: #ffffff; padding: 18px 40px; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: inline-block; border-radius: 2px;">
                        Access the Suite
                    </a>
                </td>
            </tr>

            <tr>
                <td style="padding: 40px; background-color: #fcfcfc; border-top: 1px solid #eeeeee; text-align: center;">
                    <p style="margin: 0; color: #111111; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-weight: bold;">Lumine Administration</p>
                    <p style="margin: 10px 0 0; color: #999999; font-size: 10px;">Elegance in every operation.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    try {
        const info = await transporter.sendMail({
            from: `"Lumine Admin" <${ENV.SMTP_MAIL}>`,
            to: email,
            subject: `Lumine Appointment: ${roleName}`,
            html: htmlContent,
        });

        return info;
    } catch (error) {
        console.error("Lumine Role Assignment Mail Error:", error);
        throw new Error("Failed to send role assignment email");
    }
};

//PASSWORD-CHANGED
export const passwordChanged = async (email: string, name: string) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lumine | Security Alert</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfcfc; margin: 0; padding: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin-top: 40px; margin-bottom: 40px; border: 1px solid #eeeeee;">
            
            <!-- Minimalist Branding -->
            <tr>
                <td style="padding: 40px 0; text-align: center; border-bottom: 1px solid #f0f0f0;">
                    <h1 style="margin: 0; font-family: 'Times New Roman', serif; font-size: 20px; letter-spacing: 5px; text-transform: uppercase; color: #111111;">Lumine</h1>
                    <p style="margin: 5px 0 0; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #999999;">Security & Privacy</p>
                </td>
            </tr>

            <!-- Content Section -->
            <tr>
                <td style="padding: 60px 50px; text-align: center;">
                    <div style="margin-bottom: 25px;">
                        <span style="background-color: #111111; color: #ffffff; padding: 5px 12px; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; border-radius: 2px;">Update Confirmed</span>
                    </div>

                    <h2 style="font-family: 'Times New Roman', serif; font-size: 24px; color: #111111; margin: 0 0 20px; font-weight: normal; font-style: italic;">Your password has been updated.</h2>
                    
                    <p style="color: #555555; font-size: 14px; line-height: 1.8; margin-bottom: 30px;">
                        Dear ${name},<br>
                        This is a formal confirmation that the password for your <strong>Lumine Suite</strong> account was successfully changed. If this was you, no further action is required.
                    </p>
                    
                    <!-- Safety Guard -->
                    <div style="background-color: #fafafa; border: 1px solid #eeeeee; padding: 25px; text-align: left; border-radius: 2px;">
                        <p style="margin: 0; font-size: 12px; color: #111111; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Wasn't you?</p>
                        <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.6;">
                            If you did not authorize this change, please contact our security concierge immediately to secure your account and registry data.
                        </p>
                    </div>
                </td>
            </tr>

            <!-- Action Section -->
            <tr>
                <td style="padding: 0 50px 60px; text-align: center;">
                    <a href="mailto:${ENV.SMTP_MAIL}" style="color: #C5A059; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; border-bottom: 1px solid #C5A059; padding-bottom: 2px;">
                        Report Unauthorized Activity
                    </a>
                </td>
            </tr>

            <!-- Footer Section -->
            <tr>
                <td style="padding: 40px; background-color: #111111; text-align: center;">
                    <p style="margin: 0; color: #666666; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;">Lumine Security Protocol</p>
                    <p style="margin: 10px 0 0; color: #444444; font-size: 9px; line-height: 1.4;">
                        This automated notification was sent to ${email} for your protection.
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: `"Lumine Security" <${ENV.SMTP_MAIL}>`,
            to: email,
            subject: "Lumine | Password Change Confirmation",
            html: htmlContent,
        });
    } catch (error) {
        console.error("Lumine Password Change Mail Error:", error);
    }
};