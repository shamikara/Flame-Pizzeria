"use client"

import { Standard } from '@typebot.io/react'

type ChatBotProps = {
  style?: React.CSSProperties
  className?: string
  typebotId?: string
}

export function ChatBot({ style, className, typebotId = "my-typebot" }: ChatBotProps) {
  return (
    <Standard 
      typebot={typebotId}
      className={`fixed bottom-8 right-8 z-50 ${className}`}
      style={{ width: '400px', height: '600px', ...style }}
    />
  )
}