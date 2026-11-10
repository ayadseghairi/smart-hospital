// components/Sections/HealthInstitutions.jsx
import "./HealthInstitutions.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { apiGet } from "../../api/client"

const HealthInstitutions = ({ onInstitutionSelect }) => {
  const [showList, setShowList] = useState(false)
  const [selectedType, setSelectedType] = useState("all")
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"

  const { data, isLoading, error } = useQuery({
    queryKey: ["institutions-home", selectedType],
    queryFn: () => apiGet(
      `/institutions?limit=20&page=1${selectedType !== "all" ? `&sector=${selectedType}` : ""}`,
      lang
    ),
    enabled: showList,
  })

  const institutions = data?.institutions ?? []

  const handleInstitutionClick = (institution) => {
    if (onInstitutionSelect) {
      onInstitutionSelect(institution)
    } else {
      navigate(`/institution/${institution.id}`)
    }
  }

  const institutionTypeKeys = ["all", "PUBLIC", "PRIVATE"]
  const typeIcons = { all: "bx-buildings", PUBLIC: "bx-building", PRIVATE: "bx-store" }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-500">
      <div className="text-center mb-4">
        <i className="bx bx-hospital text-5xl text-purple-500 mb-3"></i>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("institutions.title")}</h2>
        <p className="text-gray-600 text-sm">{t("institutions.subtitle")}</p>
      </div>

      {!showList ? (
        <div className="space-y-3">
          <button
            onClick={() => setShowList(true)}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <i className="bx bx-list-ul"></i>
            <span>{t("institutions.showList")}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Filter Buttons */}
          <div className="flex gap-1">
            {institutionTypeKeys.map((typeId) => (
              <button
                key={typeId}
                onClick={() => setSelectedType(typeId)}
                className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                  selectedType === typeId
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <i className={`bx ${typeIcons[typeId]} me-1`}></i>
                {t(`institutions.types.${typeId}`)}
              </button>
            ))}
          </div>

          {/* Institutions List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {isLoading ? (
              <p className="text-center text-sm text-gray-500 py-4">{t("common.loading")}</p>
            ) : error ? (
              <p className="text-center text-sm text-red-500 py-4">{t("common.loadError")}</p>
            ) : institutions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="bx bx-buildings text-4xl mb-2 text-gray-300"></i>
                <p className="text-sm">{t("institutions.empty")}</p>
                <p className="text-xs mt-1 text-gray-400">{t("institutions.emptyHint")}</p>
              </div>
            ) : (
              institutions.map((institution) => (
                <div
                  key={institution.id}
                  onClick={() => handleInstitutionClick(institution)}
                  className="border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <h4 className="font-semibold text-sm text-gray-800">
                    {lang === "ar" ? institution.nameAr : institution.nameFr}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {lang === "ar" ? institution.commune?.nameAr : institution.commune?.nameFr}
                  </p>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setShowList(false)}
            className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            {t("institutions.hideList")}
          </button>
        </div>
      )}
    </div>
  )
}

export default HealthInstitutions
