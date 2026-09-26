/**
 * Poleiro do Fefo: marcador invisível, em linha, colocado logo após a última
 * palavra de um título. O topo do marcador fica na altura das maiúsculas, então
 * o Fefo pousa "em cima" do fim do título. Ver components/ui/Fefo.tsx.
 */
export function Perch({ id, className = '' }: { id: string; className?: string }) {
  return <span data-fefo-perch={id} aria-hidden className={`inline-block h-[0.72em] w-0 align-baseline ${className}`} />
}
