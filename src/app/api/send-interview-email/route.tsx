import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      to, // Can be string or array
      jobPosition,
      duration,
      questionCount,
      interviewType,
      interviewLink,
      customMessage,
    } = body;

    // Handle both single email and array of emails
    const recipients = Array.isArray(to) ? to : [to];

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one recipient email is required" },
        { status: 400 }
      );
    }

    // Validate all emails
    const invalidEmails = recipients.filter(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(email);
    });

    if (invalidEmails.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email addresses",
          invalidEmails
        },
        { status: 400 }
      );
    }

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const results = [];

    // Send to each recipient
    for (const recipient of recipients) {
      try {
        const subject = `🎯 Interview Invitation - ${jobPosition || "Position"
          } | Talk2Hire AI Recruiter`;

        const htmlContent = `
<!DOCTYPE html>
<html
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <!--[if !mso]><!-- -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no" />
    <meta name="x-apple-disable-message-reformatting" />
    <link
      href="https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,500;0,600;0,700"
      rel="stylesheet" />
    <link
      href="https://fonts.googleapis.com/css?family=Poppins:ital,wght@0,400;0,600"
      rel="stylesheet" />
    <title>Untitled</title>
    <!-- Made with Postcards Email Builder by Designmodo -->
    <style>
      html,
      body {
        margin: 0 !important;
        padding: 0 !important;
        min-height: 100% !important;
        width: 100% !important;
        -webkit-font-smoothing: antialiased;
      }

      * {
        -ms-text-size-adjust: 100%;
      }

      #outlook a {
        padding: 0;
      }

      .ReadMsgBody,
      .ExternalClass {
        width: 100%;
      }

      .ExternalClass,
      .ExternalClass p,
      .ExternalClass td,
      .ExternalClass div,
      .ExternalClass span,
      .ExternalClass font {
        line-height: 100%;
      }

      table,
      td,
      th {
        mso-table-lspace: 0 !important;
        mso-table-rspace: 0 !important;
        border-collapse: collapse;
      }

      u + .body table,
      u + .body td,
      u + .body th {
        will-change: transform;
      }

      body,
      td,
      th,
      p,
      div,
      li,
      a,
      span {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        mso-line-height-rule: exactly;
      }

      img {
        border: 0;
        outline: 0;
        line-height: 100%;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }

      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
      }

      .body .pc-project-body {
        background-color: transparent !important;
      }

      @media screen and (-webkit-min-device-pixel-ratio: 0) {
        .pc-img-h-pct {
          height: auto !important;
        }
      }

      @media (min-width: 621px) {
        .pc-lg-hide {
          display: none;
        }

        .pc-lg-bg-img-hide {
          background-image: none !important;
        }
      }
    </style>
    <style>
      @media (max-width: 620px) {
        .pc-project-body {
          min-width: 0px !important;
        }

        .pc-project-container,
        .pc-component {
          width: 100% !important;
        }

        .pc-sm-hide {
          display: none !important;
        }

        .pc-sm-bg-img-hide {
          background-image: none !important;
        }

        .pc-w620-padding-0-0-0-0 {
          padding: 0px 0px 0px 0px !important;
        }

        .pc-w620-itemsVSpacings-20 {
          padding-top: 10px !important;
          padding-bottom: 10px !important;
        }

        .pc-w620-itemsHSpacings-0 {
          padding-left: 0px !important;
          padding-right: 0px !important;
        }

        table.pc-w620-spacing-0-0-20-16 {
          margin: 0px 0px 20px 16px !important;
        }

        td.pc-w620-spacing-0-0-20-16,
        th.pc-w620-spacing-0-0-20-16 {
          margin: 0 !important;
          padding: 0px 0px 20px 16px !important;
        }

        .pc-w620-font-size-40px {
          font-size: 40px !important;
        }

        .pc-w620-line-height-46px {
          line-height: 46px !important;
        }

        .pc-w620-itemsVSpacings-0 {
          padding-top: 0px !important;
          padding-bottom: 0px !important;
        }

        .pc-w620-itemsHSpacings-8 {
          padding-left: 4px !important;
          padding-right: 4px !important;
        }

        .pc-w620-width-fill {
          width: 100% !important;
        }

        .pc-w620-width-100pc {
          width: 100% !important;
        }

        .pc-w620-radius-8-8-0-0 {
          border-radius: 8px 8px 0px 0px !important;
        }

        .pc-w620-radius-0-0-8-8 {
          border-radius: 0px 0px 8px 8px !important;
        }

        .pc-w620-padding-20-20-20-20 {
          padding: 20px 20px 20px 20px !important;
        }

        table.pc-w620-spacing-0-0-24-0 {
          margin: 0px 0px 24px 0px !important;
        }

        td.pc-w620-spacing-0-0-24-0,
        th.pc-w620-spacing-0-0-24-0 {
          margin: 0 !important;
          padding: 0px 0px 24px 0px !important;
        }

        .pc-w620-font-size-38px {
          font-size: 38px !important;
        }

        .pc-w620-line-height-36px {
          line-height: 36px !important;
        }

        .pc-w620-padding-20-16-0-16 {
          padding: 20px 16px 0px 16px !important;
        }

        table.pc-w620-spacing-0-0-0-0 {
          margin: 0px 0px 0px 0px !important;
        }

        td.pc-w620-spacing-0-0-0-0,
        th.pc-w620-spacing-0-0-0-0 {
          margin: 0 !important;
          padding: 0px 0px 0px 0px !important;
        }

        .pc-w620-font-size-16px {
          font-size: 16px !important;
        }

        .pc-w620-line-height-24px {
          line-height: 24px !important;
        }

        .pc-w620-padding-20-16-20-16 {
          padding: 20px 16px 20px 16px !important;
        }

        table.pc-w620-spacing-0-0-20-0 {
          margin: 0px 0px 20px 0px !important;
        }

        td.pc-w620-spacing-0-0-20-0,
        th.pc-w620-spacing-0-0-20-0 {
          margin: 0 !important;
          padding: 0px 0px 20px 0px !important;
        }

        .pc-w620-font-size-28px {
          font-size: 28px !important;
        }

        .pc-w620-line-height-32px {
          line-height: 32px !important;
        }

        .pc-w620-letter-spacing--1px {
          letter-spacing: -1px !important;
        }

        .pc-w620-itemsVSpacings-16 {
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }

        table.pc-w620-spacing-0-0-32-0 {
          margin: 0px 0px 32px 0px !important;
        }

        td.pc-w620-spacing-0-0-32-0,
        th.pc-w620-spacing-0-0-32-0 {
          margin: 0 !important;
          padding: 0px 0px 32px 0px !important;
        }

        .pc-w620-itemsVSpacings-30 {
          padding-top: 15px !important;
          padding-bottom: 15px !important;
        }

        .pc-w620-width-60 {
          width: 60px !important;
        }

        .pc-w620-height-auto {
          height: auto !important;
        }

        .pc-w620-line-height-26px {
          line-height: 26px !important;
        }

        .pc-w620-dir-ltr {
          direction: ltr !important;
        }

        .pc-w620-valign-top {
          vertical-align: top !important;
        }

        td.pc-w620-halign-center,
        th.pc-w620-halign-center {
          text-align: center !important;
          text-align-last: center !important;
        }

        table.pc-w620-halign-center {
          float: none !important;
          margin-right: auto !important;
          margin-left: auto !important;
        }

        img.pc-w620-halign-center {
          margin-right: auto !important;
          margin-left: auto !important;
        }

        div.pc-w620-align-center,
        th.pc-w620-align-center,
        a.pc-w620-align-center,
        td.pc-w620-align-center {
          text-align: center !important;
          text-align-last: center !important;
        }

        table.pc-w620-align-center {
          float: none !important;
          margin-right: auto !important;
          margin-left: auto !important;
        }

        img.pc-w620-align-center {
          margin-right: auto !important;
          margin-left: auto !important;
        }

        .pc-w620-text-align-center {
          text-align: center !important;
          text-align-last: center !important;
        }

        .pc-w620-line-height-29px {
          line-height: 29px !important;
        }

        div.pc-w620-textAlign-center,
        th.pc-w620-textAlign-center,
        a.pc-w620-textAlign-center,
        td.pc-w620-textAlign-center {
          text-align: center !important;
          text-align-last: center !important;
        }

        table.pc-w620-textAlign-center {
          float: none !important;
          margin-right: auto !important;
          margin-left: auto !important;
        }

        img.pc-w620-textAlign-center {
          margin-right: auto !important;
          margin-left: auto !important;
        }

        .pc-w620-padding-12-24-12-24 {
          padding: 12px 24px 12px 24px !important;
        }

        .pc-w620-padding-32-20-32-20 {
          padding: 32px 20px 32px 20px !important;
        }

        .pc-w620-itemsHSpacings-20 {
          padding-left: 10px !important;
          padding-right: 10px !important;
        }

        .pc-w620-width-160 {
          width: 160px !important;
        }

        .pc-w620-itemsHSpacings-16 {
          padding-left: 8px !important;
          padding-right: 8px !important;
        }

        .pc-w620-font-size-14px {
          font-size: 14px !important;
        }

        .pc-w620-padding-16-16-16-16 {
          padding: 16px 16px 16px 16px !important;
        }

        .pc-g-ib {
          display: inline-block !important;
        }

        .pc-g-b {
          display: block !important;
        }

        .pc-g-rb {
          display: block !important;
          width: auto !important;
        }

        .pc-g-wf {
          width: 100% !important;
        }

        .pc-g-rpt {
          padding-top: 0 !important;
        }

        .pc-g-rpr {
          padding-right: 0 !important;
        }

        .pc-g-rpb {
          padding-bottom: 0 !important;
        }

        .pc-g-rpl {
          padding-left: 0 !important;
        }
      }
    </style>
    <!--[if !mso]><!-- -->
    <style>
      @font-face {
        font-family: "Inter";
        font-style: normal;
        font-weight: 500;
        src: url("https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZFhjg.woff")
            format("woff"),
          url("https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZFhiA.woff2")
            format("woff2");
      }

      @font-face {
        font-family: "Inter";
        font-style: normal;
        font-weight: 400;
        src: url("https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZFhjg.woff")
            format("woff"),
          url("https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZFhiA.woff2")
            format("woff2");
      }

      @font-face {
        font-family: "Inter";
        font-style: normal;
        font-weight: 700;
        src: url("https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZFhjg.woff")
            format("woff"),
          url("https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZFhiA.woff2")
            format("woff2");
      }

      @font-face {
        font-family: "Inter";
        font-style: normal;
        font-weight: 600;
        src: url("https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZFhjg.woff")
            format("woff"),
          url("https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZFhiA.woff2")
            format("woff2");
      }

      @font-face {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 600;
        src: url("https://fonts.gstatic.com/s/poppins/v23/pxiByp8kv8JHgFVrLEj6Z1JlEw.woff")
            format("woff"),
          url("https://fonts.gstatic.com/s/poppins/v23/pxiByp8kv8JHgFVrLEj6Z1JlFQ.woff2")
            format("woff2");
      }

      @font-face {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 400;
        src: url("https://fonts.gstatic.com/s/poppins/v23/pxiEyp8kv8JHgFVrJJnedA.woff")
            format("woff"),
          url("https://fonts.gstatic.com/s/poppins/v23/pxiEyp8kv8JHgFVrJJnecg.woff2")
            format("woff2");
      }
    </style>
    <!--<![endif]-->
    <!--[if mso]>
      <style type="text/css">
        .pc-font-alt {
          font-family: Arial, Helvetica, sans-serif !important;
        }
      </style>
    <![endif]-->
    <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
  </head>

  <body
    class="body pc-font-alt"
    style="
      width: 100% !important;
      min-height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      font-weight: normal;
      color: #2d3a41;
      mso-line-height-rule: exactly;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-variant-ligatures: normal;
      text-rendering: optimizeLegibility;
      -moz-osx-font-smoothing: grayscale;
      background-color: #AFEEEE;
    "
    bgcolor="#AFEEEE">
    <table
      class="pc-project-body"
      style="
        table-layout: fixed;
        width: 100%;
        min-width: 600px;
        background-color: #AFEEEE;
      "
      bgcolor="#AFEEEE"
      border="0"
      cellspacing="0"
      cellpadding="0"
      role="presentation">
      <tr>
        <td align="center" valign="top" style="width: auto">
          <table
            class="pc-project-container"
            align="center"
            border="0"
            cellpadding="0"
            cellspacing="0"
            role="presentation">
            <tr>
              <td
                class="pc-w620-padding-0-0-0-0"
                style="padding: 20px 0px 20px 0px"
                align="left"
                valign="top">
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  width="100%">
                  <tr>
                    <td valign="top">
                      <!-- BEGIN MODULE: Header -->
                      <table
                        width="100%"
                        border="0"
                        cellspacing="0"
                        cellpadding="0"
                        role="presentation"
                        align="center"
                        class="pc-component"
                        style="width: 600px; max-width: 600px">
                        <tr>
                          <td
                            class="pc-w620-spacing-0-0-0-0"
                            width="100%"
                            border="0"
                            cellspacing="0"
                            cellpadding="0"
                            role="presentation">
                            <table
                              class="pc-component"
                              style="width: 600px; max-width: 600px"
                              align="center"
                              width="100%"
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                              role="presentation">
                              <tr>
                                <!--[if !gte mso 9]><!-- -->
                                <td
                                  valign="top"
                                  class="pc-w620-padding-20-16-0-16"
                                  style="
                                    background-image: url('https://cloudfilesdm.com/postcards/image-17383174517913.png');
                                    background-size: cover;
                                    background-position: center;
                                    background-repeat: no-repeat;
                                    padding: 40px 16px 0px 16px;
                                    height: unset;
                                    background-color: #ffffff;
                                  "
                                  bgcolor="#ffffff"
                                  background="https://cloudfilesdm.com/postcards/image-17383174517913.png">
                                  <!--<![endif]-->
                                  <!--[if gte mso 9]>
                <td valign="top" align="center" style="background-image: url('https://cloudfilesdm.com/postcards/image-17383174517913.png'); background-size: cover; background-position: center; background-repeat: no-repeat; background-color: #ffffff; border-radius: 0px;" bgcolor="#ffffff" background="https://cloudfilesdm.com/postcards/image-17383174517913.png">
            <![endif]-->
                                  <!--[if gte mso 9]>
                <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width: 600px;">
                    <v:fill src="https://cloudfilesdm.com/postcards/image-17383174517913.png" color="#ffffff" type="frame" size="1,1" aspect="atleast" origin="0,0" position="0,0"/>
                    <v:textbox style="mso-fit-shape-to-text: true;" inset="0,0,0,0">
                        <div style="font-size: 0; line-height: 0;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td style="font-size: 14px; line-height: 1.5;" valign="top">
                                        <p style="margin:0;mso-hide:all"><o:p xmlns:o="urn:schemas-microsoft-com:office:office">&nbsp;</o:p></p>
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                            <tr>
                                                <td colspan="3" height="40" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td width="16" valign="top" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                                <td valign="top" align="left">
                <![endif]-->
                                  <table
                                    width="100%"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    role="presentation">
                                    <tr>
                                      <td
                                        style="
                                          padding: 0px 0px 32px 16px;
                                          mso-padding-left-alt: 0;
                                          margin-left: 16px;
                                        ">
                                        <table
                                          class="pc-width-fill pc-g-b"
                                          width="100%"
                                          border="0"
                                          cellpadding="0"
                                          cellspacing="0"
                                          role="presentation">
                                          <tbody class="pc-g-b">
                                            <tr class="pc-g-ib pc-g-wf">
                                              <td
                                                class="pc-g-rb pc-g-rpt pc-g-rpb pc-g-wf pc-w620-itemsVSpacings-20"
                                                align="left"
                                                valign="middle"
                                                style="
                                                  padding-top: 0px;
                                                  padding-bottom: 0px;
                                                ">
                                                <table
                                                width= "100%"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  role="presentation"
                                                  style="display: inline-table;">
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="middle"
                                                      style="padding: 0; margin: 0;">
                                                      <a
                                                        class="pc-font-alt"
                                                        href="#"
                                                        target="_blank"
                                                        style="
                                                          text-decoration: none;
                                                          display: block;
                                                          vertical-align: top;
                                                        ">
                                                        <div
                                                          style="
                                                            display: flex;
                                                            align-items: center;
                                                            justify-content: center;
                                                            gap: 50px;
                                                          ">
                                                          <img
                                                            src="cid:logo"
                                                            alt="Talk2Hire Logo"
                                                            style="
                                                              height: 40px;
                                                              display: flex;
                                                              border: 0;
                                                            " />
                                                          <span
                                                            style="
                                                              font-family: 'Inter',
                                                                Arial, Helvetica,
                                                                sans-serif;
                                                              font-size: 22px;
                                                              font-weight: 700;
                                                              color: #318CE7;
                                                            "
                                                            ></span
                                                          >
                                                        </div>
                                                      </a>
                                                    </td>
                                                  </tr>
                                                </table>
                                              </td>
                                                </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>
                                  <table
                                    width="100%"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    role="presentation">
                                    <tr>
                                      <td
                                        class="pc-w620-spacing-0-0-20-16"
                                        align="left"
                                        valign="top"
                                        style="
                                          padding: 0px 110px 44px 16px;
                                          mso-padding-left-alt: 0;
                                          margin-left: 16px;
                                          height: auto;
                                        ">
                                        <table
                                          border="0"
                                          cellpadding="0"
                                          cellspacing="0"
                                          role="presentation"
                                          width="100%"
                                          align="left">
                                          <tr>
                                            <td valign="top" align="left">
                                              <div
                                                class="pc-font-alt"
                                                style="text-decoration: none">
                                                <div
                                                  style="
                                                    font-size: 40px;
                                                    line-height: 46px;
                                                    text-align: left;
                                                    text-align-last: left;
                                                    color: #000f89;
                                                    font-family: 'Inter', Arial,
                                                      Helvetica, sans-serif;
                                                    font-style: normal;
                                                    letter-spacing: -1px;
                                                  ">
                                                  <div
                                                    style="
                                                      font-family: 'Inter',
                                                        Arial, Helvetica,
                                                        sans-serif;
                                                    ">
                                                    <span
                                                      style="
                                                        font-family: 'Inter',
                                                          Arial, Helvetica,
                                                          sans-serif;
                                                        font-weight: 600;
                                                        font-size: 40px;
                                                        line-height: 54px;
                                                      "
                                                      class="pc-w620-font-size-4px pc-w620-line-height-46px"
                                                      >Live, Intelligent, and
                                                      Seamless Interviews with
                                                      Talk2Hire</span
                                                    >
                                                  </div>
                                                </div>
                                              </div>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>
                                  <table
                                    class="pc-width-fill pc-g-b"
                                    width="100%"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    role="presentation">
                                    <tbody class="pc-g-b">
                                      <tr class="pc-g-ib pc-g-wf">
                                        <td
                                          class="pc-g-rb pc-g-rpt pc-g-wf pc-w620-itemsVSpacings-0"
                                          align="left"
                                          valign="top"
                                          style="
                                            padding-top: 0px;
                                            padding-bottom: 0px;
                                          ">
                                          <table
                                            class="pc-w620-width-fill"
                                            style="width: 100%"
                                            border="0"
                                            cellpadding="0"
                                            cellspacing="0"
                                            role="presentation">
                                            <tr>
                                              <td align="left" valign="top">
                                                <img
                                                  src="https://cloudfilesdm.com/postcards/image-1739373080685.png"
                                                  class="pc-w620-radius-8-8-0-0"
                                                  width="360"
                                                  height="auto"
                                                  alt=""
                                                  style="
                                                    display: block;
                                                    outline: 0;
                                                    line-height: 100%;
                                                    -ms-interpolation-mode: bicubic;
                                                    width: 100%;
                                                    height: auto;
                                                    border-radius: 8px 8px 8px
                                                      8px;
                                                    border: 0;
                                                  " />
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                        <td
                                          class="pc-w620-itemsHSpacings-8"
                                          valign="top"
                                          style="
                                            padding-right: 4px;
                                            padding-left: 4px;
                                            mso-padding-left-alt: 0;
                                            margin-left: 4px;
                                          " />
                                        <td
                                          class="pc-g-rb pc-g-rpb pc-g-wf pc-w620-itemsVSpacings-0"
                                          align="left"
                                          valign="top"
                                          style="
                                            padding-top: 0px;
                                            padding-bottom: 0px;
                                          ">
                                          <table
                                            class="pc-w620-width-fill"
                                            style="width: 200px"
                                            border="0"
                                            cellpadding="0"
                                            cellspacing="0"
                                            role="presentation">
                                            <tr>
                                              <td
                                                class="pc-w620-radius-0-0-8-8 pc-w620-padding-20-20-20-20"
                                                align="left"
                                                valign="top"
                                                style="
                                                  padding: 24px 24px 24px 24px;
                                                  mso-padding-left-alt: 0;
                                                  margin-left: 24px;
                                                  height: auto;
                                                  background-color: #000f89;;
                                                  border-radius: 8px 8px 8px 8px;
                                                ">
                                                <table
                                                  width="100%"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  role="presentation">
                                                  <tr>
                                                    <td
                                                      align="left"
                                                      valign="top"
                                                      style="
                                                        line-height: 1px;
                                                        font-size: 1px;
                                                      ">
                                                      <table
                                                        width="100%"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td
                                                            class="pc-w620-spacing-0-0-24-0"
                                                            align="left"
                                                            valign="top"
                                                            style="
                                                              padding: 0px 0px
                                                                46px 0px;
                                                              height: auto;
                                                            ">
                                                            <img
                                                              src="https://cloudfilesdm.com/postcards/image-17383174514762.png"
                                                              width="30"
                                                              height="30"
                                                              alt=""
                                                              style="
                                                                display: block;
                                                                outline: 0;
                                                                line-height: 100%;
                                                                -ms-interpolation-mode: bicubic;
                                                                width: 30px;
                                                                height: auto;
                                                                max-width: 100%;
                                                                border: 0;
                                                              " />
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td
                                                      align="left"
                                                      valign="top">
                                                      <table
                                                        width="100%"
                                                        align="left"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td
                                                            valign="top"
                                                            style="
                                                              padding: 0px 0px
                                                                6px 0px;
                                                              height: auto;
                                                            ">
                                                            <table
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation"
                                                              width="100%"
                                                              align="left">
                                                              <tr>
                                                                <td
                                                                  valign="top"
                                                                  align="left">
                                                                  <div
                                                                    class="pc-font-alt"
                                                                    style="
                                                                      text-decoration: none;
                                                                    ">
                                                                    <div
                                                                      style="
                                                                        font-size: 38px;
                                                                        line-height: 36px;
                                                                        text-align: left;
                                                                        text-align-last: left;
                                                                        color: #ffffff;
                                                                        font-family: 'Poppins',
                                                                          Arial,
                                                                          Helvetica,
                                                                          sans-serif;
                                                                        font-style: normal;
                                                                        letter-spacing: 0px;
                                                                      ">
                                                                      <div
                                                                        style="
                                                                          font-family: 'Poppins',
                                                                            Arial,
                                                                            Helvetica,
                                                                            sans-serif;
                                                                        ">
                                                                        <span
                                                                          style="
                                                                            font-family: 'Poppins',
                                                                              Arial,
                                                                              Helvetica,
                                                                              sans-serif;
                                                                            font-weight: 600;
                                                                            font-size: 50px;
                                                                            line-height: 60px;
                                                                          "
                                                                          class="pc-w620-font-size-38px pc-w620-line-height-36px"
                                                                          >Coming</span
                                                                        ><span
                                                                          style="
                                                                            font-family: 'Poppins',
                                                                              Arial,
                                                                              Helvetica,
                                                                              sans-serif;
                                                                            font-weight: 600;
                                                                            font-size: 50px;
                                                                            line-height: 60px;
                                                                          "
                                                                          class="pc-w620-line-height-36px pc-w620-font-size-38px"
                                                                          >!</span
                                                                        >
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                </td>
                                                              </tr>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td
                                                      align="left"
                                                      valign="top">
                                                      <table
                                                        width="100%"
                                                        align="left"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td valign="top">
                                                            <table
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation"
                                                              width="100%"
                                                              align="left">
                                                              <tr>
                                                                <td
                                                                  valign="top"
                                                                  align="left">
                                                                  <div
                                                                    class="pc-font-alt"
                                                                    style="
                                                                      text-decoration: none;
                                                                    ">
                                                                    <div
                                                                      style="
                                                                        font-size: 16px;
                                                                        line-height: 24px;
                                                                        text-align: left;
                                                                        text-align-last: left;
                                                                        color: #ffffffb8;
                                                                        font-family: 'Poppins',
                                                                          Arial,
                                                                          Helvetica,
                                                                          sans-serif;
                                                                        font-style: normal;
                                                                        letter-spacing: 0px;
                                                                      ">
                                                                      <div
                                                                        style="
                                                                          font-family: 'Poppins',
                                                                            Arial,
                                                                            Helvetica,
                                                                            sans-serif;
                                                                        ">
                                                                        <span
                                                                          style="
                                                                            font-family: 'Poppins',
                                                                              Arial,
                                                                              Helvetica,
                                                                              sans-serif;
                                                                            font-weight: 400;
                                                                            font-size: 16px;
                                                                            line-height: 24px;
                                                                          "
                                                                          >Next-gen
                                                                          users
                                                                          around
                                                                          the
                                                                          world</span
                                                                        >
                                                                      </div>
                                                                    </div>
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
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <!--[if gte mso 9]>
                                                </td>
                                                <td width="16" style="line-height: 1px; font-size: 1px;" valign="top">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" height="0" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <p style="margin:0;mso-hide:all"><o:p xmlns:o="urn:schemas-microsoft-com:office:office">&nbsp;</o:p></p>
                    </v:textbox>
                </v:rect>
                <![endif]-->
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <!-- END MODULE: Header -->
                    </td>
                  </tr>
                  <tr>
                    <td valign="top">
                      <!-- BEGIN MODULE: Hi -->
                      <table
                        width="100%"
                        border="0"
                        cellspacing="0"
                        cellpadding="0"
                        role="presentation"
                        align="center"
                        class="pc-component"
                        style="width: 600px; max-width: 600px">
                        <tr>
                          <td
                            class="pc-w620-spacing-0-0-0-0"
                            width="100%"
                            border="0"
                            cellspacing="0"
                            cellpadding="0"
                            role="presentation">
                            <table
                              class="pc-component"
                              style="width: 600px; max-width: 600px"
                              align="center"
                              width="100%"
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                              role="presentation">
                              <tr>
                                <td
                                  valign="top"
                                  class="pc-w620-padding-20-20-20-20"
                                  style="
                                    padding: 44px 32px 44px 32px;
                                    height: unset;
                                    background-color: #ffffff;
                                  "
                                  bgcolor="#ffffff">
                                  <table
                                    width="100%"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    role="presentation">
                                    <tr>
                                      <td
                                        align="center"
                                        valign="top"
                                        style="
                                          padding: 0px 0px 10px 0px;
                                          height: auto;
                                        ">
                                        <table
                                          border="0"
                                          cellpadding="0"
                                          cellspacing="0"
                                          role="presentation"
                                          width="100%">
                                          <tr>
                                            <td valign="top" align="left">
                                              <div
                                                class="pc-font-alt"
                                                style="text-decoration: none">
                                                <div
                                                  style="
                                                    font-size: 16px;
                                                    line-height: 24px;
                                                    text-align: left;
                                                    text-align-last: left;
                                                    color: #151415;
                                                    font-family: 'Inter', Arial,
                                                      Helvetica, sans-serif;
                                                    font-style: normal;
                                                    letter-spacing: 0px;
                                                  ">
                                                  <div
                                                    style="
                                                      font-family: 'Inter',
                                                        Arial, Helvetica,
                                                        sans-serif;
                                                    ">
                                                    <span
                                                      style="
                                                        font-family: 'Inter',
                                                          Arial, Helvetica,
                                                          sans-serif;
                                                        font-weight: 400;
                                                        font-size: 20px;
                                                        line-height: 30px;
                                                      "
                                                      class="pc-w620-font-size-16px pc-w620-line-height-24px"
                                                      >Hi, </span
                                                    ><span
                                                      style="
                                                        font-family: 'Inter',
                                                          Arial, Helvetica,
                                                          sans-serif;
                                                        font-weight: 700;
                                                        font-size: 20px;
                                                        line-height: 30px;
                                                      "
                                                      class="pc-w620-font-size-16px pc-w620-line-height-24px"
                                                      >You are invited to attend the interview.</span
                                                    >
                                                  </div>
                                                </div>
                                              </div>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>
                                  <table
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    role="presentation"
                                    width="100%">
                                    <tr>
                                      <td valign="top" align="left">
                                        <div
                                          class="pc-font-alt"
                                          style="text-decoration: none">
                                          <div
                                            style="
                                              font-size: 16px;
                                              line-height: 24px;
                                              text-align: left;
                                              text-align-last: left;
                                              color: #565558;
                                              font-family: 'Inter', Arial,
                                                Helvetica, sans-serif;
                                              font-style: normal;
                                              letter-spacing: 0px;
                                            ">
                                            <div
                                              style="
                                                font-family: 'Inter', Arial,
                                                  Helvetica, sans-serif;
                                              ">
                                              <span
                                                style="
                                                  font-family: 'Inter', Arial,
                                                    Helvetica, sans-serif;
                                                  font-weight: 400;
                                                  font-size: 20px;
                                                  line-height: 30px;
                                                "
                                                class="pc-w620-font-size-16px pc-w620-line-height-24px"
                                                >Struggling to conduct fair and
                                                efficient interviews while
                                                saving time and resources?
                                                At&nbsp;</span
                                              ><span
                                                style="
                                                  font-family: 'Inter', Arial,
                                                    Helvetica, sans-serif;
                                                  color: rgb(21, 20, 21);
                                                  font-weight: 700;
                                                  font-size: 20px;
                                                  line-height: 30px;
                                                "
                                                class="pc-w620-font-size-16px pc-w620-line-height-24px"
                                                >Talk2View</span
                                              ><span
                                                style="
                                                  font-family: 'Inter', Arial,
                                                    Helvetica, sans-serif;
                                                  font-weight: 400;
                                                  font-size: 20px;
                                                  line-height: 30px;
                                                "
                                                class="pc-w620-font-size-16px pc-w620-line-height-24px"
                                                >, we are revolutionizing the
                                                hiring process with AI-powered
                                                interviews, real-time
                                                interactive avatars, and
                                                intelligent resume analysis. Our
                                                platform simplifies scheduling,
                                                automates question generation,
                                                and provides detailed
                                                performance insights—making
                                                recruitment smarter, faster, and
                                                bias-free.</span
                                              >
                                            </div>
                                          </div>
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
                      <!-- END MODULE: Hi -->
                    </td>
                  </tr>
                  <tr>
                    <td valign="top">
                      <!-- BEGIN MODULE: Discover -->
                      <table
                        width="100%"
                        border="0"
                        cellspacing="0"
                        cellpadding="0"
                        role="presentation"
                        align="center"
                        class="pc-component"
                        style="width: 600px; max-width: 600px">
                        <tr>
                          <td
                            class="pc-w620-spacing-0-0-0-0"
                            width="100%"
                            border="0"
                            cellspacing="0"
                            cellpadding="0"
                            role="presentation">
                            <table
                              class="pc-component"
                              style="width: 600px; max-width: 600px"
                              align="center"
                              width="100%"
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                              role="presentation">
                              <tr>
                                <td
                                  valign="top"
                                  class="pc-w620-padding-20-20-20-20"
                                  style="
                                    padding: 0px 16px 0px 16px;
                                    height: unset;
                                    background-color: #ffffff;
                                  "
                                  bgcolor="#FFFFFF">
                                  <table
                                    class="pc-width-fill pc-g-b"
                                    width="100%"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    role="presentation">
                                    <tbody class="pc-g-b">
                                      <tr class="pc-g-ib pc-g-wf">
                                        <td
                                          class="pc-g-rb pc-g-rpt pc-g-rpb pc-g-wf pc-w620-itemsVSpacings-20"
                                          align="left"
                                          valign="top"
                                          style="
                                            width: 100%;
                                            padding-top: 0px;
                                            padding-bottom: 0px;
                                          ">
                                          <table
                                            style="width: 100%"
                                            border="0"
                                            cellpadding="0"
                                            cellspacing="0"
                                            role="presentation">
                                            <tr>
                                              <td
                                                class="pc-w620-padding-20-16-20-16"
                                                align="center"
                                                valign="middle"
                                                style="
                                                  padding: 40px 16px 16px 16px;
                                                  height: auto;
                                                  background-color: #ece9f1;
                                                  border-radius: 8px;
                                                ">
                                                <table
                                                  width="100%"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  role="presentation">
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="top">
                                                      <table
                                                        align="center"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td
                                                            class="pc-w620-spacing-0-0-20-0"
                                                            valign="top"
                                                            style="
                                                              padding: 0px 80px
                                                                32px 80px;
                                                              height: auto;
                                                            ">
                                                            <table
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation"
                                                              width="100%">
                                                              <tr>
                                                                <td
                                                                  valign="top"
                                                                  align="center">
                                                                  <div
                                                                    class="pc-font-alt"
                                                                    style="
                                                                      text-decoration: none;
                                                                    ">
                                                                    <div
                                                                      style="
                                                                        font-size: 28px;
                                                                        line-height: 32px;
                                                                        text-align: center;
                                                                        text-align-last: center;
                                                                        color: #000f89;
                                                                        font-family: 'Inter',
                                                                          Arial,
                                                                          Helvetica,
                                                                          sans-serif;
                                                                        font-style: normal;
                                                                        letter-spacing: -1px;
                                                                      ">
                                                                      <div
                                                                        style="
                                                                          font-family: 'Inter',
                                                                            Arial,
                                                                            Helvetica,
                                                                            sans-serif;
                                                                        ">
                                                                        <span
                                                                          style="
                                                                            font-family: 'Inter',
                                                                              Arial,
                                                                              Helvetica,
                                                                              sans-serif;
                                                                            font-weight: 600;
                                                                            font-size: 36px;
                                                                            line-height: 44px;
                                                                          "
                                                                          class="pc-w620-font-size-28px pc-w620-line-height-32px pc-w620-letter-spacing--1px"
                                                                          >Discover
                                                                          why
                                                                          Talk2Hire
                                                                          stands
                                                                          out</span
                                                                        >
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                </td>
                                                              </tr>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="top">
                                                      <table
                                                        width="100%"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td
                                                            class="pc-w620-spacing-0-0-32-0"
                                                            style="
                                                              padding: 0px 0px
                                                                50px 0px;
                                                            ">
                                                            <table
                                                              class="pc-width-fill pc-g-b"
                                                              width="100%"
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation">
                                                              <tbody
                                                                class="pc-g-b">
                                                                <tr
                                                                  class="pc-g-ib pc-g-wf">
                                                                  <td
                                                                    class="pc-g-rb pc-g-rpt pc-g-wf pc-w620-itemsVSpacings-16"
                                                                    align="left"
                                                                    valign="top"
                                                                    style="
                                                                      width: 50%;
                                                                      padding-top: 0px;
                                                                      padding-bottom: 0px;
                                                                    ">
                                                                    <table
                                                                      style="
                                                                        width: 100%;
                                                                      "
                                                                      border="0"
                                                                      cellpadding="0"
                                                                      cellspacing="0"
                                                                      role="presentation">
                                                                      <tr>
                                                                        <td
                                                                          align="left"
                                                                          valign="top"
                                                                          style="
                                                                            background-color: #ffffff;
                                                                          ">
                                                                          <table
                                                                            width="100%"
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            role="presentation">
                                                                            <tr>
                                                                              <td
                                                                                align="left"
                                                                                valign="top"
                                                                                style="
                                                                                  line-height: 1px;
                                                                                  font-size: 1px;
                                                                                ">
                                                                                <img
                                                                                  src="https://cloudfilesdm.com/postcards/image-17383174522774.png"
                                                                                  width="260"
                                                                                  height="auto"
                                                                                  alt=""
                                                                                  style="
                                                                                    display: block;
                                                                                    outline: 0;
                                                                                    line-height: 100%;
                                                                                    -ms-interpolation-mode: bicubic;
                                                                                    width: 100%;
                                                                                    height: auto;
                                                                                    border: 0;
                                                                                  " />
                                                                              </td>
                                                                            </tr>
                                                                            <tr>
                                                                              <td
                                                                                align="left"
                                                                                valign="top">
                                                                                <table
                                                                                  align="left"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tr>
                                                                                    <td
                                                                                      valign="top"
                                                                                      style="
                                                                                        padding: 20px
                                                                                          20px
                                                                                          8px
                                                                                          20px;
                                                                                        height: auto;
                                                                                      ">
                                                                                      <table
                                                                                        border="0"
                                                                                        cellpadding="0"
                                                                                        cellspacing="0"
                                                                                        role="presentation"
                                                                                        width="100%">
                                                                                        <tr>
                                                                                          <td
                                                                                            valign="top"
                                                                                            align="left">
                                                                                            <div
                                                                                              class="pc-font-alt"
                                                                                              style="
                                                                                                text-decoration: none;
                                                                                              ">
                                                                                              <div
                                                                                                style="
                                                                                                  font-size: 20px;
                                                                                                  line-height: 30px;
                                                                                                  text-align: left;
                                                                                                  text-align-last: left;
                                                                                                  color: #321a59;
                                                                                                  font-family: 'Inter',
                                                                                                    Arial,
                                                                                                    Helvetica,
                                                                                                    sans-serif;
                                                                                                  font-style: normal;
                                                                                                  letter-spacing: 0px;
                                                                                                ">
                                                                                                <div
                                                                                                  style="
                                                                                                    font-family: 'Inter',
                                                                                                      Arial,
                                                                                                      Helvetica,
                                                                                                      sans-serif;
                                                                                                  ">
                                                                                                  <span
                                                                                                    style="
                                                                                                      font-family: 'Inter',
                                                                                                        Arial,
                                                                                                        Helvetica,
                                                                                                        sans-serif;
                                                                                                      font-weight: 600;
                                                                                                      font-size: 20px;
                                                                                                      line-height: 30px;
                                                                                                    "
                                                                                                    >Smart Interview Scheduling</span
                                                                                                  >
                                                                                                </div>
                                                                                              </div>
                                                                                            </div>
                                                                                          </td>
                                                                                        </tr>
                                                                                      </table>
                                                                                    </td>
                                                                                  </tr>
                                                                                </table>
                                                                              </td>
                                                                            </tr>
                                                                            <tr>
                                                                              <td
                                                                                align="left"
                                                                                valign="top">
                                                                                <table
                                                                                  align="left"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tr>
                                                                                    <td
                                                                                      valign="top"
                                                                                      style="
                                                                                        padding: 0px
                                                                                          20px
                                                                                          20px
                                                                                          20px;
                                                                                        height: auto;
                                                                                      ">
                                                                                      <table
                                                                                        border="0"
                                                                                        cellpadding="0"
                                                                                        cellspacing="0"
                                                                                        role="presentation"
                                                                                        width="100%">
                                                                                        <tr>
                                                                                          <td
                                                                                            valign="top"
                                                                                            align="left">
                                                                                            <div
                                                                                              class="pc-font-alt"
                                                                                              style="
                                                                                                text-decoration: none;
                                                                                              ">
                                                                                              <div
                                                                                                style="
                                                                                                  font-size: 16px;
                                                                                                  line-height: 24px;
                                                                                                  text-align: left;
                                                                                                  text-align-last: left;
                                                                                                  color: #565558;
                                                                                                  font-family: 'Inter',
                                                                                                    Arial,
                                                                                                    Helvetica,
                                                                                                    sans-serif;
                                                                                                  font-style: normal;
                                                                                                  letter-spacing: 0px;
                                                                                                ">
                                                                                                <div
                                                                                                  style="
                                                                                                    font-family: 'Inter',
                                                                                                      Arial,
                                                                                                      Helvetica,
                                                                                                      sans-serif;
                                                                                                  ">
                                                                                                  <span
                                                                                                    style="
                                                                                                      font-family: 'Inter',
                                                                                                        Arial,
                                                                                                        Helvetica,
                                                                                                        sans-serif;
                                                                                                      font-weight: 400;
                                                                                                      font-size: 16px;
                                                                                                      line-height: 24px;
                                                                                                    "
                                                                                                    >Easily create and share AI-driven interview links with candidates via email or WhatsApp.
                                                                                                    </span>
                                                                                                    </span
                                                                                                  >
                                                                                                </div>
                                                                                              </div>
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
                                                                  </td>
                                                                  <td
                                                                    class="pc-w620-itemsHSpacings-0"
                                                                    valign="top"
                                                                    style="
                                                                      padding-right: 8px;
                                                                      padding-left: 8px;
                                                                    " />
                                                                  <td
                                                                    class="pc-g-rb pc-g-rpb pc-g-wf pc-w620-itemsVSpacings-16"
                                                                    align="left"
                                                                    valign="top"
                                                                    style="
                                                                      width: 50%;
                                                                      padding-top: 0px;
                                                                      padding-bottom: 0px;
                                                                    ">
                                                                    <table
                                                                      style="
                                                                        width: 100%;
                                                                      "
                                                                      border="0"
                                                                      cellpadding="0"
                                                                      cellspacing="0"
                                                                      role="presentation">
                                                                      <tr>
                                                                        <td
                                                                          align="left"
                                                                          valign="top"
                                                                          style="
                                                                            background-color: #ffffff;
                                                                          ">
                                                                          <table
                                                                            width="100%"
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            role="presentation">
                                                                            <tr>
                                                                              <td
                                                                                align="left"
                                                                                valign="top">
                                                                                <table
                                                                                  align="left"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tr>
                                                                                    <td
                                                                                      valign="top"
                                                                                      style="
                                                                                        padding: 20px
                                                                                          20px
                                                                                          8px
                                                                                          20px;
                                                                                        height: auto;
                                                                                      ">
                                                                                      <table
                                                                                        border="0"
                                                                                        cellpadding="0"
                                                                                        cellspacing="0"
                                                                                        role="presentation"
                                                                                        width="100%">
                                                                                        <tr>
                                                                                          <td
                                                                                            valign="top"
                                                                                            align="left">
                                                                                            <div
                                                                                              class="pc-font-alt"
                                                                                              style="
                                                                                                text-decoration: none;
                                                                                              ">
                                                                                              <div
                                                                                                style="
                                                                                                  font-size: 20px;
                                                                                                  line-height: 30px;
                                                                                                  text-align: left;
                                                                                                  text-align-last: left;
                                                                                                  color: #321a59;
                                                                                                  font-family: 'Inter',
                                                                                                    Arial,
                                                                                                    Helvetica,
                                                                                                    sans-serif;
                                                                                                  font-style: normal;
                                                                                                  letter-spacing: 0px;
                                                                                                ">
                                                                                                <div
                                                                                                  style="
                                                                                                    font-family: 'Inter',
                                                                                                      Arial,
                                                                                                      Helvetica,
                                                                                                      sans-serif;
                                                                                                  ">
                                                                                                  <span
                                                                                                    style="
                                                                                                      font-family: 'Inter',
                                                                                                        Arial,
                                                                                                        Helvetica,
                                                                                                        sans-serif;
                                                                                                      font-weight: 600;
                                                                                                      font-size: 20px;
                                                                                                      line-height: 30px;
                                                                                                    "
                                                                                                    >Real-Time AI Interaction</span
                                                                                                  >
                                                                                                </div>
                                                                                              </div>
                                                                                            </div>
                                                                                          </td>
                                                                                        </tr>
                                                                                      </table>
                                                                                    </td>
                                                                                  </tr>
                                                                                </table>
                                                                              </td>
                                                                            </tr>
                                                                            <tr>
                                                                              <td
                                                                                align="left"
                                                                                valign="top">
                                                                                <table
                                                                                  align="left"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tr>
                                                                                    <td
                                                                                      valign="top"
                                                                                      style="
                                                                                        padding: 0px
                                                                                          20px
                                                                                          20px
                                                                                          20px;
                                                                                        height: auto;
                                                                                      ">
                                                                                      <table
                                                                                        border="0"
                                                                                        cellpadding="0"
                                                                                        cellspacing="0"
                                                                                        role="presentation"
                                                                                        width="100%">
                                                                                        <tr>
                                                                                          <td
                                                                                            valign="top"
                                                                                            align="left">
                                                                                            <div
                                                                                              class="pc-font-alt"
                                                                                              style="
                                                                                                text-decoration: none;
                                                                                              ">
                                                                                              <div
                                                                                                style="
                                                                                                  font-size: 16px;
                                                                                                  line-height: 24px;
                                                                                                  text-align: left;
                                                                                                  text-align-last: left;
                                                                                                  color: #565558;
                                                                                                  font-family: 'Inter',
                                                                                                    Arial,
                                                                                                    Helvetica,
                                                                                                    sans-serif;
                                                                                                  font-style: normal;
                                                                                                  letter-spacing: 0px;
                                                                                                ">
                                                                                                <div
                                                                                                  style="
                                                                                                    font-family: 'Inter',
                                                                                                      Arial,
                                                                                                      Helvetica,
                                                                                                      sans-serif;
                                                                                                  ">
                                                                                                  <span
                                                                                                    style="
                                                                                                      font-family: 'Inter',
                                                                                                        Arial,
                                                                                                        Helvetica,
                                                                                                        sans-serif;
                                                                                                      font-weight: 400;
                                                                                                      font-size: 16px;
                                                                                                      line-height: 24px;
                                                                                                    "
                                                                                                    >Engage with an AI avatar that asks questions, listens, and responds naturally during interviews.</span
                                                                                                  >
                                                                                                </div>
                                                                                              </div>
                                                                                            </div>
                                                                                          </td>
                                                                                        </tr>
                                                                                      </table>
                                                                                    </td>
                                                                                  </tr>
                                                                                </table>
                                                                              </td>
                                                                            </tr>
                                                                            <tr>
                                                                              <td
                                                                                align="left"
                                                                                valign="top"
                                                                                style="
                                                                                  line-height: 1px;
                                                                                  font-size: 1px;
                                                                                ">
                                                                                <img
                                                                                  src="https://cloudfilesdm.com/postcards/image-17383174526715.png"
                                                                                  width="260"
                                                                                  height="auto"
                                                                                  alt=""
                                                                                  style="
                                                                                    display: block;
                                                                                    outline: 0;
                                                                                    line-height: 100%;
                                                                                    -ms-interpolation-mode: bicubic;
                                                                                    width: 100%;
                                                                                    height: auto;
                                                                                    border: 0;
                                                                                  " />
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                      </tr>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="top">
                                                      <table
                                                        width="100%"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td
                                                            class="pc-w620-spacing-0-0-24-0"
                                                            valign="top"
                                                            style="
                                                              padding: 0px 0px
                                                                50px 0px;
                                                            ">
                                                            <table
                                                              width="100%"
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation"
                                                              align="center"
                                                              style="
                                                                margin: auto;
                                                              ">
                                                              <tr>
                                                                <td
                                                                  valign="top"
                                                                  style="
                                                                    line-height: 1px;
                                                                    font-size: 1px;
                                                                    border-bottom: 1px
                                                                      solid
                                                                      #d3cae2;
                                                                  ">
                                                                  &nbsp;
                                                                </td>
                                                              </tr>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="top">
                                                      <table
                                                        width="100%"
                                                        align="center"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td
                                                            class="pc-w620-spacing-0-0-20-0"
                                                            valign="top"
                                                            style="
                                                              padding: 0px 0px
                                                                32px 0px;
                                                              height: auto;
                                                            ">
                                                            <table
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation"
                                                              width="100%"
                                                              align="center">
                                                              <tr>
                                                                <td
                                                                  valign="top"
                                                                  align="center">
                                                                  <div
                                                                    class="pc-font-alt"
                                                                    style="
                                                                      text-decoration: none;
                                                                    ">
                                                                    <div
                                                                      style="
                                                                        font-size: 28px;
                                                                        line-height: 32px;
                                                                        text-align: center;
                                                                        text-align-last: center;
                                                                        color: #000f89;
                                                                        font-family: 'Inter',
                                                                          Arial,
                                                                          Helvetica,
                                                                          sans-serif;
                                                                        font-style: normal;
                                                                        letter-spacing: -1px;
                                                                      ">
                                                                      <div
                                                                        style="
                                                                          font-family: 'Inter',
                                                                            Arial,
                                                                            Helvetica,
                                                                            sans-serif;
                                                                        ">
                                                                        <span
                                                                          style="
                                                                            font-family: 'Inter',
                                                                              Arial,
                                                                              Helvetica,
                                                                              sans-serif;
                                                                            font-weight: 600;
                                                                            font-size: 36px;
                                                                            line-height: 44px;
                                                                          "
                                                                          class="pc-w620-font-size-28px pc-w620-letter-spacing--1px pc-w620-line-height-32px"
                                                                          >Interview Details</span
                                                                        >
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                </td>
                                                              </tr>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="top">
                                                      <table
                                                        width="100%"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td
                                                            style="
                                                              padding: 0px 0px
                                                                16px 0px;
                                                            ">
                                                            <table
                                                              class="pc-width-fill pc-g-b"
                                                              width="100%"
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation">
                                                              <tbody
                                                                class="pc-g-b">
                                                                <tr
                                                                  class="pc-g-ib pc-g-wf">
                                                                  <td
                                                                    class="pc-g-rb pc-g-rpt pc-g-rpb pc-g-wf pc-w620-itemsVSpacings-30"
                                                                    align="left"
                                                                    valign="top"
                                                                    style="
                                                                      padding-top: 0px;
                                                                      padding-bottom: 0px;
                                                                    ">
                                                                    <table
                                                                      style="
                                                                        border-collapse: separate;
                                                                        border-spacing: 0;
                                                                        width: 100%;
                                                                      "
                                                                      border="0"
                                                                      cellpadding="0"
                                                                      cellspacing="0"
                                                                      role="presentation">
                                                                      <tr>
                                                                        <td
                                                                          class="pc-w620-padding-20-20-20-20"
                                                                          align="left"
                                                                          valign="middle"
                                                                          style="
                                                                            padding: 24px
                                                                              24px
                                                                              24px
                                                                              24px;
                                                                            height: auto;
                                                                            background-color: #fafafa;
                                                                            border-radius: 4px
                                                                              4px
                                                                              4px
                                                                              4px;
                                                                            border-top: 3px
                                                                              solid
                                                                              #ffffff;
                                                                            border-right: 3px
                                                                              solid
                                                                              #ffffff;
                                                                            border-bottom: 3px
                                                                              solid
                                                                              #ffffff;
                                                                            border-left: 3px
                                                                              solid
                                                                              #ffffff;
                                                                          ">
                                                                          <table
                                                                            align="left"
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            role="presentation">
                                                                            <tr>
                                                                              <td
                                                                                style="
                                                                                  width: unset;
                                                                                "
                                                                                valign="top">
                                                                                <table
                                                                                  class="pc-width-hug pc-g-b"
                                                                                  align="left"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tbody
                                                                                    class="pc-g-b">
                                                                                    <tr
                                                                                      class="pc-g-ib">
                                                                                      <td
                                                                                        class="pc-g-rb pc-g-rpt pc-w620-itemsVSpacings-20"
                                                                                        valign="middle"
                                                                                        style="
                                                                                          padding-top: 0px;
                                                                                          padding-bottom: 0px;
                                                                                        ">
                                                                                        <table
                                                                                          style="
                                                                                            width: 100%;
                                                                                          "
                                                                                          border="0"
                                                                                          cellpadding="0"
                                                                                          cellspacing="0"
                                                                                          role="presentation">
                                                                                          <tr>
                                                                                            <td
                                                                                              align="left"
                                                                                              valign="middle">
                                                                                              <img
                                                                                                src="https://cloudfilesdm.com/postcards/image-17383174530616.png"
                                                                                                class="pc-w620-width-60 pc-w620-height-auto"
                                                                                                width="80"
                                                                                                height="80"
                                                                                                alt=""
                                                                                                style="
                                                                                                  display: block;
                                                                                                  outline: 0;
                                                                                                  line-height: 100%;
                                                                                                  -ms-interpolation-mode: bicubic;
                                                                                                  width: 80px;
                                                                                                  height: auto;
                                                                                                  max-width: 100%;
                                                                                                  border-radius: 100px
                                                                                                    100px
                                                                                                    100px
                                                                                                    100px;
                                                                                                  border: 0;
                                                                                                  box-shadow: 0px
                                                                                                    10px
                                                                                                    18px
                                                                                                    0px
                                                                                                    rgba(
                                                                                                      50,
                                                                                                      26,
                                                                                                      89,
                                                                                                      0.1
                                                                                                    );
                                                                                                " />
                                                                                            </td>
                                                                                          </tr>
                                                                                        </table>
                                                                                      </td>
                                                                                      <td
                                                                                        class="pc-w620-itemsHSpacings-0"
                                                                                        valign="middle"
                                                                                        style="
                                                                                          padding-right: 15px;
                                                                                          padding-left: 15px;
                                                                                        " />
                                                                                      <td
                                                                                        class="pc-g-rb pc-g-rpb pc-w620-itemsVSpacings-20"
                                                                                        valign="middle"
                                                                                        style="
                                                                                          padding-top: 0px;
                                                                                          padding-bottom: 0px;
                                                                                        ">
                                                                                        <table
                                                                                          class="pc-w620-width-fill"
                                                                                          style="
                                                                                            width: 378px;
                                                                                          "
                                                                                          border="0"
                                                                                          cellpadding="0"
                                                                                          cellspacing="0"
                                                                                          role="presentation">
                                                                                          <tr>
                                                                                            <td
                                                                                              align="left"
                                                                                              valign="middle">
                                                                                              <table
                                                                                                width="100%"
                                                                                                border="0"
                                                                                                cellpadding="0"
                                                                                                cellspacing="0"
                                                                                                role="presentation">
                                                                                                <tr>
                                                                                                  <td
                                                                                                    align="left"
                                                                                                    valign="top">
                                                                                                    <table
                                                                                                      align="left"
                                                                                                      border="0"
                                                                                                      cellpadding="0"
                                                                                                      cellspacing="0"
                                                                                                      role="presentation">
                                                                                                      <tr>
                                                                                                        <td
                                                                                                          valign="top"
                                                                                                          style="
                                                                                                            padding: 0px
                                                                                                              0px
                                                                                                              8px
                                                                                                              0px;
                                                                                                            height: auto;
                                                                                                          ">
                                                                                                          <table
                                                                                                            border="0"
                                                                                                            cellpadding="0"
                                                                                                            cellspacing="0"
                                                                                                            role="presentation"
                                                                                                            width="100%">
                                                                                                            <tr>
                                                                                                              <td
                                                                                                                valign="top"
                                                                                                                align="left">
                                                                                                                <div
                                                                                                                  class="pc-font-alt"
                                                                                                                  style="
                                                                                                                    text-decoration: none;
                                                                                                                  ">
                                                                                                                  <div
                                                                                                                    style="
                                                                                                                      font-size: 20px;
                                                                                                                      line-height: 26px;
                                                                                                                      text-align: left;
                                                                                                                      text-align-last: left;
                                                                                                                      color: #000f89;
                                                                                                                      font-family: 'Inter',
                                                                                                                        Arial,
                                                                                                                        Helvetica,
                                                                                                                        sans-serif;
                                                                                                                      font-style: normal;
                                                                                                                      letter-spacing: 0px;
                                                                                                                    ">
                                                                                                                    <div
                                                                                                                      style="
                                                                                                                        font-family: 'Inter',
                                                                                                                          Arial,
                                                                                                                          Helvetica,
                                                                                                                          sans-serif;
                                                                                                                      ">
                                                                                                                      <span
                                                                                                                        style="
                                                                                                                          font-family: 'Inter',
                                                                                                                            Arial,
                                                                                                                            Helvetica,
                                                                                                                            sans-serif;
                                                                                                                          font-weight: 600;
                                                                                                                          font-size: 20px;
                                                                                                                          line-height: 30px;
                                                                                                                        "
                                                                                                                        class="pc-w620-line-height-26px"
                                                                                                                        >Position</span
                                                                                                                      >
                                                                                                                    </div>
                                                                                                                  </div>
                                                                                                                </div>
                                                                                                              </td>
                                                                                                            </tr>
                                                                                                          </table>
                                                                                                        </td>
                                                                                                      </tr>
                                                                                                    </table>
                                                                                                  </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                  <td
                                                                                                    align="left"
                                                                                                    valign="top">
                                                                                                    <table
                                                                                                      border="0"
                                                                                                      cellpadding="0"
                                                                                                      cellspacing="0"
                                                                                                      role="presentation"
                                                                                                      align="left">
                                                                                                      <tr>
                                                                                                        <td
                                                                                                          valign="top"
                                                                                                          align="left">
                                                                                                          <div
                                                                                                            class="pc-font-alt"
                                                                                                            style="
                                                                                                              text-decoration: none;
                                                                                                            ">
                                                                                                            <div
                                                                                                              style="
                                                                                                                font-size: 16px;
                                                                                                                line-height: 24px;
                                                                                                                text-align: left;
                                                                                                                text-align-last: left;
                                                                                                                color: #565558;
                                                                                                                font-family: 'Inter',
                                                                                                                  Arial,
                                                                                                                  Helvetica,
                                                                                                                  sans-serif;
                                                                                                                font-style: normal;
                                                                                                                letter-spacing: 0px;
                                                                                                              ">
                                                                                                              <div
                                                                                                                style="
                                                                                                                  font-family: 'Inter',
                                                                                                                    Arial,
                                                                                                                    Helvetica,
                                                                                                                    sans-serif;
                                                                                                                ">
                                                                                                                <span
                                                                                                                  style="
                                                                                                                    font-family: 'Inter',
                                                                                                                      Arial,
                                                                                                                      Helvetica,
                                                                                                                      sans-serif;
                                                                                                                    font-weight: 400;
                                                                                                                    font-size: 16px;
                                                                                                                    line-height: 24px;
                                                                                                                  "
                                                                                                                  >${jobPosition ||
          "Position Not Specified"
          }</span
                                                                                                                >
                                                                                                              </div>
                                                                                                            </div>
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
                                                                                  </tbody>
                                                                                </table>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                      </tr>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="top">
                                                      <table
                                                        width="100%"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td
                                                            style="
                                                              padding: 0px 0px
                                                                16px 0px;
                                                            ">
                                                            <table
                                                              class="pc-width-fill pc-g-b"
                                                              width="100%"
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation">
                                                              <tbody
                                                                class="pc-g-b">
                                                                <tr
                                                                  class="pc-g-ib pc-g-wf">
                                                                  <td
                                                                    class="pc-g-rb pc-g-rpt pc-g-rpb pc-g-wf pc-w620-itemsVSpacings-30"
                                                                    align="left"
                                                                    valign="top"
                                                                    style="
                                                                      padding-top: 0px;
                                                                      padding-bottom: 0px;
                                                                    ">
                                                                    <table
                                                                      style="
                                                                        border-collapse: separate;
                                                                        border-spacing: 0;
                                                                        width: 100%;
                                                                      "
                                                                      border="0"
                                                                      cellpadding="0"
                                                                      cellspacing="0"
                                                                      role="presentation">
                                                                      <tr>
                                                                        <td
                                                                          class="pc-w620-padding-20-20-20-20"
                                                                          align="left"
                                                                          valign="middle"
                                                                          style="
                                                                            padding: 24px
                                                                              24px
                                                                              24px
                                                                              24px;
                                                                            height: auto;
                                                                            background-color: #fafafa;
                                                                            border-radius: 4px
                                                                              4px
                                                                              4px
                                                                              4px;
                                                                            border-top: 3px
                                                                              solid
                                                                              #ffffff;
                                                                            border-right: 3px
                                                                              solid
                                                                              #ffffff;
                                                                            border-bottom: 3px
                                                                              solid
                                                                              #ffffff;
                                                                            border-left: 3px
                                                                              solid
                                                                              #ffffff;
                                                                          ">
                                                                          <table
                                                                            align="left"
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            role="presentation">
                                                                            <tr>
                                                                              <td
                                                                                style="
                                                                                  width: unset;
                                                                                "
                                                                                valign="top">
                                                                                <table
                                                                                  class="pc-width-hug pc-g-b"
                                                                                  align="left"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tbody
                                                                                    class="pc-g-b">
                                                                                    <tr
                                                                                      class="pc-g-ib">
                                                                                      <td
                                                                                        class="pc-g-rb pc-g-rpt pc-w620-itemsVSpacings-20"
                                                                                        valign="middle"
                                                                                        style="
                                                                                          padding-top: 0px;
                                                                                          padding-bottom: 0px;
                                                                                        ">
                                                                                        <table
                                                                                          style="
                                                                                            width: 100%;
                                                                                          "
                                                                                          border="0"
                                                                                          cellpadding="0"
                                                                                          cellspacing="0"
                                                                                          role="presentation">
                                                                                          <tr>
                                                                                            <td
                                                                                              align="left"
                                                                                              valign="middle">
                                                                                              <img
                                                                                                src="https://cloudfilesdm.com/postcards/image-17383174533797.png"
                                                                                                class="pc-w620-width-60 pc-w620-height-auto"
                                                                                                width="80"
                                                                                                height="80"
                                                                                                alt=""
                                                                                                style="
                                                                                                  display: block;
                                                                                                  outline: 0;
                                                                                                  line-height: 100%;
                                                                                                  -ms-interpolation-mode: bicubic;
                                                                                                  width: 80px;
                                                                                                  height: auto;
                                                                                                  max-width: 100%;
                                                                                                  border-radius: 100px
                                                                                                    100px
                                                                                                    100px
                                                                                                    100px;
                                                                                                  border: 0;
                                                                                                  box-shadow: 0px
                                                                                                    10px
                                                                                                    18px
                                                                                                    0px
                                                                                                    rgba(
                                                                                                      50,
                                                                                                      26,
                                                                                                      89,
                                                                                                      0.1
                                                                                                    );
                                                                                                " />
                                                                                            </td>
                                                                                          </tr>
                                                                                        </table>
                                                                                      </td>
                                                                                      <td
                                                                                        class="pc-w620-itemsHSpacings-0"
                                                                                        valign="middle"
                                                                                        style="
                                                                                          padding-right: 15px;
                                                                                          padding-left: 15px;
                                                                                        " />
                                                                                      <td
                                                                                        class="pc-g-rb pc-g-rpb pc-w620-itemsVSpacings-20"
                                                                                        valign="middle"
                                                                                        style="
                                                                                          padding-top: 0px;
                                                                                          padding-bottom: 0px;
                                                                                        ">
                                                                                        <table
                                                                                          class="pc-w620-width-fill"
                                                                                          style="
                                                                                            width: 378px;
                                                                                          "
                                                                                          border="0"
                                                                                          cellpadding="0"
                                                                                          cellspacing="0"
                                                                                          role="presentation">
                                                                                          <tr>
                                                                                            <td
                                                                                              align="left"
                                                                                              valign="middle">
                                                                                              <table
                                                                                                width="100%"
                                                                                                border="0"
                                                                                                cellpadding="0"
                                                                                                cellspacing="0"
                                                                                                role="presentation">
                                                                                                <tr>
                                                                                                  <td
                                                                                                    align="left"
                                                                                                    valign="top">
                                                                                                    <table
                                                                                                      align="left"
                                                                                                      border="0"
                                                                                                      cellpadding="0"
                                                                                                      cellspacing="0"
                                                                                                      role="presentation">
                                                                                                      <tr>
                                                                                                        <td
                                                                                                          valign="top"
                                                                                                          style="
                                                                                                            padding: 0px
                                                                                                              0px
                                                                                                              8px
                                                                                                              0px;
                                                                                                            height: auto;
                                                                                                          ">
                                                                                                          <table
                                                                                                            border="0"
                                                                                                            cellpadding="0"
                                                                                                            cellspacing="0"
                                                                                                            role="presentation"
                                                                                                            width="100%">
                                                                                                            <tr>
                                                                                                              <td
                                                                                                                valign="top"
                                                                                                                align="left">
                                                                                                                <div
                                                                                                                  class="pc-font-alt"
                                                                                                                  style="
                                                                                                                    text-decoration: none;
                                                                                                                  ">
                                                                                                                  <div
                                                                                                                    style="
                                                                                                                      font-size: 20px;
                                                                                                                      line-height: 24px;
                                                                                                                      text-align: left;
                                                                                                                      text-align-last: left;
                                                                                                                      color: #000f89;
                                                                                                                      font-family: 'Inter',
                                                                                                                        Arial,
                                                                                                                        Helvetica,
                                                                                                                        sans-serif;
                                                                                                                      font-style: normal;
                                                                                                                      letter-spacing: 0px;
                                                                                                                    ">
                                                                                                                    <div
                                                                                                                      style="
                                                                                                                        font-family: 'Inter',
                                                                                                                          Arial,
                                                                                                                          Helvetica,
                                                                                                                          sans-serif;
                                                                                                                      ">
                                                                                                                      <span
                                                                                                                        style="
                                                                                                                          font-family: 'Inter',
                                                                                                                            Arial,
                                                                                                                            Helvetica,
                                                                                                                            sans-serif;
                                                                                                                          font-weight: 600;
                                                                                                                          font-size: 20px;
                                                                                                                          line-height: 30px;
                                                                                                                        "
                                                                                                                        class="pc-w620-line-height-24px"
                                                                                                                        >Duration</span
                                                                                                                      >
                                                                                                                    </div>
                                                                                                                  </div>
                                                                                                                </div>
                                                                                                              </td>
                                                                                                            </tr>
                                                                                                          </table>
                                                                                                        </td>
                                                                                                      </tr>
                                                                                                    </table>
                                                                                                  </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                  <td
                                                                                                    align="left"
                                                                                                    valign="top">
                                                                                                    <table
                                                                                                      border="0"
                                                                                                      cellpadding="0"
                                                                                                      cellspacing="0"
                                                                                                      role="presentation"
                                                                                                      align="left">
                                                                                                      <tr>
                                                                                                        <td
                                                                                                          valign="top"
                                                                                                          align="left">
                                                                                                          <div
                                                                                                            class="pc-font-alt"
                                                                                                            style="
                                                                                                              text-decoration: none;
                                                                                                            ">
                                                                                                            <div
                                                                                                              style="
                                                                                                                font-size: 16px;
                                                                                                                line-height: 24px;
                                                                                                                text-align: left;
                                                                                                                text-align-last: left;
                                                                                                                color: #565558;
                                                                                                                font-family: 'Inter',
                                                                                                                  Arial,
                                                                                                                  Helvetica,
                                                                                                                  sans-serif;
                                                                                                                font-style: normal;
                                                                                                                letter-spacing: 0px;
                                                                                                              ">
                                                                                                              <div
                                                                                                                style="
                                                                                                                  font-family: 'Inter',
                                                                                                                    Arial,
                                                                                                                    Helvetica,
                                                                                                                    sans-serif;
                                                                                                                ">
                                                                                                                <span
                                                                                                                  style="
                                                                                                                    font-family: 'Inter',
                                                                                                                      Arial,
                                                                                                                      Helvetica,
                                                                                                                      sans-serif;
                                                                                                                    font-weight: 400;
                                                                                                                    font-size: 16px;
                                                                                                                    line-height: 24px;
                                                                                                                  "
                                                                                                                  >${duration ||
          "30 minutes"
          }</span
                                                                                                                >
                                                                                                              </div>
                                                                                                            </div>
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
                                                                                  </tbody>
                                                                                </table>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                      </tr>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="top">
                                                      <table
                                                        class="pc-width-fill pc-g-b"
                                                        width="100%"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tbody class="pc-g-b">
                                                          <tr
                                                            class="pc-g-ib pc-g-wf">
                                                            <td
                                                              class="pc-g-rb pc-g-rpt pc-g-rpb pc-g-wf pc-w620-itemsVSpacings-30"
                                                              align="left"
                                                              valign="top"
                                                              style="
                                                                padding-top: 0px;
                                                                padding-bottom: 0px;
                                                              ">
                                                              <table
                                                                style="
                                                                  border-collapse: separate;
                                                                  border-spacing: 0;
                                                                  width: 100%;
                                                                "
                                                                border="0"
                                                                cellpadding="0"
                                                                cellspacing="0"
                                                                role="presentation">
                                                                <tr>
                                                                  <td
                                                                    class="pc-w620-padding-20-20-20-20"
                                                                    align="left"
                                                                    valign="middle"
                                                                    style="
                                                                      padding: 24px
                                                                        24px
                                                                        24px
                                                                        24px;
                                                                      height: auto;
                                                                      background-color: #fafafa;
                                                                      border-radius: 4px
                                                                        4px 4px
                                                                        4px;
                                                                      border-top: 3px
                                                                        solid
                                                                        #ffffff;
                                                                      border-right: 3px
                                                                        solid
                                                                        #ffffff;
                                                                      border-bottom: 3px
                                                                        solid
                                                                        #ffffff;
                                                                      border-left: 3px
                                                                        solid
                                                                        #ffffff;
                                                                    ">
                                                                    <table
                                                                      align="left"
                                                                      border="0"
                                                                      cellpadding="0"
                                                                      cellspacing="0"
                                                                      role="presentation">
                                                                      <tr>
                                                                        <td
                                                                          style="
                                                                            width: unset;
                                                                          "
                                                                          valign="top">
                                                                          <table
                                                                            class="pc-width-hug pc-g-b"
                                                                            align="left"
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            role="presentation">
                                                                            <tbody
                                                                              class="pc-g-b">
                                                                              <tr
                                                                                class="pc-g-ib">
                                                                                <td
                                                                                  class="pc-g-rb pc-g-rpt pc-w620-itemsVSpacings-20"
                                                                                  valign="middle"
                                                                                  style="
                                                                                    padding-top: 0px;
                                                                                    padding-bottom: 0px;
                                                                                  ">
                                                                                  <table
                                                                                    style="
                                                                                      width: 100%;
                                                                                    "
                                                                                    border="0"
                                                                                    cellpadding="0"
                                                                                    cellspacing="0"
                                                                                    role="presentation">
                                                                                    <tr>
                                                                                      <td
                                                                                        align="left"
                                                                                        valign="middle">
                                                                                        <img
                                                                                          src="https://cloudfilesdm.com/postcards/image-17383174536808.png"
                                                                                          class="pc-w620-width-60 pc-w620-height-auto"
                                                                                          width="80"
                                                                                          height="80"
                                                                                          alt=""
                                                                                          style="
                                                                                            display: block;
                                                                                            outline: 0;
                                                                                            line-height: 100%;
                                                                                            -ms-interpolation-mode: bicubic;
                                                                                            width: 80px;
                                                                                            height: auto;
                                                                                            max-width: 100%;
                                                                                            border-radius: 100px
                                                                                              100px
                                                                                              100px
                                                                                              100px;
                                                                                            border: 0;
                                                                                            box-shadow: 0px
                                                                                              10px
                                                                                              18px
                                                                                              0px
                                                                                              rgba(
                                                                                                50,
                                                                                                26,
                                                                                                89,
                                                                                                0.1
                                                                                              );
                                                                                          " />
                                                                                      </td>
                                                                                    </tr>
                                                                                  </table>
                                                                                </td>
                                                                                <td
                                                                                  class="pc-w620-itemsHSpacings-0"
                                                                                  valign="middle"
                                                                                  style="
                                                                                    padding-right: 15px;
                                                                                    padding-left: 15px;
                                                                                  " />
                                                                                <td
                                                                                  class="pc-g-rb pc-g-rpb pc-w620-itemsVSpacings-20"
                                                                                  valign="middle"
                                                                                  style="
                                                                                    padding-top: 0px;
                                                                                    padding-bottom: 0px;
                                                                                  ">
                                                                                  <table
                                                                                    class="pc-w620-width-fill"
                                                                                    style="
                                                                                      width: 378px;
                                                                                    "
                                                                                    border="0"
                                                                                    cellpadding="0"
                                                                                    cellspacing="0"
                                                                                    role="presentation">
                                                                                    <tr>
                                                                                      <td
                                                                                        align="left"
                                                                                        valign="middle">
                                                                                        <table
                                                                                          width="100%"
                                                                                          border="0"
                                                                                          cellpadding="0"
                                                                                          cellspacing="0"
                                                                                          role="presentation">
                                                                                          <tr>
                                                                                            <td
                                                                                              align="left"
                                                                                              valign="top">
                                                                                              <table
                                                                                                align="left"
                                                                                                border="0"
                                                                                                cellpadding="0"
                                                                                                cellspacing="0"
                                                                                                role="presentation">
                                                                                                <tr>
                                                                                                  <td
                                                                                                    valign="top"
                                                                                                    style="
                                                                                                      padding: 0px
                                                                                                        0px
                                                                                                        8px
                                                                                                        0px;
                                                                                                      height: auto;
                                                                                                    ">
                                                                                                    <table
                                                                                                      border="0"
                                                                                                      cellpadding="0"
                                                                                                      cellspacing="0"
                                                                                                      role="presentation"
                                                                                                      width="100%">
                                                                                                      <tr>
                                                                                                        <td
                                                                                                          valign="top"
                                                                                                          align="left">
                                                                                                          <div
                                                                                                            class="pc-font-alt"
                                                                                                            style="
                                                                                                              text-decoration: none;
                                                                                                            ">
                                                                                                            <div
                                                                                                              style="
                                                                                                                font-size: 20px;
                                                                                                                line-height: 26px;
                                                                                                                text-align: left;
                                                                                                                text-align-last: left;
                                                                                                                color: #000f89;
                                                                                                                font-family: 'Inter',
                                                                                                                  Arial,
                                                                                                                  Helvetica,
                                                                                                                  sans-serif;
                                                                                                                font-style: normal;
                                                                                                                letter-spacing: 0px;
                                                                                                              ">
                                                                                                              <div
                                                                                                                style="
                                                                                                                  font-family: 'Inter',
                                                                                                                    Arial,
                                                                                                                    Helvetica,
                                                                                                                    sans-serif;
                                                                                                                ">
                                                                                                                <span
                                                                                                                  style="
                                                                                                                    font-family: 'Inter',
                                                                                                                      Arial,
                                                                                                                      Helvetica,
                                                                                                                      sans-serif;
                                                                                                                    font-weight: 600;
                                                                                                                    font-size: 20px;
                                                                                                                    line-height: 30px;
                                                                                                                  "
                                                                                                                  class="pc-w620-line-height-26px"
                                                                                                                  >Interview Type</span
                                                                                                                >
                                                                                                              </div>
                                                                                                            </div>
                                                                                                          </div>
                                                                                                        </td>
                                                                                                      </tr>
                                                                                                    </table>
                                                                                                  </td>
                                                                                                </tr>
                                                                                              </table>
                                                                                            </td>
                                                                                          </tr>
                                                                                          <tr>
                                                                                            <td
                                                                                              align="left"
                                                                                              valign="top">
                                                                                              <table
                                                                                                border="0"
                                                                                                cellpadding="0"
                                                                                                cellspacing="0"
                                                                                                role="presentation"
                                                                                                align="left">
                                                                                                <tr>
                                                                                                  <td
                                                                                                    valign="top"
                                                                                                    align="left">
                                                                                                    <div
                                                                                                      class="pc-font-alt"
                                                                                                      style="
                                                                                                        text-decoration: none;
                                                                                                      ">
                                                                                                      <div
                                                                                                        style="
                                                                                                          font-size: 16px;
                                                                                                          line-height: 24px;
                                                                                                          text-align: left;
                                                                                                          text-align-last: left;
                                                                                                          color: #565558;
                                                                                                          font-family: 'Inter',
                                                                                                            Arial,
                                                                                                            Helvetica,
                                                                                                            sans-serif;
                                                                                                          font-style: normal;
                                                                                                          letter-spacing: 0px;
                                                                                                        ">
                                                                                                        <div
                                                                                                          style="
                                                                                                            font-family: 'Inter',
                                                                                                              Arial,
                                                                                                              Helvetica,
                                                                                                              sans-serif;
                                                                                                          ">
                                                                                                          <span
                                                                                                            style="
                                                                                                              font-family: 'Inter',
                                                                                                                Arial,
                                                                                                                Helvetica,
                                                                                                                sans-serif;
                                                                                                              font-weight: 400;
                                                                                                              font-size: 16px;
                                                                                                              line-height: 24px;
                                                                                                            "
                                                                                                            >${interviewType ||
          "General"
          }</span
                                                                                                          >
                                                                                                        </div>
                                                                                                      </div>
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
                                                                            </tbody>
                                                                          </table>
                                                                        </td>
                                                                      </tr>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </table>
                                                            </td>
                                                          </tr>
                                                        </tbody>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <!-- END MODULE: Discover -->
                    </td>
                  </tr>
                  <tr>
                    <td valign="top">
                      <!-- BEGIN MODULE: How it works -->
                      <table
                        width="100%"
                        border="0"
                        cellspacing="0"
                        cellpadding="0"
                        role="presentation"
                        align="center"
                        class="pc-component"
                        style="width: 600px; max-width: 600px">
                        <tr>
                          <td
                            class="pc-w620-spacing-0-0-0-0"
                            width="100%"
                            border="0"
                            cellspacing="0"
                            cellpadding="0"
                            role="presentation">
                            <table
                              class="pc-component"
                              style="width: 600px; max-width: 600px"
                              align="center"
                              width="100%"
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                              role="presentation">
                              <tr>
                                <td
                                  valign="top"
                                  class="pc-w620-padding-20-20-20-20"
                                  style="
                                    padding: 44px 32px 44px 32px;
                                    height: unset;
                                    background-color: #ffffff;
                                  "
                                  bgcolor="#ffffff">
                                  <table
                                    width="100%"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    role="presentation">
                                    <tr>
                                      <td
                                        class="pc-w620-valign-top pc-w620-halign-center">
                                        <table
                                          class="pc-width-fill pc-g-b pc-w620-halign-center pc-w620-dir-ltr"
                                          style="direction: rtl"
                                          width="100%"
                                          dir="rtl"
                                          border="0"
                                          cellpadding="0"
                                          cellspacing="0"
                                          role="presentation">
                                          <tbody class="pc-g-b">
                                            <tr class="pc-g-ib pc-g-wf">
                                              <td
                                                class="pc-g-rb pc-g-rpt pc-g-wf pc-w620-itemsVSpacings-20"
                                                align="left"
                                                valign="middle"
                                                style="
                                                  width: 50%;
                                                  padding-top: 0px;
                                                  padding-bottom: 0px;
                                                  direction: ltr;
                                                "
                                                dir="ltr">
                                                <table
                                                  class="pc-w620-halign-center"
                                                  style="width: 100%"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  role="presentation">
                                                  <tr>
                                                    <td
                                                      class="pc-w620-halign-center pc-w620-valign-top"
                                                      align="left"
                                                      valign="middle">
                                                      <table
                                                        class="pc-w620-halign-center"
                                                        width="100%"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td
                                                            class="pc-w620-halign-center"
                                                            align="left"
                                                            valign="top"
                                                            style="
                                                              line-height: 1px;
                                                              font-size: 1px;
                                                            ">
                                                            <table
                                                              width="100%"
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation">
                                                              <tr>
                                                                <td
                                                                  class="pc-w620-halign-center"
                                                                  align="left"
                                                                  valign="top">
                                                                  <img
                                                                    src="https://cloudfilesdm.com/postcards/image-1739373073279.png"
                                                                    class="pc-w620-align-center"
                                                                    width="263"
                                                                    height="auto"
                                                                    alt=""
                                                                    style="
                                                                      display: block;
                                                                      outline: 0;
                                                                      line-height: 100%;
                                                                      -ms-interpolation-mode: bicubic;
                                                                      width: 100%;
                                                                      height: auto;
                                                                      border: 0;
                                                                    " />
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
                                              <td
                                                class="pc-w620-itemsHSpacings-0"
                                                valign="middle"
                                                style="
                                                  padding-right: 5px;
                                                  padding-left: 5px;
                                                " />
                                              <td
                                                class="pc-g-rb pc-g-rpb pc-g-wf pc-w620-itemsVSpacings-20"
                                                align="left"
                                                valign="middle"
                                                style="
                                                  width: 50%;
                                                  padding-top: 0px;
                                                  padding-bottom: 0px;
                                                  direction: ltr;
                                                "
                                                dir="ltr">
                                                <table
                                                  class="pc-w620-halign-center"
                                                  style="width: 100%"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  role="presentation">
                                                  <tr>
                                                    <td
                                                      class="pc-w620-halign-center pc-w620-valign-top"
                                                      align="left"
                                                      valign="middle">
                                                      <table
                                                        class="pc-w620-halign-center"
                                                        width="100%"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td
                                                            class="pc-w620-halign-center"
                                                            align="left"
                                                            valign="top">
                                                            <table
                                                              class="pc-w620-halign-center"
                                                              align="left"
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation">
                                                              <tr>
                                                                <td
                                                                  valign="top"
                                                                  style="
                                                                    padding: 0px
                                                                      0px 24px
                                                                      0px;
                                                                    height: auto;
                                                                  ">
                                                                  <table
                                                                    border="0"
                                                                    cellpadding="0"
                                                                    cellspacing="0"
                                                                    role="presentation"
                                                                    width="100%">
                                                                    <tr>
                                                                      <td
                                                                        valign="top"
                                                                        align="left">
                                                                        <div
                                                                          class="pc-font-alt"
                                                                          style="
                                                                            text-decoration: none;
                                                                          ">
                                                                          <div
                                                                            style="
                                                                              font-size: 28px;
                                                                              line-height: 29px;
                                                                              text-align: left;
                                                                              text-align-last: left;
                                                                              color: #321a59;
                                                                              font-family: 'Inter',
                                                                                Arial,
                                                                                Helvetica,
                                                                                sans-serif;
                                                                              font-style: normal;
                                                                              letter-spacing: -1px;
                                                                            ">
                                                                            <div
                                                                              style="
                                                                                font-family: 'Inter',
                                                                                  Arial,
                                                                                  Helvetica,
                                                                                  sans-serif;
                                                                              "
                                                                              class="pc-w620-text-align-center">
                                                                              <span
                                                                                style="
                                                                                  font-family: 'Inter',
                                                                                    Arial,
                                                                                    Helvetica,
                                                                                    sans-serif;
                                                                                  font-weight: 600;
                                                                                  font-size: 32px;
                                                                                  line-height: 40px;
                                                                                "
                                                                                class="pc-w620-font-size-28px pc-w620-line-height-29px pc-w620-letter-spacing--1px"
                                                                                >Experience smarter hiring with AI-powered interviews </span
                                                                              >
                                                                            </div>
                                                                          </div>
                                                                        </div>
                                                                      </td>
                                                                    </tr>
                                                                  </table>
                                                                </td>
                                                              </tr>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                        <tr>
                                                          <td
                                                            class="pc-w620-halign-center"
                                                            align="left"
                                                            valign="top">
                                                            <table
                                                              width="100%"
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation"
                                                              style="
                                                                min-width: 100%;
                                                              ">
                                                              <tr>
                                                                <th
                                                                  valign="top"
                                                                  class="pc-w620-align-center"
                                                                  align="left"
                                                                  style="
                                                                    text-align: left;
                                                                    font-weight: normal;
                                                                  ">
                                                                  
                                                                  <a
                                                                    class="pc-w620-textAlign-center pc-w620-padding-12-24-12-24"
                                                                    style="
                                                                      display: inline-block;
                                                                      box-sizing: border-box;
                                                                      border-radius: 4px
                                                                        4px 4px
                                                                        4px;
                                                                      background-color: #505fe2;
                                                                      padding: 16px
                                                                        32px
                                                                        16px
                                                                        32px;
                                                                      vertical-align: top;
                                                                      text-align: left;
                                                                      text-align-last: left;
                                                                      text-decoration: none;
                                                                      -webkit-text-size-adjust: none;
                                                                    "
                                                                    href="${interviewLink ||
          "#"
          }"
                                                                    target="_blank"
                                                                    ><span
                                                                      style="
                                                                        font-size: 16px;
                                                                        line-height: 24px;
                                                                        color: #ffffff;
                                                                        font-family: 'Inter',
                                                                          Arial,
                                                                          Helvetica,
                                                                          sans-serif;
                                                                        font-style: normal;
                                                                        letter-spacing: 0px;
                                                                        display: inline-block;
                                                                        vertical-align: top;
                                                                      "
                                                                      ><span
                                                                        style="
                                                                          font-family: 'Inter',
                                                                            Arial,
                                                                            Helvetica,
                                                                            sans-serif;
                                                                          display: inline-block;
                                                                        "
                                                                        ><span
                                                                          style="
                                                                            font-family: 'Inter',
                                                                              Arial,
                                                                              Helvetica,
                                                                              sans-serif;
                                                                            font-weight: 700;
                                                                            font-size: 16px;
                                                                            line-height: 24px;
                                                                            text-transform: uppercase;
                                                                          "
                                                                          >🚀 start interview</span
                                                                        ></span
                                                                      ></span
                                                                    ></a
                                                                  >
                                                                  <!--<![endif]-->
                                                                </th>
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
                                          </tbody>
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
                      <!-- END MODULE: How it works -->
                    </td>
                  </tr>
                  <tr>
                    <td valign="top">
                      <!-- BEGIN MODULE: Footer -->
                      <table
                        width="100%"
                        border="0"
                        cellspacing="0"
                        cellpadding="0"
                        role="presentation"
                        align="center"
                        class="pc-component"
                        style="width: 600px; max-width: 600px">
                        <tr>
                          <td
                            class="pc-w620-spacing-0-0-0-0"
                            width="100%"
                            border="0"
                            cellspacing="0"
                            cellpadding="0"
                            role="presentation">
                            <table
                              class="pc-component"
                              style="width: 600px; max-width: 600px"
                              align="center"
                              width="100%"
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                              role="presentation">
                              <tr>
                                <td
                                  valign="top"
                                  class="pc-w620-padding-16-16-16-16"
                                  style="
                                    padding: 16px 16px 16px 16px;
                                    height: unset;
                                    background-color: #ffffff;
                                  "
                                  bgcolor="#ffffff">
                                  <table
                                    class="pc-width-fill pc-g-b"
                                    width="100%"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    role="presentation">
                                    <tbody class="pc-g-b">
                                      <tr class="pc-g-ib pc-g-wf">
                                        <td
                                          class="pc-g-rb pc-g-rpt pc-g-rpb pc-g-wf pc-w620-itemsVSpacings-30"
                                          align="left"
                                          valign="top"
                                          style="
                                            width: 100%;
                                            padding-top: 0px;
                                            padding-bottom: 0px;
                                          ">
                                          <table
                                            style="width: 100%"
                                            border="0"
                                            cellpadding="0"
                                            cellspacing="0"
                                            role="presentation">
                                            <tr>
                                              <td
                                                class="pc-w620-padding-32-20-32-20"
                                                align="center"
                                                valign="middle"
                                                style="
                                                  padding: 44px 40px 44px 40px;
                                                  height: auto;
                                                  background-color: #000f89;;
                                                  border-radius: 8px;
                                                ">
                                                <table
                                                  width="100%"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  role="presentation">
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="top">
                                                      <table
                                                        align="center"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td
                                                            align="center"
                                                            style="
                                                              padding: 0px 0px
                                                                32px 0px;
                                                            ">
                                                            <table
                                                              align="center"
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation">
                                                              <tr>
                                                                <td
                                                                  style="
                                                                    width: unset;
                                                                  "
                                                                  valign="top">
                                                                  <table
                                                                    class="pc-width-hug"
                                                                    align="center"
                                                                    border="0"
                                                                    cellpadding="0"
                                                                    cellspacing="0"
                                                                    role="presentation">
                                                                    <tbody>
                                                                      <tr>
                                                                        <td
                                                                          class="pc-g-rpt pc-g-rpb pc-w620-itemsVSpacings-0"
                                                                          valign="middle"
                                                                          style="
                                                                            padding-top: 0px;
                                                                            padding-bottom: 0px;
                                                                          ">
                                                                          <table
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            role="presentation">
                                                                            <tr>
                                                                              <td
                                                                                align="center"
                                                                                valign="middle">
                                                                                <table
                                                                                  width="100%"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tr>
                                                                                    <td
                                                                                      align="center"
                                                                                      valign="top"
                                                                                      style="
                                                                                        line-height: 1px;
                                                                                        font-size: 1px;
                                                                                      ">
                                                                                      <a
                                                                                        class="pc-font-alt"
                                                                                        href="#"
                                                                                        target="_blank"
                                                                                        style="
                                                                                          text-decoration: none;
                                                                                          display: inline-block;
                                                                                          vertical-align: top;
                                                                                        ">
                                                                                        <img
                                                                                          src="https://cloudfilesdm.com/postcards/d39505db407e6ca83fd432b2866ccda0.png"
                                                                                          class=""
                                                                                          width="26"
                                                                                          height="26"
                                                                                          style="
                                                                                            display: block;
                                                                                            border: 0;
                                                                                            outline: 0;
                                                                                            line-height: 100%;
                                                                                            -ms-interpolation-mode: bicubic;
                                                                                            width: 26px;
                                                                                            height: 26px;
                                                                                          "
                                                                                          alt="" />
                                                                                      </a>
                                                                                    </td>
                                                                                  </tr>
                                                                                </table>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                        <td
                                                                          class="pc-w620-itemsHSpacings-20"
                                                                          valign="middle"
                                                                          style="
                                                                            padding-right: 12px;
                                                                            padding-left: 12px;
                                                                          " />
                                                                        <td
                                                                          class="pc-g-rpt pc-g-rpb pc-w620-itemsVSpacings-0"
                                                                          valign="middle"
                                                                          style="
                                                                            padding-top: 0px;
                                                                            padding-bottom: 0px;
                                                                          ">
                                                                          <table
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            role="presentation">
                                                                            <tr>
                                                                              <td
                                                                                align="center"
                                                                                valign="middle">
                                                                                <table
                                                                                  width="100%"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tr>
                                                                                    <td
                                                                                      align="center"
                                                                                      valign="top"
                                                                                      style="
                                                                                        line-height: 1px;
                                                                                        font-size: 1px;
                                                                                      ">
                                                                                      <a
                                                                                        class="pc-font-alt"
                                                                                        href="#"
                                                                                        target="_blank"
                                                                                        style="
                                                                                          text-decoration: none;
                                                                                          display: inline-block;
                                                                                          vertical-align: top;
                                                                                        ">
                                                                                        <img
                                                                                          src="https://cloudfilesdm.com/postcards/e931e54b1bf5c1e0cac743c437478e90.png"
                                                                                          class=""
                                                                                          width="26"
                                                                                          height="26"
                                                                                          style="
                                                                                            display: block;
                                                                                            border: 0;
                                                                                            outline: 0;
                                                                                            line-height: 100%;
                                                                                            -ms-interpolation-mode: bicubic;
                                                                                            width: 26px;
                                                                                            height: 26px;
                                                                                          "
                                                                                          alt="" />
                                                                                      </a>
                                                                                    </td>
                                                                                  </tr>
                                                                                </table>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                        <td
                                                                          class="pc-w620-itemsHSpacings-20"
                                                                          valign="middle"
                                                                          style="
                                                                            padding-right: 12px;
                                                                            padding-left: 12px;
                                                                          " />
                                                                        <td
                                                                          class="pc-g-rpt pc-g-rpb pc-w620-itemsVSpacings-0"
                                                                          valign="middle"
                                                                          style="
                                                                            padding-top: 0px;
                                                                            padding-bottom: 0px;
                                                                          ">
                                                                          <table
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            role="presentation">
                                                                            <tr>
                                                                              <td
                                                                                align="center"
                                                                                valign="middle">
                                                                                <table
                                                                                  width="100%"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tr>
                                                                                    <td
                                                                                      align="center"
                                                                                      valign="top"
                                                                                      style="
                                                                                        line-height: 1px;
                                                                                        font-size: 1px;
                                                                                      ">
                                                                                      <a
                                                                                        class="pc-font-alt"
                                                                                        href="#"
                                                                                        target="_blank"
                                                                                        style="
                                                                                          text-decoration: none;
                                                                                          display: inline-block;
                                                                                          vertical-align: top;
                                                                                        ">
                                                                                        <img
                                                                                          src="https://cloudfilesdm.com/postcards/649c68b0a6dc8f618df90ec1f44e0082.png"
                                                                                          class=""
                                                                                          width="26"
                                                                                          height="26"
                                                                                          style="
                                                                                            display: block;
                                                                                            border: 0;
                                                                                            outline: 0;
                                                                                            line-height: 100%;
                                                                                            -ms-interpolation-mode: bicubic;
                                                                                            width: 26px;
                                                                                            height: 26px;
                                                                                          "
                                                                                          alt="" />
                                                                                      </a>
                                                                                    </td>
                                                                                  </tr>
                                                                                </table>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                        <td
                                                                          class="pc-w620-itemsHSpacings-20"
                                                                          valign="middle"
                                                                          style="
                                                                            padding-right: 12px;
                                                                            padding-left: 12px;
                                                                          " />
                                                                        <td
                                                                          class="pc-g-rpt pc-g-rpb pc-w620-itemsVSpacings-0"
                                                                          valign="middle"
                                                                          style="
                                                                            padding-top: 0px;
                                                                            padding-bottom: 0px;
                                                                          ">
                                                                          <table
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            role="presentation">
                                                                            <tr>
                                                                              <td
                                                                                align="center"
                                                                                valign="middle">
                                                                                <table
                                                                                  width="100%"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tr>
                                                                                    <td
                                                                                      align="center"
                                                                                      valign="top"
                                                                                      style="
                                                                                        line-height: 1px;
                                                                                        font-size: 1px;
                                                                                      ">
                                                                                      <a
                                                                                        class="pc-font-alt"
                                                                                        href="#"
                                                                                        target="_blank"
                                                                                        style="
                                                                                          text-decoration: none;
                                                                                          display: inline-block;
                                                                                          vertical-align: top;
                                                                                        ">
                                                                                        <img
                                                                                          src="https://cloudfilesdm.com/postcards/db685130f408870baf377c2877a92243.png"
                                                                                          class=""
                                                                                          width="26"
                                                                                          height="26"
                                                                                          style="
                                                                                            display: block;
                                                                                            border: 0;
                                                                                            outline: 0;
                                                                                            line-height: 100%;
                                                                                            -ms-interpolation-mode: bicubic;
                                                                                            width: 26px;
                                                                                            height: 26px;
                                                                                          "
                                                                                          alt="" />
                                                                                      </a>
                                                                                    </td>
                                                                                  </tr>
                                                                                </table>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                      </tr>
                                                                    </tbody>
                                                                  </table>
                                                                </td>
                                                              </tr>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="top">
                                                      <table
                                                        align="center"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td
                                                            class="pc-w620-spacing-0-0-24-0"
                                                            valign="top"
                                                            style="
                                                              padding: 0px 0px
                                                                32px 0px;
                                                              height: auto;
                                                            ">
                                                            <table
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation"
                                                              width="100%">
                                                              <tr>
                                                                <td
                                                                  valign="top"
                                                                  align="center">
                                                                  <div
                                                                    class="pc-font-alt"
                                                                    style="
                                                                      text-decoration: none;
                                                                    ">
                                                                    <div
                                                                      style="
                                                                        font-size: 16px;
                                                                        line-height: 140%;
                                                                        text-align: center;
                                                                        text-align-last: center;
                                                                        color: #ffffff;
                                                                        font-family: 'Inter',
                                                                          Arial,
                                                                          Helvetica,
                                                                          sans-serif;
                                                                        font-style: normal;
                                                                        letter-spacing: 0px;
                                                                      ">
                                                                      <div
                                                                        style="
                                                                          font-family: 'Inter',
                                                                            Arial,
                                                                            Helvetica,
                                                                            sans-serif;
                                                                        ">
                                                                        <span
  style="
    font-family: 'Inter', Arial, Helvetica, sans-serif;
    font-weight: 400;
    font-size: 16px;
    line-height: 140%;
  "
>
  ${customMessage ||
          "Ready to ace your interview? We’re here to help you succeed"
          }
</span>
</a
                                                                        ><span
                                                                          style="
                                                                            font-family: 'Inter',
                                                                              Arial,
                                                                              Helvetica,
                                                                              sans-serif;
                                                                            font-weight: 400;
                                                                            font-size: 16px;
                                                                            line-height: 140%;
                                                                          "
                                                                          >.</span
                                                                        >
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                </td>
                                                              </tr>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="top">
                                                      <table
                                                        width="100%"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td
                                                            class="pc-w620-spacing-0-0-24-0"
                                                            valign="top"
                                                            style="
                                                              padding: 0px 0px
                                                                31px 0px;
                                                            ">
                                                            <table
                                                              width="100%"
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation"
                                                              align="center"
                                                              style="
                                                                margin: auto;
                                                              ">
                                                              <tr>
                                                                <td
                                                                  valign="top"
                                                                  style="
                                                                    line-height: 1px;
                                                                    font-size: 1px;
                                                                    border-bottom: 1px
                                                                      solid
                                                                      #ffffff33;
                                                                  ">
                                                                  &nbsp;
                                                                </td>
                                                              </tr>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="top"
                                                      style="
                                                        line-height: 1px;
                                                        font-size: 1px;
                                                      ">
                                                    
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="top">
                                                      <table
                                                        align="center"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        role="presentation">
                                                        <tr>
                                                          <td align="center">
                                                            <table
                                                              align="center"
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              role="presentation">
                                                              <tr>
                                                                <td
                                                                  style="
                                                                    width: unset;
                                                                  "
                                                                  valign="top">
                                                                  <table
                                                                    class="pc-width-hug"
                                                                    align="center"
                                                                    border="0"
                                                                    cellpadding="0"
                                                                    cellspacing="0"
                                                                    role="presentation">
                                                                    <tbody>
                                                                      <tr>
                                                                        <td
                                                                          class="pc-g-rpt pc-g-rpb pc-w620-itemsVSpacings-30"
                                                                          valign="top"
                                                                          style="
                                                                            padding-top: 0px;
                                                                            padding-bottom: 0px;
                                                                          ">
                                                                          <table
                                                                            style="
                                                                              width: 100%;
                                                                            "
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            role="presentation">
                                                                            <tr>
                                                                              <td
                                                                                align="center"
                                                                                valign="top">
                                                                                <table
                                                                                  width="100%"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tr>
                                                                                    <td
                                                                                      align="center"
                                                                                      valign="top">
                                                                                      <table
                                                                                        border="0"
                                                                                        cellpadding="0"
                                                                                        cellspacing="0"
                                                                                        role="presentation"
                                                                                        align="center">
                                                                                        <tr>
                                                                                          <td
                                                                                            valign="top"
                                                                                            align="left">
                                                                                            <a
                                                                                              class="pc-font-alt"
                                                                                              href="#"
                                                                                              target="_blank"
                                                                                              style="
                                                                                                text-decoration: none;
                                                                                              ">
                                                                                              <span
                                                                                                style="
                                                                                                  font-size: 14px;
                                                                                                  line-height: 160%;
                                                                                                  text-align: left;
                                                                                                  text-align-last: left;
                                                                                                  color: #ffffff;
                                                                                                  font-family: 'Inter',
                                                                                                    Arial,
                                                                                                    Helvetica,
                                                                                                    sans-serif;
                                                                                                  font-style: normal;
                                                                                                  letter-spacing: 0px;
                                                                                                  display: inline-block;
                                                                                                "
                                                                                                ><span
                                                                                                  style="
                                                                                                    font-family: 'Inter',
                                                                                                      Arial,
                                                                                                      Helvetica,
                                                                                                      sans-serif;
                                                                                                    display: inline-block;
                                                                                                  "
                                                                                                  ><span
                                                                                                    style="
                                                                                                      font-family: 'Inter',
                                                                                                        Arial,
                                                                                                        Helvetica,
                                                                                                        sans-serif;
                                                                                                      font-weight: 500;
                                                                                                      font-size: 16px;
                                                                                                      line-height: 140%;
                                                                                                    "
                                                                                                    class="pc-w620-font-size-14px"
                                                                                                    >About</span
                                                                                                  >
                                                                                                </span>
                                                                                              </span>
                                                                                            </a>
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
                                                                        <td
                                                                          class="pc-w620-itemsHSpacings-16"
                                                                          valign="top"
                                                                          style="
                                                                            padding-right: 15px;
                                                                            padding-left: 15px;
                                                                          " />
                                                                        <td
                                                                          class="pc-g-rpt pc-g-rpb pc-w620-itemsVSpacings-30"
                                                                          valign="top"
                                                                          style="
                                                                            padding-top: 0px;
                                                                            padding-bottom: 0px;
                                                                          ">
                                                                          <table
                                                                            style="
                                                                              width: 100%;
                                                                            "
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            role="presentation">
                                                                            <tr>
                                                                              <td
                                                                                align="center"
                                                                                valign="top">
                                                                                <table
                                                                                  width="100%"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tr>
                                                                                    <td
                                                                                      align="center"
                                                                                      valign="top">
                                                                                      <table
                                                                                        border="0"
                                                                                        cellpadding="0"
                                                                                        cellspacing="0"
                                                                                        role="presentation"
                                                                                        align="center">
                                                                                        <tr>
                                                                                          <td
                                                                                            valign="top"
                                                                                            align="left">
                                                                                            <a
                                                                                              class="pc-font-alt"
                                                                                              href="#"
                                                                                              target="_blank"
                                                                                              style="
                                                                                                text-decoration: none;
                                                                                              ">
                                                                                              <span
                                                                                                style="
                                                                                                  font-size: 14px;
                                                                                                  line-height: 160%;
                                                                                                  text-align: left;
                                                                                                  text-align-last: left;
                                                                                                  color: #ffffff;
                                                                                                  font-family: 'Inter',
                                                                                                    Arial,
                                                                                                    Helvetica,
                                                                                                    sans-serif;
                                                                                                  font-style: normal;
                                                                                                  letter-spacing: 0px;
                                                                                                  display: inline-block;
                                                                                                "
                                                                                                ><span
                                                                                                  style="
                                                                                                    font-family: 'Inter',
                                                                                                      Arial,
                                                                                                      Helvetica,
                                                                                                      sans-serif;
                                                                                                    display: inline-block;
                                                                                                  "
                                                                                                  ><span
                                                                                                    style="
                                                                                                      font-family: 'Inter',
                                                                                                        Arial,
                                                                                                        Helvetica,
                                                                                                        sans-serif;
                                                                                                      font-weight: 500;
                                                                                                      font-size: 16px;
                                                                                                      line-height: 140%;
                                                                                                    "
                                                                                                    class="pc-w620-font-size-14px"
                                                                                                    >Pricing</span
                                                                                                  >
                                                                                                </span>
                                                                                              </span>
                                                                                            </a>
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
                                                                        <td
                                                                          class="pc-w620-itemsHSpacings-16"
                                                                          valign="top"
                                                                          style="
                                                                            padding-right: 15px;
                                                                            padding-left: 15px;
                                                                          " />
                                                                        <td
                                                                          class="pc-g-rpt pc-g-rpb pc-w620-itemsVSpacings-30"
                                                                          valign="top"
                                                                          style="
                                                                            padding-top: 0px;
                                                                            padding-bottom: 0px;
                                                                          ">
                                                                          <table
                                                                            style="
                                                                              width: 100%;
                                                                            "
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            role="presentation">
                                                                            <tr>
                                                                              <td
                                                                                align="center"
                                                                                valign="top">
                                                                                <table
                                                                                  width="100%"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tr>
                                                                                    <td
                                                                                      align="center"
                                                                                      valign="top">
                                                                                      <table
                                                                                        border="0"
                                                                                        cellpadding="0"
                                                                                        cellspacing="0"
                                                                                        role="presentation"
                                                                                        align="center">
                                                                                        <tr>
                                                                                          <td
                                                                                            valign="top"
                                                                                            align="left">
                                                                                            <a
                                                                                              class="pc-font-alt"
                                                                                              href="#"
                                                                                              target="_blank"
                                                                                              style="
                                                                                                text-decoration: none;
                                                                                              ">
                                                                                              <span
                                                                                                style="
                                                                                                  font-size: 14px;
                                                                                                  line-height: 160%;
                                                                                                  text-align: left;
                                                                                                  text-align-last: left;
                                                                                                  color: #ffffff;
                                                                                                  font-family: 'Inter',
                                                                                                    Arial,
                                                                                                    Helvetica,
                                                                                                    sans-serif;
                                                                                                  font-style: normal;
                                                                                                  letter-spacing: 0px;
                                                                                                  display: inline-block;
                                                                                                "
                                                                                                ><span
                                                                                                  style="
                                                                                                    font-family: 'Inter',
                                                                                                      Arial,
                                                                                                      Helvetica,
                                                                                                      sans-serif;
                                                                                                    display: inline-block;
                                                                                                  "
                                                                                                  ><span
                                                                                                    style="
                                                                                                      font-family: 'Inter',
                                                                                                        Arial,
                                                                                                        Helvetica,
                                                                                                        sans-serif;
                                                                                                      font-weight: 500;
                                                                                                      font-size: 16px;
                                                                                                      line-height: 140%;
                                                                                                    "
                                                                                                    class="pc-w620-font-size-14px"
                                                                                                    >Contact</span
                                                                                                  >
                                                                                                </span>
                                                                                              </span>
                                                                                            </a>
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
                                                                        <td
                                                                          class="pc-w620-itemsHSpacings-16"
                                                                          valign="top"
                                                                          style="
                                                                            padding-right: 15px;
                                                                            padding-left: 15px;
                                                                          " />
                                                                        <td
                                                                          class="pc-g-rpt pc-g-rpb pc-w620-itemsVSpacings-30"
                                                                          valign="top"
                                                                          style="
                                                                            padding-top: 0px;
                                                                            padding-bottom: 0px;
                                                                          ">
                                                                          <table
                                                                            style="
                                                                              width: 100%;
                                                                            "
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            role="presentation">
                                                                            <tr>
                                                                              <td
                                                                                align="center"
                                                                                valign="top">
                                                                                <table
                                                                                  width="100%"
                                                                                  border="0"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  role="presentation">
                                                                                  <tr>
                                                                                    <td
                                                                                      align="center"
                                                                                      valign="top">
                                                                                      <table
                                                                                        border="0"
                                                                                        cellpadding="0"
                                                                                        cellspacing="0"
                                                                                        role="presentation"
                                                                                        align="center">
                                                                                        <tr>
                                                                                          <td
                                                                                            valign="top"
                                                                                            align="left">
                                                                                            <a
                                                                                              class="pc-font-alt"
                                                                                              href="#"
                                                                                              target="_blank"
                                                                                              style="
                                                                                                text-decoration: none;
                                                                                              ">
                                                                                              <span
                                                                                                style="
                                                                                                  font-size: 14px;
                                                                                                  line-height: 160%;
                                                                                                  text-align: left;
                                                                                                  text-align-last: left;
                                                                                                  color: #ffffff;
                                                                                                  font-family: 'Inter',
                                                                                                    Arial,
                                                                                                    Helvetica,
                                                                                                    sans-serif;
                                                                                                  font-style: normal;
                                                                                                  letter-spacing: 0px;
                                                                                                  display: inline-block;
                                                                                                "
                                                                                                ><span
                                                                                                  style="
                                                                                                    font-family: 'Inter',
                                                                                                      Arial,
                                                                                                      Helvetica,
                                                                                                      sans-serif;
                                                                                                    display: inline-block;
                                                                                                  "
                                                                                                  ><span
                                                                                                    style="
                                                                                                      font-family: 'Inter',
                                                                                                        Arial,
                                                                                                        Helvetica,
                                                                                                        sans-serif;
                                                                                                      font-weight: 500;
                                                                                                      font-size: 16px;
                                                                                                      line-height: 140%;
                                                                                                    "
                                                                                                    class="pc-w620-font-size-14px"
                                                                                                    >Changelog</span
                                                                                                  >
                                                                                                </span>
                                                                                              </span>
                                                                                            </a>
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
                                                                    </tbody>
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
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <!-- END MODULE: Footer -->
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table
                        width="100%"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation">
                        <tr>
                          <td
                            align="center"
                            valign="top"
                            style="
                              padding-top: 20px;
                              padding-bottom: 20px;
                              vertical-align: top;
                            ">
                            <a
                              href="#?uid=MzIxMTc2&type=footer"
                              target="_blank"
                              style="
                                text-decoration: none;
                                overflow: hidden;
                                border-radius: 2px;
                                display: inline-block;
                              ">
                              <img
                                src="https://cloudfilesdm.com/postcards/promo-footer-dark.jpg"
                                width="198"
                                height="46"
                                alt="Made with (o -) postcards"
                                style="
                                  width: 198px;
                                  height: auto;
                                  margin: 0 auto;
                                  border: 0;
                                  outline: 0;
                                  line-height: 100%;
                                  -ms-interpolation-mode: bicubic;
                                  vertical-align: top;
                                " />
                            </a>
                            <img
                              src="https://api-postcards.designmodo.com/tracking/mail/promo?uid=MzIxMTc2"
                              width="1"
                              height="1"
                              alt=""
                              style="display: none; width: 1px; height: 1px" />
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
</html>

`;

        const textContent = `
Hello,

Congratulations! You have been invited for an interview through Talk2Hire AI Recruiter.

Interview Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Position: ${jobPosition || "N/A"}
Duration: ${duration || "Not specified"}
Number of Questions: ${questionCount || "N/A"}
Interview Type: ${interviewType || "General"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click here to start your interview: ${interviewLink}

${customMessage ? `Additional Information: ${customMessage}` : ""}

We wish you the best of luck with your interview!

Best regards,
Talk2Hire AI Recruiter Team
        `;

        // Add logo as attachment
        const fs = require("fs");
        const path = require("path");

        const logoPath = path.join(process.cwd(), "public", "logo-new.png");
        let attachments = [];

        // Check if logo exists and add as attachment
        try {
          if (fs.existsSync(logoPath)) {
            attachments.push({
              filename: "logo-new.png",
              path: logoPath,
              cid: "logo", // same as referenced in the email template
            });
          }
        } catch (error) {
          console.warn("Logo file not found, email will be sent without logo");
        }

        await transporter.sendMail({
          from: `"Talk2Hire AI Recruiter" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          text: textContent,
          html: htmlContent,
          attachments: attachments,
        });
        results.push({
          email: recipient,
          success: true
        });
      } catch (error) {
        results.push({
          email: recipient,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
