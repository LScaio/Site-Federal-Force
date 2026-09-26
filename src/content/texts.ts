/**
 * Textos transcritos VERBATIM dos arquivos .txt do Drive "Dados_Site_Federal".
 * Não reescreva: para alterar um texto, altere o arquivo no Drive e
 * atualize a transcrição aqui. Cada bloco indica o arquivo de origem.
 */

/** Intro geral da equipe / Quem somos.txt */
export const quemSomosTexto = {
  titulo: 'Quem somos',
  paragrafos: [
    'Somos a Federal Force #10466, equipe de robótica do SESI-DF e do SENAI-DF, com sede em Taguatinga, no Distrito Federal. Reunimos estudantes do ensino médio e do ensino técnico que, juntos, levam o nome do Brasil à FIRST Robotics Competition (FRC).',
    'Mais do que construir robôs de alto desempenho, acreditamos na inovação e no trabalho em equipe como caminhos para gerar impacto positivo por meio da ciência e da tecnologia.',
    'Em 2025, vivemos um momento inesquecível: conquistamos o Rookie All-Star Award no FIRST Championship, em Houston (EUA), um reconhecimento internacional à equipe estreante de maior destaque da competição.',
  ],
}

/** FRC / O que é a FRC.txt */
export const frcTexto = {
  titulo: 'O que é a FRC',
  paragrafos: [
    'A FIRST Robotics Competition (FRC) é uma das maiores competições de robótica do mundo, criada pela FIRST, organização sem fins lucrativos fundada nos Estados Unidos por Dean Kamen. Todos os anos, milhares de equipes de diversos países participam do desafio.',
    'A cada temporada, um novo jogo é revelado no início do ano, e as equipes têm poucas semanas para projetar, construir e programar um robô capaz de cumpri-lo. Nas partidas, os robôs competem em alianças formadas por três equipes, o que torna a colaboração tão importante quanto o desempenho.',
    'Mas a FRC vai muito além das disputas. Durante a temporada, os estudantes vivem a rotina de uma empresa de tecnologia: desenvolvem projetos de engenharia, gerenciam recursos, buscam patrocínios, criam a identidade da equipe e realizam ações na comunidade, sempre com o apoio de mentores.',
    'Tudo isso é guiado pelos valores de Gracious Professionalism, que une competitividade e respeito, e de Coopertition, a ideia de que é possível competir ajudando uns aos outros. Na FRC, o maior prêmio é a formação de jovens preparados para transformar o mundo por meio da ciência e da tecnologia.',
  ],
}

/** Equipe Rebuilt 2026 / Nossa temporada REBUILT (2026).txt */
export const rebuiltTexto = {
  titulo: 'Nossa temporada REBUILT (2026)',
  historia:
    'Em 2026, encaramos o REBUILT, jogo da FRC inspirado na ideia de reimaginar o passado, com a arqueologia como pano de fundo. Tudo começou no Kickoff, em 10 de janeiro, quando descobrimos o desafio que nos acompanharia durante toda a temporada.',
  desafio:
    'O objetivo era lançar bolas de espuma, chamadas Fuel, em um alvo central do nosso lado do campo e, no fim da partida, escalar a Tower, uma estrutura em formato de escada com até três níveis. Tudo isso em alianças de três equipes, onde estratégia e comunicação fazem toda a diferença.',
  robo:
    'Para esse desafio, construímos o Phoenix. Ele foi pensado para pontuar bolinhas com um intake para coletar as bolas do chão, um shooter para lançá-las mas sem um sistema de Climber porque não compensava na nossa estratégia. No período autônomo, nosso robô pontuava em média 7 bolinhas.',
}

/** Equipe Reefscape 2025 / Nossa temporada REEFSCAPE (2025).txt */
export const reefscapeTexto = {
  titulo: 'Nossa temporada REEFSCAPE (2025)',
  historia:
    'Em 2025, vivemos a nossa primeira temporada na FRC com o REEFSCAPE, um jogo inspirado no fundo do mar. O desafio foi revelado no Kickoff, em 4 de janeiro, e dali em diante a Federal Force começou a tomar forma.',
  desafio:
    'No jogo, os robôs precisavam coletar corais e posicioná-los nos diferentes níveis de um recife, além de remover e pontuar as algas, bolas que podiam ser levadas ao processador ou lançadas na rede. No fim da partida, os robôs ainda podiam subir em estruturas suspensas, as cages, para garantir pontos extras.',
  robo:
    'Para esse desafio, construímos o Griffo. Ele foi pensado para Climbar ele conseguia alcançar o último nível, sendo seu ponto mais forte',
  competicoes: 'Competimos no Regional de Brasília e o FIRST Championship, em Houston.',
  premio:
    'E a temporada ainda guardava uma surpresa. No FIRST Championship, em Houston, conquistamos o Rookie All-Star Award, prêmio que reconhece a equipe estreante de maior destaque da competição. Para quem estava começando, foi a prova de que uma estreia histórica em que a Federal Force #10466 levou o Distrito Federal ao cenário mundial e conquistou o prestigiado Rookie All-Star Award.',
  fecho: 'Foi assim que a Federal mostrou, logo de cara, que estava a milhão!',
}

/** Projetos_Sociais / <projeto>/<projeto>.txt */
export const projetosTexto = [
  {
    id: 'force-voice',
    nome: 'Force Voice',
    origem: 'Projetos_Sociais/Force Voice/Force Voice.txt',
    texto:
      'O Force Voice é a voz da nossa equipe. Criado para comunicar, conectar e inspirar, o projeto transforma ideias em mensagens que alcançam nossa comunidade. Por meio de conteúdos, entrevistas e produções autorais, usamos a comunicação como ferramenta de impacto, dando espaço para histórias, aprendizados e experiências que mostram que a robótica também é feita de pessoas.',
  },
  {
    id: 'steam-girls',
    nome: 'STEAM Girls',
    origem: 'Projetos_Sociais/STEAM Girls/STEAM Girls.txt',
    texto:
      'O STEAM Girls nasceu com o propósito de fortalecer e incentivar a participação feminina nas áreas de Ciência, Tecnologia, Engenharia, Artes e Matemática. Mais do que um projeto, é um movimento dentro da nossa comunidade. Promovemos encontros, rodas de conversa, mentorias e iniciativas que desenvolvem representatividade, confiança e protagonismo para meninas na tecnologia.',
  },
  {
    id: 'rocket-force',
    nome: 'Rocket Force',
    origem: 'Projetos_Sociais/RocketForce/RocketFederal.txt',
    texto:
      'O Rocket Force é o nosso projeto de impacto social voltado à expansão da robótica e da ciência para além da nossa equipe. Por meio dele, levamos conhecimento, inspiração e oportunidades a estudantes que muitas vezes não teriam acesso à tecnologia. Realizamos oficinas, mentorias e ações educacionais que despertam o interesse pelo STEM e mostram que qualquer jovem pode alcançar voos altos quando recebe incentivo e direção.',
  },
]

/**
 * Parceiros — o Drive "Dados_Site_Federal" ainda NÃO possui a pasta de parceiros.
 * A seção só é renderizada quando esta lista tiver itens vindos do Drive.
 */
export type Parceiro = {
  nome: string
  area: string
  descricao: string
  logoDriveId: string
  link?: string
}
export const parceiros: Parceiro[] = []

/**
 * Rodapé — redes sociais e contato ainda não existem no Drive.
 * Os blocos só aparecem quando preenchidos a partir do Drive.
 */
export const redesSociais: { rede: string; url: string }[] = []
export const contato: { rotulo: string; valor: string; href?: string }[] = []

/** Frases definidas no briefing do projeto. */
export const slogan = 'A Federal tá a milhão'
export const fraseFinal = ['A Federal tá a milhão.', 'E ainda estamos acelerando.']
