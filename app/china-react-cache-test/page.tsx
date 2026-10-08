import ReactDiagnosticClient from "../china-react-early-diagnostic/ReactDiagnosticClient";

export default function ChinaReactCacheTest() {
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
        <h1>Fresh React Cache Test</h1>

        <p>
          This is a completely new page path used to test whether an old
          cached Next.js build is being reused.
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
          Starting fresh cache test...
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

  report("FRESH PAGE EARLY SCRIPT: running");
})();
          `,
        }}
      />
    </main>
  );
}