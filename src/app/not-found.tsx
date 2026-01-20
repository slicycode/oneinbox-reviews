import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "0.5rem",
        }}
      >
        404
      </h2>
      <p
        style={{
          fontSize: "1.125rem",
          color: "#666",
          marginBottom: "1.5rem",
        }}
      >
        Page not found
      </p>
      <Link
        href="/"
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#000",
          color: "#fff",
          borderRadius: "0.375rem",
          textDecoration: "none",
        }}
      >
        Go home
      </Link>
    </div>
  );
}
