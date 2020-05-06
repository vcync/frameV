module.exports = function client(work) {
  const strings = [];

  strings.push(`
  <a
    href="${work.repo}"
    target="_blank"
    rel="noopener"
    rel="noreferrer"
    class="work-details"
  ><div>${
      work.title
    }</div><div>by ${
      work.author
    }</div>
  </a>`);

  strings.push(`
  <a
    href="https://github.com/vcync/frameV"
    target="_blank"
    rel="noopener"
    rel="noreferrer"
    class="contribute-link"
  >frameV: Contribute</a>`);

  strings.push(`
    <div id="reduced-motion-warning" class="modal-hidden modal-container show-if-prefers-reduced-motion">
      <div class="modal">
        <h1>frameV</h1>
        <p class="text-background">
          frameV's works are selected at random and may contain vestibular triggers (fast moving graphics, flashing images, zooming, scaling etc).
        </p>
        <p class="text-background">
          If you are comfortable with this please proceed by dismissing this message with the "OK" button below. By pressing "OK" this message will no longer appear when visiting frameV.
        </p>
        <p class="text-background">
          To learn more about vestibular triggers and responsive design for motion, please follow this link: <a
            href="https://webkit.org/blog/7551/responsive-design-for-motion/"
            target="_blank"
            rel="noopener"
            rel="noreferrer"
          >https://webkit.org/blog/7551/responsive-design-for-motion/</a>
        </p>
        <br />
        <button class="button" onclick="hideReducedMotionDialog()">OK</button>
      </div>
    </div>
    <script>
      function hideReducedMotionDialog() {
        document.getElementById('reduced-motion-warning').classList.add('hidden');
        localStorage.setItem('reduced-motion-warning-dismissed', true);
      }

      const reducedMotionDialogDismissed = localStorage.getItem('reduced-motion-warning-dismissed');
      if (reducedMotionDialogDismissed) {
        hideReducedMotionDialog();
      }
    </script>`);

    strings.push(`
      <noscript>
        <div class="modal-container">
          <div class="modal">
            <h1>frameV</h1>
            <p class="text-background">
              frameV requires JavaScript enabled to function correctly.
            </p>
          </div>
        </div>
      </noscript>
    `)

    return strings.join('');
  }
