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



customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
