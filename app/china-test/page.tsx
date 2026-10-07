export default function ChinaTestPage() {
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
          background: "#ffffff",
          borderRadius: "20px",
          padding: "40px 24px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            margin: "0 0 16px",
            fontSize: "32px",
          }}
        >
          MSpace Test
        </h1>

        <p
          style={{
            fontSize: "20px",
            margin: "0 0 12px",
          }}
        >
          China Telecom Test Page
        </p>

        <p
          style={{
            color: "#555",
            lineHeight: 1.6,
            margin: "0 0 24px",
          }}
        >
          If you can see this page, xingyuspace.com is reachable and
          serving a simple webpage successfully.
        </p>

        <div
          style={{
            display: "inline-block",
            padding: "12px 24px",
            borderRadius: "999px",
            background: "#16a34a",
            color: "#ffffff",
            fontWeight: "bold",
          }}
        >
          TEST OK
        </div>
      </div>
    </main>
  );
}