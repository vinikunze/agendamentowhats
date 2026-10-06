'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from './icons'
import type { Message } from '@/lib/agenda'

export function Bubble({
  message,
  children,
}: {
  message: Pick<Message, 'sender' | 'text' | 'time' | 'title'>
  children?: ReactNode
}) {
  return (
    <div
      className={`bubble ${message.sender === 'user' ? 'bubble-out' : 'bubble-in'}`}
    >
      {message.title ? <strong>{message.title}</strong> : null}
      <p>{message.text}</p>
      <span className="message-time">
        {message.time}
        {message.sender === 'user' ? (
          <span className="read-checks">
            <Icon name="check" size={12} />
            <Icon name="check" size={12} />
          </span>
        ) : null}
      </span>
      {children}
    </div>
  )
}

export function ChatPhone({
  label,
  clock = '15:42',
  day = 'SEGUNDA, 05 DE OUTUBRO',
  messages,
  children,
  actions,
  onSend,
  onHelp,
  inputId,
  value: controlledValue,
  onValueChange,
}: {
  label: string
  clock?: string
  day?: string
  messages: Message[]
  children?: ReactNode
  actions?: ReactNode
  onSend: (text: string) => void
  onHelp: () => void
  inputId?: string
  value?: string
  onValueChange?: (value: string) => void
}) {
  const [input, setInput] = useState('')
  const value = controlledValue ?? input
  const setValue = onValueChange ?? setInput
  const scroll = useRef<HTMLDivElement>(null)
  const previousLength = useRef(messages.length)
  useEffect(() => {
    if (previousLength.current !== messages.length && scroll.current)
      scroll.current.scrollTop = scroll.current.scrollHeight
    previousLength.current = messages.length
  }, [messages.length])

  useEffect(() => {
    const chat = scroll.current
    if (!chat) return
    const observer = new ResizeObserver(() => {
      chat.scrollTop = chat.scrollHeight
    })
    observer.observe(chat)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="phone" aria-label={label}>
      <div className="phone-status" aria-hidden="true">
        <span>{clock}</span>
        <span className="phone-sensors">
          <svg width="13" height="12" viewBox="0 0 16 14">
            <path d="M1 5a11 11 0 0 1 14 0L8 13Z" fill="currentColor" />
          </svg>
          <span className="signal-bars" />
          <span className="battery" />
        </span>
      </div>
      <div className="phone-header">
        <Icon name="back" size={18} />
        <span className="phone-avatar">AO</span>
        <span className="phone-contact">
          <strong>Agenda da Oficina</strong>
          <small>demonstração interativa</small>
        </span>
        <button
          className="phone-help"
          onClick={onHelp}
          aria-label={`Ajuda — ${label}`}
        >
          <Icon name="more" size={18} />
        </button>
      </div>
      <div
        className="chat-scroll"
        ref={scroll}
        role="log"
        aria-label={`Mensagens — ${label}`}
        aria-live="polite"
        aria-relevant="additions text"
      >
        <span className="day-stamp">{day}</span>
        {children}
        {messages.map((message) => (
          <Bubble key={message.id} message={message} />
        ))}
        {actions ? <div className="chat-actions">{actions}</div> : null}
      </div>
      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault()
          if (value.trim()) {
            onSend(value)
            setValue('')
          }
        }}
      >
        <div className="composer-input">
          <Icon name="smile" size={18} />
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={500}
            autoComplete="off"
            placeholder="Mensagem"
            aria-label={`Mensagem — ${label}`}
          />
        </div>
        <button
          className="send-button"
          type="submit"
          aria-label={`Enviar — ${label}`}
          disabled={!value.trim()}
        >
          <Icon name="send" size={18} />
        </button>
      </form>
      <div className="phone-home" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}
