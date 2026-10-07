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
    var target = event.target;

    if (target && target.tagName === "SCRIPT") {
      report(
        "SCRIPT ERROR: " +
        (target.src || "unknown script")
      );
      return;
    }

    report(
      "JAVASCRIPT ERROR: " +
      (event.message || "Unknown error") +
      " @ " +
      (event.filename || "unknown file") +
      ":" +
      (event.lineno || "?") +
      ":" +
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
})();
          `,
        }}
      />
    </main>
  );
}