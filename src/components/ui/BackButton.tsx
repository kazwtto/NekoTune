import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function BackButton() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(-1)}
      className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm text-muted transition-colors duration-150 hover:opacity-80"
    >
      <ArrowLeft size={16} /> {t("common.back")}
    </button>
  )
}
