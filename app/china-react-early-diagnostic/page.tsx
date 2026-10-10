
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
          This page checks whether the live homepage JavaScript files
          can be discovered and downloaded.
        </p>

        <h3>Asset report</h3>
        <pre
          id="early-diag"
          style={{
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            background: "#111",
            color: "#0f0",
            padding: 15,
            borderRadius: 10,
            minHeight: 150,
          }}
        >
          Starting asset diagnostic...
        </pre>

        <ReactDiagnosticClient />
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
(function () {
  var output = document.getElementById("early-diag");

  function report(message) {
    if (output) output.textContent += "\\n" + message;
  }

  window.addEventListener("error", function (event) {
    report(
      "JAVASCRIPT ERROR: " +
      (event.message || "Unknown error") +
      "\\nFile: " + (event.filename || "unknown") +
      "\\nLine: " + (event.lineno || "?") +
      "\\nColumn: " + (event.colno || "?")
    );
  }, true);

  window.addEventListener("unhandledrejection", function (event) {
    report("UNHANDLED PROMISE: " + String(event.reason || "Unknown"));
  });

  report("Diagnostic script running.");
  report("Reading homepage HTML...");

  fetch("/", { cache: "no-store" })
    .then(function (response) {
      report("HOMEPAGE STATUS: " + response.status);
      if (!response.ok) throw new Error("Homepage HTTP " + response.status);
      return response.text();
    })
    .then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var scripts = Array.from(doc.querySelectorAll("script[src]"))
        .map(function (script) {
          return script.getAttribute("src");
        })
        .filter(function (src) {
          return src && src.indexOf("/_next/") === 0 &&
            /\\.js(?:\\?|$)/.test(src);
        });

      scripts = Array.from(new Set(scripts));
      report("JAVASCRIPT FILES FOUND: " + scripts.length);

      if (!scripts.length) {
        report("No Next.js JavaScript files found in homepage HTML.");
        return;
      }

      return Promise.all(scripts.map(function (src) {
        return fetch(src, { cache: "no-store" })
          .then(function (response) {
            report(
              (response.ok ? "OK " : "FAIL ") +
              response.status + " " + src +
              " | " +
              (response.headers.get("content-type") || "no content type")
            );
          })
          .catch(function (error) {
            report("FETCH ERROR " + src + " | " + String(error));
          });
      }));
    })
    .catch(function (error) {
      report("DIAGNOSTIC ERROR: " + String(error));
    });
})();
          `,
        }}
      />
    </main>
  );
}
