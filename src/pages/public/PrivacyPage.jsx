export default function PrivacyPage() {
  return (
    <main className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1>Privacy Policy</h1>
        <div style={{ marginTop: 'var(--space-8)', lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
          <h2>Information We Collect</h2>
          <p>When you submit an enquiry or quote request through our website, we collect the following information:</p>
          <ul style={{ paddingLeft: '1.5rem', margin: '1rem 0' }}>
            <li>Name</li><li>Mobile number</li><li>Email address (optional)</li>
            <li>Service requirements</li><li>Uploaded files related to your printing needs</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information you provide to:</p>
          <ul style={{ paddingLeft: '1.5rem', margin: '1rem 0' }}>
            <li>Process your printing enquiry</li><li>Provide you with quotes and estimates</li>
            <li>Contact you regarding your requirements</li><li>Improve our services</li>
          </ul>

          <h2>File Uploads</h2>
          <p>Files you upload for printing purposes (designs, documents, images) are stored securely and are only accessible to authorized staff members handling your enquiry. We do not share your uploaded files with any third parties.</p>

          <h2>Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information and uploaded files. Access to customer data is restricted to authorized staff only.</p>

          <h2>Contact</h2>
          <p>For any privacy-related questions, please contact us at: 9923113085</p>

          <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
        </div>
      </div>
    </main>
  );
}
