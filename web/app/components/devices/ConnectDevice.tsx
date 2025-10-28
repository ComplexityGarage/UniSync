'use client'

import { useState } from 'react'

export default function ConnectDevice({ deviceId }: { deviceId: string }) {
  const [messages, setMessages] = useState<String[]>([])

  function isSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator
  }

  const writeMessage = async (port: SerialPort, message: String) => {
    if (!port || !port.writable) return false

    const textEncoder = new TextEncoderStream()
    textEncoder.readable.pipeTo(port.writable)
    const writer = textEncoder.writable.getWriter()

    await writer.write(message + '\n')

    writer.releaseLock()
  }

  const getMessages = async (port: SerialPort) => {
    if (!port) return false

    while (port.readable) {
      const textDecoder = new TextDecoderStream()
      port.readable.pipeTo(textDecoder.writable)
      const reader = textDecoder.readable.getReader()

      try {
        let result = ''

        while (true) {
          const { value, done } = await reader.read()

          if (done) {
            reader.releaseLock()
            break
          }

          if (value == '\n') {
            if (result == '[API_URL_UPDATED]') {
              break
            }

            setMessages((messages) => [...messages, result])
          }

          if (value) {
            result += value
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  async function requestConnect() {
    if (!isSerialSupported()) {
      return false
    }

    const port = await navigator.serial.requestPort()
    if (!port) return false

    await port.open({ baudRate: 115200 })

    if (!port.writable || !port.readable) return false

    getMessages(port)

    await writeMessage(
      port,
      `URL:https://class.codeseals.dev/api/devices/${deviceId}`
    )
  }

  return (
    <div>
      <div className="bg-white rounded-2xl p-4 shadow-xs">
        <h2 className="text-lg font-medium mb-5">Connect Device</h2>
        <button onClick={requestConnect} className="btn-outline">
          Setup Device
        </button>
      </div>

      {messages.length > 0 ? (
        <div className="bg-white rounded-2xl p-4 shadow-xs">
          <h2 className="text-lg font-medium mb-5">Log</h2>
          {messages.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
      ) : (
        ''
      )}
    </div>
  )
}
