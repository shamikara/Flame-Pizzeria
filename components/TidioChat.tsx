"use client"

import Script from 'next/script';

export function TidioChat() {
  // Replace this with the key you copied from your Tidio dashboard
  const TIDIO_PUBLIC_KEY = 'your-public-key'; 

  // We use `beforeInteractive` to ensure the chat widget script loads
  // early and doesn't block the main content of the page.
  return (
    <Script
      src={`//www.tidio.co/${TIDIO_PUBLIC_KEY}.js`}
      strategy="lazyOnload"
      async
    />
  );
}