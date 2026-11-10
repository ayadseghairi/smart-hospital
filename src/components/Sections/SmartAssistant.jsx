// components/Sections/SmartAssistant.jsx

import { useState } from "react"
import { useTranslation } from "react-i18next"
import "./SmartAssistant.css"

const SmartAssistant = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([{ type: "bot", text: t("assistant.greeting") }])
  const [inputMessage, setInputMessage] = useState("")

  const quickQuestionKeys = ["book", "services", "nearest", "doctor"]

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([
        ...messages,
        { type: "user", text: inputMessage },
        { type: "bot", text: t("assistant.thanks") },
      ])
      setInputMessage("")
    }
  }

  const handleQuickQuestion = (question) => {
    setMessages([
      ...messages,
      { type: "user", text: question },
      { type: "bot", text: t("assistant.excellent") },
    ])
  }

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
                  onClick={() => {
                    setIsOpen(true)
                    handleQuickQuestion(t(`assistant.quickQuestions.${key}`))
                  }}
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
          <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`mb-2 ${message.type === "user" ? "text-end" : "text-start"}`}>
                <div
                  className={`inline-block px-3 py-1 rounded-lg text-sm ${
                    message.type === "user" ? "bg-blue-500 text-white" : "bg-white border"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t("assistant.placeholder")}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
