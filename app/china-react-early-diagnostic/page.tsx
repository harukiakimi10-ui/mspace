import ReactDiagnosticClient from "./ReactDiagnosticClient";

export default function ChinaReactEarlyDiagnostic() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 30,
        fontFamily: "Arial, sans-serif",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          background: "#fff",
          padding: 30,
          borderRadius: 20,
        }}
      >
        <h1>Early React Error Diagnostic</h1>

        <p>
          This page checks for JavaScript errors that happen before React
          mounts.
        </p>

        <h3>Early browser report</h3>

        <pre
          id="early-diag"
          style={{
            whiteSpace: "pre-wrap",
            background: "#111",
            color: "#0f0",
            padding: 15,
            borderRadius: 10,
            minHeight: 150,
          }}
        >
          Starting early diagnostic...
        </pre>

        <ReactDiagnosticClient />
      </div>

      <script
  dangerouslySetInnerHTML={{
    __html: `
(function () {
  var output = document.getElementById("early-diag");

  function report(message) {
    if (!output) return;
    output.textContent += "\\n" + message;
  }

  window.addEventListener("error", function (event) {
    var filename = event.filename || "unknown file";

    try {
      filename = new URL(filename).pathname.split("/").pop() || filename;
    } catch (e) {}

    report(
      "JAVASCRIPT ERROR" +
      "\\nFile: " +
      filename +
      "\\nMessage: " +
      (event.message || "Unknown error") +
      "\\nLine: " +
      (event.lineno || "?") +
      "\\nColumn: " +
      (event.colno || "?")
    );
  }, true);

  window.addEventListener("unhandledrejection", function (event) {
    report(
      "UNHANDLED PROMISE: " +
      String(event.reason || "Unknown rejection")
    );
  });

  window.addEventListener("load", function () {
    report("WINDOW LOAD: completed");
  });

  report("EARLY SCRIPT: running");

  var chunk =
    "/_next/static/chunks/12ocn8f7kpxf5.js";

  report("FETCHING CHUNK...");
  report("File: 12ocn8f7kpxf5.js");

  fetch(chunk, {
    cache: "no-store"
  })
    .then(function (response) {
      report("FETCH STATUS: " + response.status);

      if (!response.ok) {
        throw new Error(
          "HTTP " + response.status
        );
      }

      return response.arrayBuffer();
    })
    .then(function (buffer) {
      report("BYTE LENGTH: " + buffer.byteLength);

      if (!window.crypto || !window.crypto.subtle) {
        report("SHA-256: Web Crypto unavailable");
        return;
      }

      return window.crypto.subtle.digest(
        "SHA-256",
        buffer
      );
    })
    .then(function (hash) {
      if (!hash) return;

      var bytes = new Uint8Array(hash);
      var hex = "";

      for (var i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, "0");
      }

      report("SHA-256: " + hex);
    })
    .catch(function (error) {
      report(
        "FETCH/HASH ERROR: " +
        String(error)
      );
    });
})();
    `,
  }}
/>
    </main>
  );
}