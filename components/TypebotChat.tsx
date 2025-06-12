// components/TypebotChat.tsx
'use client';

import { useEffect } from 'react';

export default function TypebotChat() {
  useEffect(() => {
    (async () => {
      const typebot = await import('@typebot.io/js');
      // @ts-ignore (temporary workaround)
      typebot.initBubble({
        typebot: "customer-support-eq9xqy3",
        theme: {
          button: { backgroundColor: "#0042DA" },
          chatWindow: { backgroundColor: "#ffffff" }
        }
      });
    })();
  }, []);

  return null;
}