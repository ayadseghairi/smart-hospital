// components/Sections/SmartAssistant.jsx
import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import "./SmartAssistant.css"

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1"

async function askAssistant(message, lang) {
  const res = await fetch(`${API_BASE}/assistant/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept-Language": lang },
    body: JSON.stringify({ message, lang }),
    credentials: "include",
  })
  if (!res.ok) throw new Error("server_error")
  const body = await res.json()
  return body.data
}

const DISCLAIMER_KEY = "assistant.disclaimer"

const SmartAssistant = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { type: "bot", text: t("assistant.greeting"), showEmergency: false },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return
    setError(null)
    const userText = text.trim()
    setInputMessage("")
    setMessages((prev) => [...prev, { type: "user", text: userText }])
    setLoading(true)

    try {
      const data = await askAssistant(userText, lang)
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: data.text,
          showEmergency: data.showEmergency,
          suggestions: data.suggestions ?? [],
        },
      ])
    } catch {
      setError(t("assistant.error"))
    } finally {
      setLoading(false)
    }
  }

  const handleSend = () => sendMessage(inputMessage)
  const handleQuickQuestion = (question) => {
    setIsOpen(true)
    sendMessage(question)
  }

  const quickQuestionKeys = ["book", "services", "nearest", "doctor"]

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500">
      <div className="text-center mb-4">
        <i className="bx bx-bot text-5xl text-green-500 mb-3"></i>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("assistant.title")}</h2>
        <p className="text-gray-600 text-sm">{t("assistant.subtitle")}</p>
      </div>

      {!isOpen ? (
        <div className="space-y-3">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <i className="bx bx-chat"></i>
            <span>{t("assistant.startChat")}</span>
          </button>

          <div className="text-xs text-gray-500">
            <p>{t("assistant.commonQuestions")}</p>
            <div className="space-y-1 mt-1">
              {quickQuestionKeys.slice(0, 2).map((key) => (
                <button
                  key={key}
                  onClick={() => handleQuickQuestion(t(`assistant.quickQuestions.${key}`))}
                  className="block w-full text-start bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded text-xs transition-colors"
                >
                  {t(`assistant.quickQuestions.${key}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Message thread */}
          <div className="bg-gray-50 rounded-lg p-3 h-48 overflow-y-auto flex flex-col gap-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`inline-block px-3 py-2 rounded-lg text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                    msg.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Emergency call buttons */}
                {msg.showEmergency && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a href="tel:14" className="flex items-center gap-1 bg-red-600 text-white text-xs px-3 py-1 rounded-full hover:bg-red-700 transition-colors">
                      <i className="bx bx-phone-call"></i> {t("emergency.civil")} (14)
                    </a>
                    <a href="tel:115" className="flex items-center gap-1 bg-red-600 text-white text-xs px-3 py-1 rounded-full hover:bg-red-700 transition-colors">
                      <i className="bx bx-phone-call"></i> {t("emergency.samu")} (115)
                    </a>
                    <Link to="/emergency" className="flex items-center gap-1 bg-orange-500 text-white text-xs px-3 py-1 rounded-full hover:bg-orange-600 transition-colors">
                      <i className="bx bx-map"></i> {t("emergency.nearestHospitals")}
                    </Link>
                  </div>
                )}

                {/* Suggestion buttons */}
                {msg.suggestions?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.suggestions.map((s, si) => (
                      <button
                        key={si}
                        onClick={() => sendMessage(s)}
                        className="text-xs bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded-full hover:bg-green-100 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="items-start flex">
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 animate-pulse">
                  {t("assistant.thinking")}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center">{t(DISCLAIMER_KEY)}</p>

          {/* Input row */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t("assistant.placeholder")}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !inputMessage.trim()}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t("assistant.send")}
            >
              <i className="bx bx-send"></i>
            </button>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            {t("assistant.closeChat")}
          </button>
        </div>
      )}
    </div>
  )
}

export default SmartAssistant
