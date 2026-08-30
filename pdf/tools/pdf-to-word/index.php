<?php
$root = '../../';
$page_title = 'PDF to Word Online Free — Convert PDF to DOCX | Daily1Step PDF';
$page_description = 'Convert a text-based PDF into an editable Word (.docx) file, free and online. Processed entirely in your browser.';
include __DIR__ . '/../../includes/header.php';
?>
<section class="tool-page">
  <div class="container">
    <div class="tool-header">
      <h1>PDF to Word</h1>
      <p>Extract the text from your PDF into an editable .docx file.</p>
    </div>

    <div class="handoff-banner" id="handoffBanner">
      <span>&#10003;</span> <span id="handoffBannerText"></span>
    </div>

    <div class="dropzone" id="dropzone">
      <input type="file" id="fileInput" accept="application/pdf">
      <p><strong>Click to select a PDF file</strong> or drag and drop it here</p>
      <p style="color:var(--ink-soft); font-size:.85rem;">One file at a time</p>
    </div>

    <div id="fileInfo" style="display:none; max-width:520px; margin:20px auto 0;">
      <div class="file-row">
        <span class="name" id="fileName"></span>
        <span class="size" id="pageCount"></span>
        <button class="remove" id="removeFile" title="Remove">&times;</button>
      </div>
    </div>

    <div class="actions" id="actions" style="display:none;">
      <button class="btn" id="convertBtn">Convert to Word</button>
    </div>

    <div class="progress-wrap" id="progressWrap">
      <div class="progress-bar"><div id="progressBar"></div></div>
      <div class="status-text" id="statusText">Converting...</div>
    </div>

    <div class="result-box" id="resultBox">
      <div class="check">&#10003;</div>
      <h3>Your Word document is ready</h3>
      <p id="resultInfo"></p>
      <a class="btn" id="downloadLink" download="converted.docx">Download converted.docx</a>
      <div style="margin-top:12px;"><button class="btn secondary" id="resetBtn">Convert another file</button></div>
    </div>

    <p class="privacy-note">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      Your files never leave your device — everything is processed locally in your browser.
    </p>

    <section class="info-section">
      <h2>What to expect</h2>
      <p>This tool extracts the actual text from your PDF and lays it out line by line in a Word document, so you can edit it. It works best on regular text-based PDFs. Scanned pages (photos of documents with no real text layer) will show up as empty in the output, since there's no text to extract. Complex layouts, tables, columns and images are not reproduced — for those, use the original PDF or a full desktop tool.</p>
    </section>
  </div>
</section>

<script src="<?php echo $root; ?>vendor/pdf.min.js"></script>
<script src="<?php echo $root; ?>vendor/docx.umd.js"></script>
<script src="<?php echo $root; ?>assets/js/handoff.js"></script>
<script src="<?php echo $root; ?>assets/js/tools/pdf-to-word.js"></script>
<?php include __DIR__ . '/../../includes/footer.php'; ?>
