import * as React from "react"

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, fill, width, height, className, ...props }, ref) => {
    return (
      <img
        ref={ref}
        src={src || "/placeholder.svg"}
        alt={alt}
        className={className}
        style={{
          ...(fill ? { position: "absolute", width: "100%", height: "100%", top: 0, left: 0 } : {}),
          objectFit: "cover",
          ...(width ? { width: width } : {}),
          ...(height ? { height: height } : {}),
        }}
        width={width}
        height={height}
        {...props}
      />
    )
  },
)
Image.displayName = "Image"

export { Image }
