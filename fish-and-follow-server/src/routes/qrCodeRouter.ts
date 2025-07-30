import { Router } from 'express';
import QRCode from 'qrcode';

export const qrRouter = Router();

/**
 * GET /qr/:orgId - get a QR code image that links to the student form
 * in a particular organization
 */
qrRouter.get('/:orgId', async (req, res) => {
  const organizationId = req.params.orgId;
  const download = req.query.download;
  console.log('Requesting QR Code for org', organizationId);
  // Todo get by organization - exact format not set.
  const url = `${process.env.BASE_URL}/contact-form?organization=${organizationId}`;
  try {
    // Can customize the QR code color, these match our theme but can 
    // adjust when we do the front end
    const color = {
      dark: "#4993A1",
      light: "#CDF5FD",
    };
    const qr = await QRCode.toBuffer(url, { type: 'png', color, scale: 8 });
    res.setHeader('content-type', 'image/png');
    res.setHeader('content-length', qr.length);
    if (download) {
      res.setHeader('Content-Disposition', 'attachment; filename=fish-and-follow-qr.png');
    }
    res.status(200).send(qr);
  } catch (err) {
    console.error('Error generating QR code', err);
    res.status(500).send('Error generating QR code');
  }
})
