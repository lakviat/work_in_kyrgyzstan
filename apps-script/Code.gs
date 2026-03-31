const CONFIG = {
  RECIPIENT_EMAIL: 'globalstaffagencykg@gmail.com',
  DRIVE_FOLDER_ID: '1_RThHnA5t9Mgg-7Uvvam3eHcO3Q9LxGR',
  SPREADSHEET_ID: '',
  MAX_ATTACHMENT_BYTES: 5 * 1024 * 1024,
  ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png'
  ]
};

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    validatePayload_(payload);

    const attachmentInfos = storeAttachments_(payload);
    const submission = buildSubmissionRecord_(payload, attachmentInfos);

    if (CONFIG.SPREADSHEET_ID) {
      appendSubmissionToSheet_(submission);
    }

    sendSubmissionEmail_(submission);
    return jsonResponse_(200, {
      success: true,
      message: 'Application received.'
    });
  } catch (error) {
    console.error(error);
    return jsonResponse_(400, {
      success: false,
      message: error.message || 'Unexpected application error.'
    });
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing request body.');
  }

  return JSON.parse(e.postData.contents);
}

function validatePayload_(payload) {
  const requiredFields = {
    fullLegalName: 'Full legal name is required.',
    currentLocation: 'Current location is required.',
    phoneCode: 'Phone code is required.',
    phoneNumber: 'Phone number is required.',
    email: 'Email address is required.',
    citizenship: 'Citizenship is required.',
    jobCategory: 'Job category is required.'
  };

  Object.keys(requiredFields).forEach((key) => {
    if (!String(payload[key] || '').trim()) {
      throw new Error(requiredFields[key]);
    }
  });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(payload.email || '').trim())) {
    throw new Error('Invalid email address.');
  }

  const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];
  if (!attachments.length) {
    return;
  }

  attachments.forEach((attachment) => {
    const extension = String(attachment.name || '').split('.').pop().toLowerCase();

    if (!CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error('Unsupported attachment type.');
    }

    if (Number(attachment.size || 0) > CONFIG.MAX_ATTACHMENT_BYTES) {
      throw new Error('Attachment exceeds the 5 MB limit.');
    }

    if (
      attachment.mimeType &&
      !CONFIG.ALLOWED_MIME_TYPES.includes(String(attachment.mimeType).toLowerCase())
    ) {
      throw new Error('Unsupported attachment mime type.');
    }

    if (!String(attachment.base64 || '').trim()) {
      throw new Error('Attachment data is missing.');
    }
  });
}

function storeAttachments_(payload) {
  const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];
  if (!attachments.length) {
    return [];
  }

  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const safeApplicant = sanitizeFilename_(payload.fullLegalName);
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');

  return attachments.map(function(attachment, index) {
    const decodedBytes = Utilities.base64Decode(attachment.base64);
    const extension = String(attachment.name || '').split('.').pop().toLowerCase();
    const safeLabel = sanitizeFilename_(attachment.label || 'attachment');
    const fileName = timestamp + '_' + safeApplicant + '_' + safeLabel + '_' + (index + 1) + '.' + extension;
    const blob = Utilities.newBlob(decodedBytes, attachment.mimeType || 'application/octet-stream', fileName);
    const file = folder.createFile(blob);

    file.setDescription([
      'Global Staff Agency applicant upload',
      'Attachment label: ' + (attachment.label || 'Attachment'),
      'Name: ' + payload.fullLegalName,
      'Email: ' + payload.email,
      'Current location: ' + payload.currentLocation,
      'Citizenship: ' + payload.citizenship
    ].join('\n'));

    return {
      label: attachment.label || 'Attachment',
      fileId: file.getId(),
      fileName: file.getName(),
      fileUrl: file.getUrl(),
      fileSize: attachment.size,
      mimeType: attachment.mimeType || 'application/octet-stream'
    };
  });
}

function buildSubmissionRecord_(payload, attachmentInfos) {
  return {
    submittedAt: payload.submittedAt || new Date().toISOString(),
    submissionSource: payload.submissionSource || 'jobsinkyrgyzstan.com',
    fullLegalName: String(payload.fullLegalName || '').trim(),
    currentLocation: String(payload.currentLocation || '').trim(),
    phoneCode: String(payload.phoneCode || '').trim(),
    phoneNumber: String(payload.phoneNumber || '').trim(),
    fullPhoneNumber: String(payload.fullPhoneNumber || '').trim(),
    email: String(payload.email || '').trim(),
    citizenship: String(payload.citizenship || '').trim(),
    jobCategory: String(payload.jobCategory || '').trim(),
    description: String(payload.description || '').trim(),
    attachments: attachmentInfos || []
  };
}

function sendSubmissionEmail_(submission) {
  const subject = 'New GSA Job Application - ' + submission.fullLegalName;
  const attachmentHtml = submission.attachments.length
    ? '<ul>' + submission.attachments.map(function(attachment) {
      return '<li><strong>' + escapeHtml_(attachment.label) + ':</strong> <a href="' + attachment.fileUrl + '">' + escapeHtml_(attachment.fileName) + '</a></li>';
    }).join('') + '</ul>'
    : '<p><strong>Drive files:</strong> No attachments uploaded.</p>';

  const htmlBody = [
    '<h2>New Global Staff Agency Application</h2>',
    '<p><strong>Submitted at:</strong> ' + submission.submittedAt + '</p>',
    '<p><strong>Source:</strong> ' + submission.submissionSource + '</p>',
    '<p><strong>Full legal name:</strong> ' + submission.fullLegalName + '</p>',
    '<p><strong>Current location:</strong> ' + submission.currentLocation + '</p>',
    '<p><strong>Phone:</strong> ' + submission.fullPhoneNumber + '</p>',
    '<p><strong>Email:</strong> ' + submission.email + '</p>',
    '<p><strong>Citizenship:</strong> ' + submission.citizenship + '</p>',
    '<p><strong>Job category:</strong> ' + submission.jobCategory + '</p>',
    '<p><strong>Description:</strong><br>' + escapeHtml_(submission.description || 'No description provided.') + '</p>',
    '<p><strong>Drive files:</strong></p>',
    attachmentHtml
  ].join('');

  const attachmentLines = submission.attachments.length
    ? submission.attachments.map(function(attachment) {
      return attachment.label + ': ' + attachment.fileUrl;
    }).join('\n')
    : 'No attachments uploaded.';

  const textBody = [
    'New Global Staff Agency application',
    '',
    'Submitted at: ' + submission.submittedAt,
    'Source: ' + submission.submissionSource,
    'Full legal name: ' + submission.fullLegalName,
    'Current location: ' + submission.currentLocation,
    'Phone: ' + submission.fullPhoneNumber,
    'Email: ' + submission.email,
    'Citizenship: ' + submission.citizenship,
    'Job category: ' + submission.jobCategory,
    'Description: ' + (submission.description || 'No description provided.'),
    'Drive files:',
    attachmentLines
  ].join('\n');

  MailApp.sendEmail({
    to: CONFIG.RECIPIENT_EMAIL,
    subject: subject,
    body: textBody,
    htmlBody: htmlBody,
    name: 'Global Staff Agency Careers'
  });
}

function appendSubmissionToSheet_(submission) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheets()[0];

  sheet.appendRow([
    submission.submittedAt,
    submission.fullLegalName,
    submission.currentLocation,
    submission.phoneCode,
    submission.phoneNumber,
    submission.email,
    submission.citizenship,
    submission.jobCategory,
    submission.description,
    submission.attachments.map(function(attachment) { return attachment.label + ': ' + attachment.fileUrl; }).join(' | '),
    submission.submissionSource
  ]);
}

function sanitizeFilename_(value) {
  return String(value || 'applicant')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'applicant';
}

function escapeHtml_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>');
}

function jsonResponse_(statusCode, payload) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: statusCode,
      ...payload
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
