import { useCachedImage } from "../../hooks/useCachedImage"

interface CachedImgProps {
  src: string | undefined | null
  alt?: string
  className?: string
}

export default function CachedImg({ src, alt, className }: CachedImgProps) {
  const resolvedSrc = useCachedImage(src)
  if (!resolvedSrc) return null
  return <img src={resolvedSrc} alt={alt ?? ""} className={className} />
}
