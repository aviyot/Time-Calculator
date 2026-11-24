import "../style.css";

export const metadata = {
  title: "Time Sum Calculator",
  description:
    "Calculate and sum hours, minutes, and seconds easily with a sleek multiplier.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
