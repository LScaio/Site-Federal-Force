import type { DriveFile } from '../content/drive'

/**
 * Resolve a URL de um arquivo do Drive.
 * - modo "drive" (padrão): CDN pública do Google Drive, com redimensionamento no servidor.
 * - modo "local" (VITE_DRIVE_SOURCE=local): arquivos baixados por `npm run sync:drive`.
 */
const LOCAL = import.meta.env.VITE_DRIVE_SOURCE === 'local'

export function extOf(file: DriveFile) {
  const m = file.name.match(/\.([a-z0-9]+)$/i)
  return m ? m[1].toLowerCase() : 'bin'
}

export function driveUrl(file: DriveFile, width = 1600) {
  if (LOCAL) return `${import.meta.env.BASE_URL}drive/${file.id}.${extOf(file)}`
  return `https://lh3.googleusercontent.com/d/${file.id}=w${width}`
}

export function driveSrcSet(file: DriveFile, widths = [480, 960, 1600, 2400]) {
  if (LOCAL) return undefined
  return widths.map((w) => `${driveUrl(file, w)} ${w}w`).join(', ')
}

/** Miniatura minúscula para o efeito blur-up do carregamento progressivo. */
export function drivePlaceholder(file: DriveFile) {
  if (LOCAL) return undefined
  return driveUrl(file, 24)
}
