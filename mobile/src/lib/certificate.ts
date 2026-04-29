import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Issuer name displayed on the certificate. Replace with the partner non-profit's
// name once provided by the client.
export const CERTIFICATE_ISSUER = 'FinSkill Path';

export interface CertificateData {
  learnerName: string;
  courseTitle: string;
  standards?: string[];
  completedAt: Date;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildCertificateId(data: CertificateData): string {
  const seed = `${data.learnerName}|${data.courseTitle}|${data.completedAt.toISOString()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
  return `CERT-${hex}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildCertificateHtml(data: CertificateData, certificateId: string): string {
  const lessonLine = escapeHtml(data.courseTitle);
  const standardsLine =
    data.standards && data.standards.length > 0
      ? `<p class="standards">Standards mastered: ${data.standards.map(escapeHtml).join(', ')}</p>`
      : '';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Certificate</title>
  <style>
    @page { size: letter landscape; margin: 0; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      color: #1f2937;
      background: #fcfaf5;
      width: 100vw;
      height: 100vh;
    }
    .frame {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      padding: 32px;
    }
    .border-outer {
      border: 4px solid #0d9488;
      border-radius: 8px;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 12px;
    }
    .border-inner {
      border: 1px solid #d97706;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 32px 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .issuer-tag {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #0d9488;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .title {
      font-family: 'Times New Roman', serif;
      font-size: 44px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px;
    }
    .subtitle {
      font-size: 14px;
      color: #4b5563;
      margin: 0 0 24px;
    }
    .name {
      font-family: 'Times New Roman', serif;
      font-style: italic;
      font-size: 36px;
      color: #111827;
      margin: 8px 0 4px;
    }
    .name-rule {
      width: 60%;
      max-width: 520px;
      border: none;
      border-top: 1px solid #d97706;
      margin: 4px auto 24px;
    }
    .body {
      font-size: 14px;
      color: #4b5563;
      max-width: 720px;
      line-height: 1.5;
    }
    .lesson {
      font-size: 22px;
      font-weight: 700;
      color: #0d9488;
      margin: 16px 0 8px;
      max-width: 720px;
    }
    .standards {
      font-size: 11px;
      color: #6b7280;
      margin: 0;
    }
    .footer {
      margin-top: auto;
      width: 100%;
      display: flex;
      justify-content: space-between;
      gap: 24px;
    }
    .footer .col {
      flex: 1;
    }
    .sig-line {
      border: none;
      border-top: 1px solid #1f2937;
      width: 80%;
      margin: 0 auto 8px;
    }
    .label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 4px;
    }
    .value {
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }
    .cert-id {
      margin-top: 16px;
      font-size: 9px;
      color: #9ca3af;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="frame">
    <div class="border-outer">
      <div class="border-inner">
        <div class="issuer-tag">${escapeHtml(CERTIFICATE_ISSUER)}</div>
        <h1 class="title">Certificate of Completion</h1>
        <p class="subtitle">This certificate is proudly presented to</p>
        <p class="name">${escapeHtml(data.learnerName)}</p>
        <hr class="name-rule" />
        <p class="body">for successfully completing the following with 100% accuracy in the financial literacy curriculum:</p>
        <p class="lesson">${lessonLine}</p>
        ${standardsLine}
        <div class="footer">
          <div class="col">
            <p class="value">${formatDate(data.completedAt)}</p>
            <hr class="sig-line" />
            <p class="label">Date Awarded</p>
          </div>
          <div class="col">
            <p class="value">${escapeHtml(CERTIFICATE_ISSUER)}</p>
            <hr class="sig-line" />
            <p class="label">Issued By</p>
          </div>
        </div>
        <p class="cert-id">Certificate ID: ${certificateId}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function shareCertificatePdf(data: CertificateData): Promise<string> {
  const certificateId = buildCertificateId(data);
  const html = buildCertificateHtml(data, certificateId);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Share your certificate',
    });
  } else {
    await Print.printAsync({ uri });
  }

  return certificateId;
}
