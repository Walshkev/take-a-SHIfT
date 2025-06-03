
import "./globals.css";
import { UserProvider } from "../context/userContext";




export const metadata = {
  title: "Take a Shift",
  description: "Kevin Walsh, Oregon State University",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserProvider >
          {children}
        </UserProvider>
      
      </body>
    </html>
  );
}
