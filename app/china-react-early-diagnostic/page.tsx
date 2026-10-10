
import ReactDiagnosticClient from "./ReactDiagnosticClient";

export default function ChinaReactEarlyDiagnostic() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        background: "#f5f5f5",
        color: "#111",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          background: "#fff",
          padding: 24,
          borderRadius: 16,
        }}
      >
        <h1>MSpace Browser Diagnostic</h1>

        <p>
          This test records JavaScript errors, checks browser syntax
          support, and verifies whether React mounts.
        </p>

        <h3>Diagnostic report</h3>

        <pre
          id="early-diag"
          style={{
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            background: "#111",
            color: "#7CFF7C",
            padding: 16,
            borderRadius: 10,
            minHeight: 180,
            fontSize: 13,
          }}
        >
          Initializing diagnostic...
        </pre>

        <ReactDiagnosticClient />
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
(function () {
  var output = document.getElementById("early-diag");
  var lines = [];
  var originalOnError = window.onerror;

  function report(message) {
    lines.push(String(message));
    if (output) output.textContent = lines.join("\\n");
  }

  function describeError(error) {
    if (!error) return "No error details supplied";

    var result = [
      "Message: " + (error.message || String(error)),
      "Name: " + (error.name || "unknown"),
      "File: " + (error.filename || "unknown"),
      "Line: " + (error.lineno || "?"),
      "Column: " + (error.colno || "?")
    ];

    if (error.error && error.error.stack) {
      result.push("Stack: " + error.error.stack);
    } else if (error.stack) {
      result.push("Stack: " + error.stack);
    }

    return result.join("\\n");
  }

  window.onerror = function (message, source, lineno, colno, error) {
    report(
      "GLOBAL JAVASCRIPT ERROR\\n" +
      "Message: " + String(message) +
      "\\nFile: " + (source || "unknown") +
      "\\nLine: " + (lineno || "?") +
      "\\nColumn: " + (colno || "?") +
      "\\nStack: " + (error && error.stack ? error.stack : "Not provided")
    );

    if (typeof originalOnError === "function") {
      return originalOnError.apply(this, arguments);
    }

    return false;
  };

  window.addEventListener("error", function (event) {
    report("ERROR EVENT\\n" + describeError(event));
  }, true);

  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    report(
      "UNHANDLED PROMISE REJECTION\\n" +
      (reason && reason.stack ? reason.stack : String(reason))
    );
  });

  report("Diagnostic script executed.");
  report("User agent: " + navigator.userAgent);
  report("Page URL: " + location.href);

  function testSyntax(name, source) {
    try {
      new Function(source);
      report("SYNTAX PASS: " + name);
    } catch (error) {
      report(
        "SYNTAX FAIL: " + name +
        "\\n" + (error.name || "Error") +
        ": " + (error.message || String(error))
      );
    }
  }

  testSyntax(
    "Optional chaining",
    "return ({a:{b:1}})?.a?.b;"
  );

  testSyntax(
    "Nullish coalescing",
    "return null ?? 1;"
  );

  testSyntax(
    "Logical nullish assignment",
    "let x; x ??= 1; return x;"
  );

  testSyntax(
    "Arrow functions",
    "return (() => 1)();"
  );

  testSyntax(
    "Async functions",
    "return async function () { return 1; };"
  );

  report("Checking homepage JavaScript assets...");

  fetch("/", { cache: "no-store" })
    .then(function (response) {
      report("HOMEPAGE HTTP STATUS: " + response.status);

      if (!response.ok) {
        throw new Error("Homepage returned HTTP " + response.status);
      }

      return response.text();
    })
    .then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var scripts = Array.prototype.slice.call(
        doc.querySelectorAll("script[src]")
      )
        .map(function (script) {
          return script.getAttribute("src");
        })
        .filter(function (src) {
          return src &&
            src.indexOf("/_next/") === 0 &&
            /\\.js(?:\\?|$)/.test(src);
        });

      scripts = scripts.filter(function (src, index) {
        return scripts.indexOf(src) === index;
      });

      report("HOMEPAGE JS FILE COUNT: " + scripts.length);

      return Promise.all(scripts.map(function (src) {
        return fetch(src, { cache: "no-store" })
          .then(function (response) {
            report(
              "ASSET " + (response.ok ? "OK" : "FAIL") +
              " | HTTP " + response.status +
              " | " + src +
              " | " + (response.headers.get("content-type") || "unknown type")
            );
          })
          .catch(function (error) {
            report(
              "ASSET FETCH ERROR | " + src +
              " | " + String(error)
            );
          });
      }));
    })
    .catch(function (error) {
      report(
        "ASSET DIAGNOSTIC FAILED\\n" +
        (error && error.stack ? error.stack : String(error))
      );
    });
})();
          `,
        }}
      />
    </main>
  );
}
