import { DriveImage } from '../components/ui/DriveImage'
import { hero, frc } from '../content/drive'
import { contato, redesSociais } from '../content/texts'
import { driveUrl } from '../lib/driveUrl'

/** Rodapé minimalista — logo, Instagram, contato (quando cadastrado) e referência à FRC. */
export default function Footer() {
  return (
    <footer id="rodape" data-scene="final" className="relative border-t border-ff-line bg-ff-void">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-10">
        <div>
          <div className="flex items-center gap-4">
            <span className="overflow-hidden rounded-md border border-white/10 bg-black">
              <DriveImage file={hero.logo} alt="Logo Federal Force" width={200} className="h-12 w-auto" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">Federal Force #10466</p>
              <p className="hud-label mt-1">SESI-DF · SENAI-DF · Taguatinga, DF</p>
            </div>
          </div>
        </div>

        {redesSociais.length > 0 && (
          <div>
            <p className="hud-label">Redes sociais</p>
            <ul className="mt-4 space-y-2">
              {redesSociais.map((r) => (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 text-ff-text/80 transition-colors hover:text-ff-text"
                    aria-label={`${r.rede} ${r.usuario}`}
                  >
                    {r.rede === 'Instagram' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="text-ff-blue transition-transform group-hover:scale-110">
                        <rect x="3" y="3" width="18" height="18" rx="5" />
                        <circle cx="12" cy="12" r="4.2" />
                        <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
                      </svg>
                    )}
                    <span className="font-display text-lg tracking-tight">{r.usuario}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {contato.length > 0 && (
          <div>
            <p className="hud-label">Contato</p>
            <ul className="mt-4 space-y-2">
              {contato.map((c) => (
                <li key={c.rotulo} className="text-ff-text/80">
                  {c.href ? (
                    <a href={c.href} className="hover:text-ff-text">
                      {c.valor}
                    </a>
                  ) : (
                    c.valor
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-ff-line">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 py-6 md:px-10">
          <div className="flex items-center gap-3">
            <img src={driveUrl(frc.logo, 200)} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-7 w-auto opacity-80" />
            <span className="hud-label">FIRST Robotics Competition</span>
          </div>
          <span className="hud-label">© {new Date().getFullYear()} Federal Force #10466</span>
        </div>
      </div>
    </footer>
  )
}
