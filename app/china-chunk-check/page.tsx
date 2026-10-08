export default function ChinaChunkCheck() {
  return (
    <main
      style={{
        padding: 24,
        fontFamily: "Arial, sans-serif",
        whiteSpace: "pre-wrap",
      }}
    >
      <h1>China Chunk Check</h1>
      <pre id="result">Checking chunk...</pre>

      <script
        dangerouslySetInnerHTML={{
          __html: `
(async function () {
  const output = document.getElementById("result");
  const chunk = "/_next/static/chunks/12ocn8f7kpxf5.js";

  try {
    const response = await fetch(chunk, {
      cache: "default",
      credentials: "same-origin"
    });

    const text = await response.text();

    let hash = "HASH FAILED";

    if (window.crypto && crypto.subtle) {
      const data = new TextEncoder().encode(text);
      const digest = await crypto.subtle.digest("SHA-256", data);
      hash = Array.from(new Uint8Array(digest))
        .map(function (b) {
          return b.toString(16).padStart(2, "0");
        })
        .join("");
    }

    output.textContent =
      "STATUS: " + response.status + "\\n" +
      "CONTENT-TYPE: " +
        (response.headers.get("content-type") || "none") + "\\n" +
      "BYTES: " +
        new TextEncoder().encode(text).length + "\\n" +
      "SHA-256: " + hash;
  } catch (error) {
    output.textContent =
      "FETCH ERROR: " + String(error);
  }
})();
`,
        }}
      />
    </main>
  );
}