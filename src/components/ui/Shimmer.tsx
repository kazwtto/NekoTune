interface ShimmerProps {
  width?: number | string
  height?: number
  rounded?: string
  count?: number
}

export default function Shimmer({ width = "100%", height = 12, rounded = "6px", count = 1 }: ShimmerProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="shimmer"
          style={{
            width: typeof width === "number" ? width : width,
            height,
            borderRadius: rounded,
            marginBottom: count > 1 ? 8 : 0,
          }}
        />
      ))}
    </>
  )
}
