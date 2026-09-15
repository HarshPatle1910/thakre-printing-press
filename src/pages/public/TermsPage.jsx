export default function TermsPage() {
  return (
    <main className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1>Terms of Service</h1>
        <div style={{ marginTop: 'var(--space-8)', lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
          <h2>Enquiry &amp; Quotation</h2>
          <p>Submitting an enquiry or requesting a quote does not constitute a binding order. All quotes provided are estimates and final pricing may vary based on specific requirements, materials, and complexity.</p>

          <h2>File Upload Terms</h2>
          <p>By uploading files through our website, you confirm that you have the right to use and print the content. We are not responsible for copyright or intellectual property issues related to uploaded content.</p>
          <ul style={{ paddingLeft: '1.5rem', margin: '1rem 0' }}>
            <li>Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX</li>
            <li>Maximum file size: 10MB per file</li>
            <li>Files are stored securely and used only for your printing requirements</li>
          </ul>

          <h2>Service Terms</h2>
          <p>All printing services are subject to availability. Turnaround times are estimates and may vary. We strive to deliver quality printing services and will work with you to resolve any issues.</p>

          <h2>Contact</h2>
          <p>For any questions about these terms, please contact us at: 9923113085</p>

          <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
        </div>
      </div>
    </main>
  );
}
