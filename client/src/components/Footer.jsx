
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <a href="/" className="footer-brand">
          Rail<span>Pulse</span>
        </a>

        <p className="footer-description">
          Smarter monitoring. Safer railways.
        </p>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} RailPulse. All rights reserved.
          </span>
          <span className="footer-credit">
            Built with care for better railway maintenance.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
