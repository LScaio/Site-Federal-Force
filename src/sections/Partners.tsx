import { SceneTitle, Reveal } from '../components/ui/Reveal'
import { DriveImage } from '../components/ui/DriveImage'
import { parceiros } from '../content/texts'

/**
 * PARCEIROS — cada parceiro vira um card com logo, nome, área de atuação,
 * descrição da parceria e link oficial (quando existir).
 * Fonte: pasta de parceiros do Drive (ainda inexistente → a seção não é exibida).
 */
export default function Partners() {
  if (parceiros.length === 0) return null
  return (
    <section id="parceiros" data-scene="parceiros" className="scene flex items-center bg-ff-void py-28">
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
        <SceneTitle index="06" kicker="Ecossistema" perch="parceiros">
          Parceiros
        </SceneTitle>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {parceiros.map((p, i) => (
            <Reveal key={p.nome} delay={i * 0.06}>
              <article className="group flex h-full flex-col rounded-md border border-ff-line bg-ff-ink/70 p-7 transition-colors duration-500 hover:border-ff-blue/50">
                <div className="flex h-20 items-center">
                  <DriveImage
                    file={{ id: p.logoDriveId, name: `${p.nome}.png`, mime: 'image/png' }}
                    alt={`Logo ${p.nome}`}
                    width={400}
                    className="max-h-16 w-auto max-w-[70%] object-contain"
                  />
                </div>
                <p className="mt-6 hud-label text-ff-blue">{p.area}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{p.nome}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ff-text/75">{p.descricao}</p>
                {p.link && (
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="mt-6 hud-label inline-flex items-center gap-2 hover:text-ff-text">
                    Site oficial <span aria-hidden>↗</span>
                  </a>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
