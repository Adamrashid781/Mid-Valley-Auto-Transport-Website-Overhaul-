const NAV_LINKS = [
  ["about-us.html", "About Us"],
  ["services.html", "Services"],
  ["getquote.html", "Get A Quote"],
  ["termsandconditions.html", "Terms &amp; Conditions"],
  ["reviews.html", "Reviews"],
  ["account.html", "Account"],
];

const currentPage = location.pathname.split("/").pop() || "index.html";

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const theme = this.getAttribute("theme") === "dark" ? "dark" : "light";
    const logo = theme === "dark"
      ? `<img src="assets/nav-logo-white.png" width="340" height="125" alt="Mid Valley Auto Transport Inc. - Home">`
      : `<img src="assets/nav-logo-color.png" width="433" height="158" alt="Mid Valley Auto Transport Inc. - Home">`;
    const links = NAV_LINKS.map(([href, label]) =>
      `<li><a href="${href}"${href === currentPage ? ' aria-current="page"' : ""}>${label}</a></li>`
    ).join("");

    this.innerHTML = `
      <header class="site-header ${theme}">
        <nav class="nav" aria-label="Main">
          <a class="nav-logo" href="index.html">${logo}</a>
          <ul class="nav-links">${links}</ul>
          <a class="nav-cta" href="contact.html">CONTACT</a>
        </nav>
      </header>`;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const compact = this.getAttribute("variant") === "compact";
    const cta = compact ? "" : `
      <h2 class="footer-title">Ready To Let Us Get To Work?</h2>
      <form class="footer-form" action="contact.html" method="get">
        <label class="visually-hidden" for="footer-email">Email</label>
        <input id="footer-email" name="email" type="email" autocomplete="email" placeholder="Enter email here like example@mysite.com">
        <img class="footer-line" src="assets/line-footer.svg" width="1655" height="1" alt="">
        <button type="submit" class="contact-btn">Contact Me</button>
      </form>`;

    this.innerHTML = `
      <footer class="site-footer${compact ? " compact" : ""}">
        <div class="footer-inner">
          ${cta}
          <div class="footer-cols">
            <div class="footer-brand">
              <p><a href="index.html">Mid Valley Auto<br>Transport Inc.</a></p>
              <img src="assets/footer-logo.png" width="353" height="235" alt="Mid Valley Auto Transport Inc. logo">
            </div>
            <div class="footer-col col-company">
              <h3>COMPANY</h3>
              <ul>
                <li><a href="about-us.html">About Us</a></li>
                <li><a href="services.html">Services</a></li>
                <li><a href="getquote.html">Get A Quote</a></li>
                <li><a href="termsandconditions.html">Terms &amp; Conditions</a></li>
              </ul>
            </div>
            <div class="footer-col col-legal">
              <h3>LEGAL</h3>
              <ul><li><a href="termsandconditions.html">Terms &amp; Conditions</a></li></ul>
            </div>
            <div class="footer-col col-contact">
              <h3>CONTACT</h3>
              <address>
                <a href="mailto:info@midvalleyauto.net">info@midvalleyauto.net</a><br>
                <a href="tel:510-557-8312">Tel: 510-557-8312</a><br>
                18 Oak St #2126<br>
                Brentwood, CA&nbsp; 94513
              </address>
            </div>
          </div>
        </div>
      </footer>`;
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
