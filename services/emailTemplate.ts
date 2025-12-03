// components/emailTemplate.ts
interface EmailTemplateProps {
    jobPosition?: string;
    duration?: string;
    questionCount?: string | number;
    interviewType?: string;
    interviewLink: string;
    customMessage?: string;
}

const EmailTemplate = ({
    jobPosition,
    duration,
    questionCount,
    interviewType,
    interviewLink,
    customMessage
}: EmailTemplateProps): string => {
    return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
    <meta name="x-apple-disable-message-reformatting" />
    <link href="https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,500;0,600;0,700" rel="stylesheet" />
    <title>Interview Invitation - Talk2View AI Recruiter</title>
    <style>
        html, body { margin: 0 !important; padding: 0 !important; min-height: 100% !important; width: 100% !important; -webkit-font-smoothing: antialiased; }
        * { -ms-text-size-adjust: 100%; }
        #outlook a { padding: 0; }
        .ReadMsgBody, .ExternalClass { width: 100%; }
        .ExternalClass, .ExternalClass p, .ExternalClass td, .ExternalClass div, .ExternalClass span, .ExternalClass font { line-height: 100%; }
        table, td, th { mso-table-lspace: 0 !important; mso-table-rspace: 0 !important; border-collapse: collapse; }
        u + .body table, u + .body td, u + .body th { will-change: transform; }
        body, td, th, p, div, li, a, span { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-line-height-rule: exactly; }
        img { border: 0; outline: 0; line-height: 100%; text-decoration: none; -ms-interpolation-mode: bicubic; }
        a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
        .body .pc-project-body { background-color: transparent !important; }
        
        @media (max-width: 620px) {
            .pc-project-body {min-width: 0px !important;}
            .pc-project-container, .pc-component {width: 100% !important;}
            .pc-w620-padding-20-20-20-20 {padding: 20px 20px 20px 20px !important;}
            .pc-w620-font-size-40px {font-size: 40px !important;}
            .pc-w620-font-size-16px {font-size: 16px !important;}
            .pc-w620-padding-16-16-16-16 {padding: 16px 16px 16px 16px !important;}
        }
    </style>
</head>
<body style="width: 100% !important; min-height: 100% !important; margin: 0 !important; padding: 0 !important; font-weight: normal; color: #2D3A41; -webkit-font-smoothing: antialiased; background-color: #667eea;" bgcolor="#667eea">
    <table style="table-layout: fixed; width: 100%; min-width: 600px; background-color: #667eea;" bgcolor="#667eea" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tr>
            <td align="center" valign="top">
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="padding: 20px 0px;" align="left" valign="top">
                            <!-- Header -->
                            <table width="600" border="0" cellspacing="0" cellpadding="0" role="presentation" align="center" style="max-width: 600px;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); padding: 40px 16px; border-radius: 16px 16px 0px 0px;">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                            <tr>
                                                <td align="center" style="padding-bottom: 20px;">
                                                    <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
                                                        <h1 style="color: #ffffff; font-size: 48px; font-weight: 700; margin: 0; font-family: 'Inter', Arial, sans-serif;">Talk2View</h1>
                                                        <p style="color: #e3f2fd; font-size: 18px; margin: 8px 0 0 0; font-family: 'Inter', Arial, sans-serif;">AI Recruiter Platform</p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center">
                                                    <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a52, #ff8a50); color: white; padding: 15px 30px; border-radius: 50px; font-size: 20px; font-weight: 600; margin-bottom: 20px; font-family: 'Inter', Arial, sans-serif;">
                                                        🎯 Interview Invitation
                                                    </div>
                                                    <div style="font-size: 44px; line-height: 54px; color: #ffffff; font-family: 'Inter', Arial, sans-serif; font-weight: 600;">
                                                        You're Invited for an Interview!
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Main Content -->
                            <table width="600" border="0" cellspacing="0" cellpadding="0" role="presentation" align="center" style="max-width: 600px;">
                                <tr>
                                    <td style="padding: 44px 32px; background-color: #ffffff;" bgcolor="#ffffff">
                                        <!-- Welcome Message -->
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                            <tr>
                                                <td align="center" style="padding-bottom: 30px;">
                                                    <div style="font-size: 18px; line-height: 28px; color: #37474f; font-family: 'Inter', Arial, sans-serif;">
                                                        Congratulations! You have been selected for an interview through <strong style="color: #667eea;">Talk2View AI Recruiter</strong>. We're excited to learn more about you and your qualifications.
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Interview Details -->
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background: linear-gradient(135deg, #f8fdff 0%, #e1f5fe 100%); border: 2px solid #b3e5fc; border-radius: 16px; padding: 30px; margin-bottom: 30px;">
                                            <tr>
                                                <td>
                                                    <div style="font-size: 24px; font-weight: 600; color: #0277bd; font-family: 'Inter', Arial, sans-serif; text-align: center; margin-bottom: 25px;">
                                                        📋 Interview Details
                                                    </div>
                                                    
                                                    <!-- Position -->
                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background: rgba(255,255,255,0.8); border-radius: 12px; margin-bottom: 15px;">
                                                        <tr>
                                                            <td style="padding: 15px;">
                                                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="60" valign="top">
                                                                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; text-align: center; line-height: 48px; color: white; font-size: 20px;">💼</div>
                                                                        </td>
                                                                        <td valign="top" style="padding-left: 15px;">
                                                                            <div style="color: #0277bd; font-size: 14px; font-weight: 600; margin-bottom: 4px; font-family: 'Inter', Arial, sans-serif;">Position</div>
                                                                            <div style="color: #37474f; font-size: 16px; font-weight: 500; font-family: 'Inter', Arial, sans-serif;">${jobPosition || 'N/A'}</div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                    <!-- Duration -->
                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background: rgba(255,255,255,0.8); border-radius: 12px; margin-bottom: 15px;">
                                                        <tr>
                                                            <td style="padding: 15px;">
                                                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="60" valign="top">
                                                                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f093fb, #f5576c); border-radius: 12px; text-align: center; line-height: 48px; color: white; font-size: 20px;">⏰</div>
                                                                        </td>
                                                                        <td valign="top" style="padding-left: 15px;">
                                                                            <div style="color: #0277bd; font-size: 14px; font-weight: 600; margin-bottom: 4px; font-family: 'Inter', Arial, sans-serif;">Duration</div>
                                                                            <div style="color: #37474f; font-size: 16px; font-weight: 500; font-family: 'Inter', Arial, sans-serif;">${duration || 'Not specified'}</div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                    <!-- Questions -->
                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background: rgba(255,255,255,0.8); border-radius: 12px; margin-bottom: 15px;">
                                                        <tr>
                                                            <td style="padding: 15px;">
                                                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="60" valign="top">
                                                                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 12px; text-align: center; line-height: 48px; color: white; font-size: 20px;">❓</div>
                                                                        </td>
                                                                        <td valign="top" style="padding-left: 15px;">
                                                                            <div style="color: #0277bd; font-size: 14px; font-weight: 600; margin-bottom: 4px; font-family: 'Inter', Arial, sans-serif;">Number of Questions</div>
                                                                            <div style="color: #37474f; font-size: 16px; font-weight: 500; font-family: 'Inter', Arial, sans-serif;">${questionCount || 'N/A'}</div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                    <!-- Interview Type -->
                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background: rgba(255,255,255,0.8); border-radius: 12px;">
                                                        <tr>
                                                            <td style="padding: 15px;">
                                                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td width="60" valign="top">
                                                                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #43e97b, #38f9d7); border-radius: 12px; text-align: center; line-height: 48px; color: white; font-size: 20px;">🎯</div>
                                                                        </td>
                                                                        <td valign="top" style="padding-left: 15px;">
                                                                            <div style="color: #0277bd; font-size: 14px; font-weight: 600; margin-bottom: 4px; font-family: 'Inter', Arial, sans-serif;">Interview Type</div>
                                                                            <div style="color: #37474f; font-size: 16px; font-weight: 500; font-family: 'Inter', Arial, sans-serif;">${interviewType || 'General'}</div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        ${customMessage ? `
                                        <!-- Custom Message -->
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px;">
                                            <tr>
                                                <td style="background: linear-gradient(135deg, #ffecd2, #fcb69f); border-left: 4px solid #ff8a65; padding: 20px; border-radius: 12px;">
                                                    <div style="color: #d84315; font-size: 16px; font-weight: 600; margin-bottom: 10px; font-family: 'Inter', Arial, sans-serif;">
                                                        ℹ️ Additional Information
                                                    </div>
                                                    <div style="color: #bf360c; font-size: 15px; line-height: 1.5; font-family: 'Inter', Arial, sans-serif;">${customMessage}</div>
                                                </td>
                                            </tr>
                                        </table>
                                        ` : ''}

                                        <!-- CTA Button -->
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                            <tr>
                                                <td align="center" style="padding: 30px 0;">
                                                    <a href="${interviewLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: 600; font-family: 'Inter', Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px;">
                                                        🚀 Start Interview Now
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                            <tr>
                                                <td align="center">
                                                    <div style="color: #607d8b; font-size: 16px; font-family: 'Inter', Arial, sans-serif;">
                                                        ❤️ Best of luck with your interview!
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Footer -->
                            <table width="600" border="0" cellspacing="0" cellpadding="0" role="presentation" align="center" style="max-width: 600px;">
                                <tr>
                                    <td style="padding: 16px; background-color: #ffffff;" bgcolor="#ffffff">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                            <tr>
                                                <td align="center" style="padding: 44px 40px; background: linear-gradient(135deg, #263238 0%, #37474f 100%); border-radius: 12px;">
                                                    <div style="color: #90a4ae; font-size: 14px; margin-bottom: 8px; font-family: 'Inter', Arial, sans-serif;">
                                                        © 2025 Talk2View AI Recruiter. All rights reserved.
                                                    </div>
                                                    <div style="color: #78909c; font-size: 12px; font-family: 'Inter', Arial, sans-serif;">
                                                        Empowering careers through intelligent interviews
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

export default EmailTemplate;