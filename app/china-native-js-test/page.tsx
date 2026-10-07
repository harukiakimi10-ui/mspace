export default function ChinaNativeJsTestPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#fff",
          borderRadius: "20px",
          padding: "40px 24px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1>Native JavaScript Test</h1>

        <p>Browser JavaScript test — no React hydration.</p>

        <div
          id="counter"
          style={{
            fontSize: "48px",
            margin: "24px 0",
          }}
        >
          0
        </div>

        <button
          id="test-button"
          style={{
            border: "none",
            borderRadius: "999px",
            padding: "14px 28px",
            background: "#16a34a",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          TAP ME
        </button>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              var button = document.getElementById("test-button");
              var counter = document.getElementById("counter");
              var count = 0;

              if (button && counter) {
                button.addEventListener("click", function () {
                  count += 1;
                  counter.textContent = String(count);
                });
              }
            })();
          `,
        }}
      />
    </main>
  );
}