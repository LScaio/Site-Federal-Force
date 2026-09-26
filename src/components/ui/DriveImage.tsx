import { useEffect, useRef, useState } from 'react'
import type { DriveFile } from '../../content/drive'
import { driveUrl, driveSrcSet, drivePlaceholder } from '../../lib/driveUrl'

type Props = {
  file: DriveFile
  alt: string
  className?: string
  imgClassName?: string
  /** largura base pedida ao Drive (a srcset cobre as demais). */
  width?: number
  sizes?: string
  eager?: boolean
  /** Envolve a imagem em um container com blur-up progressivo. */
  cover?: boolean
  /** Enquadramento da imagem no modo cover (CSS object-position). */
  objectPosition?: string
}

/**
 * Imagem carregada diretamente do Drive "Dados_Site_Federal" com
 * carregamento progressivo: miniatura desfocada → imagem final.
 */
export function DriveImage({ file, alt, className = '', imgClassName = '', width = 1600, sizes, eager, cover, objectPosition }: Props) {
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  // Imagens já em cache podem terminar de carregar antes do onLoad ser registrado.
  useEffect(() => {
    const img = ref.current
    if (img?.complete && img.naturalWidth > 0) setLoaded(true)
  }, [file.id])
  const placeholder = drivePlaceholder(file)
  const img = (
    <img
      ref={ref}
      src={driveUrl(file, width)}
      style={objectPosition ? { objectPosition } : undefined}
      srcSet={cover ? driveSrcSet(file) : undefined}
      sizes={cover ? sizes ?? '(min-width: 900px) 50vw, 100vw' : undefined}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onLoad={() => setLoaded(true)}
      className={
        cover
          ? `absolute inset-0 h-full w-full object-cover transition-[opacity,filter,transform] duration-[1200ms] ease-[var(--ease-cine)] ${
              loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
            } ${imgClassName}`
          : `${className} transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`
      }
    />
  )
  if (!cover) return img
  return (
    <div className={`relative overflow-hidden bg-ff-panel ${className}`}>
      {placeholder && !loaded && (
        <img src={placeholder} alt="" aria-hidden referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl" />
      )}
      {img}
    </div>
  )
}
