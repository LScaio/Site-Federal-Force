/**
 * Manifesto do Google Drive "Dados_Site_Federal".
 *
 * Este arquivo espelha 1:1 os arquivos existentes em cada pasta do Drive
 * (id + nome original). Nenhum asset do site existe fora desta lista.
 * `npm run sync:drive` baixa todos para `public/drive/` (modo local);
 * sem isso, as imagens são servidas diretamente do Drive público.
 */

export type DriveFile = {
  id: string
  name: string
  mime: string
}

const f = (id: string, name: string, mime = 'image/jpeg'): DriveFile => ({ id, name, mime })

export const DRIVE_ROOT_ID = '179G0wzGuSX73htOh8Kn2-ndZZP9iAn9R'

/** Pasta: Hero(Telainicial) */
export const hero = {
  logo: f('1rjcPBt0-UpOM_9zLOQZn2-DQU72SIWFC', 'LogoFederal2.jpg'),
  fefo: f('1FiddOp3MBv_U3Tm1q6CMSFmFKp4I3Axa', 'CorujaFederal.png', 'image/png'),
  /**
   * CAD 3D do robô com cores (exportação do Onshape): "Assembly final.obj" +
   * "Assembly final.mtl" — fonte do federal-robot.glb.
   */
  cadObj: f('1FAlYHswuVxEGBEr3u8j415bdoqgXBgZH', 'Assembly final.obj', 'model/robot'),
  cadMtl: f('1U_cKcNXoQoL9oYhUInWJ64Pe2HjY0skx', 'Assembly final.mtl', 'model/robot'),
  /** Mesmo robô em STL binário, sem cores (arquivo "CAAD3D") — alternativa. */
  cadStl: f('1LB6MBACM4FQ2mHx5I28aEbvlJhG7juOp', 'CAAD3D', 'model/robot-stl'),
}

/**
 * Pasta: Hero(Telainicial)/AnimaçãoCorujaDireita e /AnimaçãoCorujaEsquerda —
 * 12 frames do Fefo (384×341, PNG transparente) em cada direção:
 * 01 pousado · 02–03 decolagem · 04–08 voo · 09–11 pouso · 12 pousado.
 */
export const fefoVooDireita: DriveFile[] = [
  f('1zOXDKheewpOhZhh87U0oC6XgRi0Hny-K', 'fefo_frame_01.png', 'image/png'),
  f('1hoVExFxGTNKZHa-M7_5AYwGKKOa5-_7M', 'fefo_frame_02.png', 'image/png'),
  f('1aPPWQvy4atE6oDCsoki4fOpx-CX7FPLZ', 'fefo_frame_03.png', 'image/png'),
  f('1F9fSosdPnx_YQk8yiJgVhsShK7ulGLqC', 'fefo_frame_04.png', 'image/png'),
  f('1FyrxDJIdi5O3bjz2yB1wQtLuqzxeVCYW', 'fefo_frame_05.png', 'image/png'),
  f('1TwQeQMDA6hcgvzhBW9TBWy8Ayzk8FJE_', 'fefo_frame_06.png', 'image/png'),
  f('1RSCNHoyporRqzCBvLNVf1JwBbl3BBQsW', 'fefo_frame_07.png', 'image/png'),
  f('1vfMWhN0RlHKft8Ltx3rdFZ9OH3OUbu1G', 'fefo_frame_08.png', 'image/png'),
  f('1InV-Q_8DBQ12BUrqh0pspiZJECdPk01Q', 'fefo_frame_09.png', 'image/png'),
  f('1ZSllQ3HqA3V_xsYzIdej48T4uk8NwSEh', 'fefo_frame_10.png', 'image/png'),
  f('1KrC5MPMlr-YKZhrz1B5g0nA6p1OnnxFj', 'fefo_frame_11.png', 'image/png'),
  f('1Jp8QKfJyeoC3paD1BuYICj4eVigkuOEB', 'fefo_frame_12.png', 'image/png'),
]
export const fefoVooEsquerda: DriveFile[] = [
  f('1OryYtSkVxtCvwhcD4QiWXN4uUeHfZ6du', 'fefo_frame_01.png', 'image/png'),
  f('1q7LRZIKrq89m5E2SRjRgbHPj1iBqBne1', 'fefo_frame_02.png', 'image/png'),
  f('1caOBniou8w59_g2g3YARC9d_f4Z9B4oU', 'fefo_frame_03.png', 'image/png'),
  f('1ZHxsCpmkmkgTC9_yH4YBEbVKceJhCAVT', 'fefo_frame_04.png', 'image/png'),
  f('1OazvNlfHKHeFeFcuqodrmHazZRkPt-oE', 'fefo_frame_05.png', 'image/png'),
  f('1qSl6_qp4zbOdpioiL1AVAW0u79EosXkv', 'fefo_frame_06.png', 'image/png'),
  f('1UmcL-uSpWwTgqP4hcv8M6ju_4EkCsw4E', 'fefo_frame_07.png', 'image/png'),
  f('1jMv4PC_LZ8AAPDsOKoY5kLdx2TmB0gfo', 'fefo_frame_08.png', 'image/png'),
  f('1VMaLaYJBhlIcespoKAbwIr7aHiiwFw9j', 'fefo_frame_09.png', 'image/png'),
  f('1QBbWh9nMarzdgGBLps_NHSlnSQDRNReJ', 'fefo_frame_10.png', 'image/png'),
  f('1TZdavVZgjwoOFXhxY72oIcM26AVTco-U', 'fefo_frame_11.png', 'image/png'),
  f('1RTOckEPcJntUcJCqTqKfbjTIEZfwzpIc', 'fefo_frame_12.png', 'image/png'),
]

/** Pasta: Intro geral da equipe (Quem Somos) */
export const quemSomos = {
  texto: f('1Fh8q1DRq2frLjDsmerRqgF_M0AWHHGMA', 'Quem somos.txt', 'text/plain'),
  fotos: [
    f('1eBbJgixvdnbR44Zm_4KrkZpVne9gUnlj', 'Cópia de F2_f1.jpeg'),
    f('1Br77HSFPSUQggQVD8hqEFgFuy1PUFwwQ', 'Cópia de F1_f3.jpg'),
    f('1b7IPA5ft6C3Akyi4xUn4bfFpFbA2Vk7y', 'Cópia de F2_f3.jpeg'),
    f('1l-3cSrOl8aGF_n5lEZd4mY9nzsZKkGz4', 'Cópia de F1_f4.jpg'),
    f('1jkkbdfrWJDM5XTtc9-lQoPsmy49sYgj4', 'Cópia de F2_f2.jpeg'),
    f('19AfMHytjwArsYv8ZxSgb9xn0hKACGEtL', 'Cópia de F2_f4.jpg'),
    f('1Q_XLCO-kmJIv8thRY97ghQvhs1tnthJQ', 'Cópia de F1_2.jpg'),
    f('1exS7Ph1GFDkReb_vpGwHpnRvFlmlnn8J', 'Cópia de F2_f5.jpg'),
    f('1P58hfnV2hoTYVafMPIf7tZ5aAyDhJLBT', 'Cópia de F2_f6.jpg'),
    f('1kxuXKUn9mj34VhPeoObGuuHiReM39cip', 'Cópia de F1_1.jpg'),
  ],
}

/** Pasta: FRC */
export const frc = {
  texto: f('1pOqp6wtzZHMTQ4HpbFFNgXfj1Gb4xcTF', 'O que é a FRC.txt', 'text/plain'),
  logo: f('1aPa1u7cEUr3BDrWDlT30jjH5Gi6ehGDV', 'FIRST_Robotics_Competition_(logo).svg', 'image/svg+xml'),
  imagens: {
    houston: f('10RpEUEzGGOH4nab665-89nCEev5oVusa', 'imgi_134_frcemhoustonfotoaertonguimarescni.jpg'),
    campo2026: f('16LJpCdc-nTAdyrzWvYAKGa3MI7mSYYj4', 'imgi_137_2026-playing-field-page.jpg'),
    ccbdo: f('1JXvySOmwdksA1ScluCyVg9EHRDQFFN3u', 'imgi_126_ccbdo.jpg'),
    fbbo: f('13E2g7HyQWDn4qmvCZzeRCBvYoMgsiRVT', 'imgi_128_fbbo.jpg'),
    ddfeo: f('1RgvkeMB4_zn37EUcMYOsb1SchOEH67s7', 'imgi_130_ddfeo.jpg'),
    maxres165: f('1KQqFMiH83FdUO7nqCIhxepsVBjT7UHyv', 'imgi_165_maxresdefault.jpg'),
    maxres200: f('1opadYtxfsUl9Y7CLs4ha7T6rtQPcGFZM', 'imgi_200_maxresdefault.jpg'),
    foto1: f('1ewPmvfcf7-dmffFP9WcLl0ydFr8T_-ZT', 'imgi_184_Foto-1.png', 'image/png'),
    kit: f('1dL3LS_hinvOFG7id6WrKvbhIZtzSp8Us', 'imgi_141_Kit-Iniciante-para-FRC-1.png', 'image/png'),
  },
  /** Extraído de "O que é a FRC.txt" → "Link vídeo" */
  videoYoutubeId: 'PKyUg_Dd9Qw',
}

/** Pasta: Equipe Rebuilt 2026 */
export const rebuilt = {
  texto: f('1jJgywIeFvicODUTdWzxGv9mnDIQqv6ZY', 'Nossa temporada REBUILT (2026).txt', 'text/plain'),
  moodboard: f('1CKSu-ad8hchZe7JGYHGbN3dK-ETo1ahs', 'Moodboard REBUILT 2026.pdf', 'application/pdf'),
  fotos: [
    f('1-o83v6E4-F-xaUK0-Ww6Dro80gRKFcqH', 'F2_f1.jpeg'),
    f('1wp6-d3ILHRU5XV0CG6wqsRfzBVyYEJCB', 'F2_f2.jpeg'),
    f('1o6hfaLLWea44IgOOGLS3az2loIR2Ehox', 'F2_f3.jpeg'),
    f('1En_RuYkwwMDNGPXoMWI4UO7o1TvXc_c_', 'F2_f4.jpg'),
    f('1oo8i9k60C1xN3npdAlh_Yil1edSwIG4w', 'F2_f5.jpg'),
    f('1znw1cQk5hBTPfHcy-xxOxc7JjcloTEYc', 'F2_f6.jpg'),
  ],
  cadStl: f('1ls3Yv6HPfsuSJxlwkwKWNzGvXQeBxGtu', 'Cópia de 3D_Phoenix_Cinza.stl', 'model/stl'),
  cadAssemblyZip: f('1hScBdScUTlrb_l5yTC46jc433dfFlxLc', 'Assembly final.zip', 'application/zip'),
}

/** Pasta: Equipe Reefscape 2025 */
export const reefscape = {
  texto: f('1GTNVd2pO8RkT6FL9rlzoHz3p71N69-xb', 'Nossa temporada REEFSCAPE (2025).txt', 'text/plain'),
  moodboards: f('1LOb0w-e7i_HHtZ2Sj_y6URslUReqYs9k', 'Moodboards FRC – REBUILT e REEFSCAPE.pdf', 'application/pdf'),
  fotos: [
    f('1uFfipQz9w4IAOy-uwsyw4nRaH347Dq_t', 'F1_f3.jpg'),
    f('1bvE6bw6NTEJXYDw23AI4T2OOvfxXO_4F', 'F1_f4.jpg'),
    f('1tRnfaDhN-197yby3zRrG9SNe_4F_XuAh', 'F1_2.jpg'),
    f('1JQfoJCOj2ajbzlYfNpq7Ckm7-qm5ynpz', 'F1_1.jpg'),
  ],
}

/** Pasta: Projetos_Sociais — cada subpasta traz o .txt e as imagens do projeto */
export const projetosImagens: Record<string, DriveFile[]> = {
  'force-voice': [f('1sQzKtHSUQb_m5iCglUd9cgqPkWuAFj-3', '623645708_17900795445367083_1293901212451480459_n.jpg')],
  'steam-girls': [
    f('1ZPiacHTeF2kZcXtPXNaQN0uc9_B3fCRr', 'imgi_15_653540293_17907446658367083_2382056163712575871_n.jpg'),
    f('1jQ7675amkkwmUkO5QeDHH9nol6SAJepH', 'imgi_27_621156702_17900077959367083_3078752728507338512_n.jpg'),
  ],
  'rocket-force': [f('1iAsN6nvdO7-dcksRun9CrThP5GH_0z0u', '610620300_17898434685367083_2055733492513703971_n.jpg')],
}

/** Textos dos projetos (Projetos_Sociais/<projeto>/<projeto>.txt) */
export const projetos = {
  forceVoice: f('1GMTnV53My7d3pKvEMS5D0duqLZ4JqFlm', 'Force Voice/Force Voice.txt', 'text/plain'),
  steamGirls: f('15YWZQ53x9lEQ7VgrSNKplRtXfMEazD9V', 'STEAM Girls/STEAM Girls.txt', 'text/plain'),
  rocketForce: f('1a6zBK3iNX7fYMmPq5S3w9u7jJfPDKJ1j', 'RocketForce/RocketFederal.txt', 'text/plain'),
}

/** Todos os arquivos de imagem — usado pelo script de sincronização. */
export const allImages: DriveFile[] = [
  hero.logo,
  hero.fefo,
  ...quemSomos.fotos,
  frc.logo,
  ...Object.values(frc.imagens),
  ...rebuilt.fotos,
  ...reefscape.fotos,
  ...Object.values(projetosImagens).flat(),
  ...fefoVooDireita,
  ...fefoVooEsquerda,
]
