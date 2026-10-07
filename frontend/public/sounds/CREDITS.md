# Créditos dos sons ambientes

Todos os sons abaixo são CC0 ou domínio público, e nenhum exige atribuição. Os créditos ficam aqui por transparência e cortesia aos autores.

Processamento comum a todos (ffmpeg 8 / libmp3lame, via imagem Docker `linuxserver/ffmpeg`):

- **Loop sem emenda:** a cauda do áudio (últimos _c_ segundos) recebe um crossfade de potência constante (`acrossfade`, curvas `qsin`) sobre a cabeça e depois é cortada. Assim, o último sample emenda direto no primeiro.
- **Loudness:** cerca de −18 LUFS integrado (EBU R128). Quando o ganho necessário ultrapassava o true peak, foram aplicadas passadas de `volume` + `alimiter` (teto de −3,1 dBFS) e por fim um ajuste de ganho linear com teto de −1 dBTP. Nos sons em que isso não foi preciso, a normalização usou `loudnorm` em duas passadas no modo linear.
- **Formato:** MP3 CBR de 128 kbps, 44,1 kHz, com cabeçalho Xing/LAME (encoder delay e padding gravados, para reprodução gapless).

| Arquivo | Título original | Autor | Fonte | Licença |
|---|---|---|---|---|
| `pages.mp3` | Old book ("Leafing through pages, flicking pages, shutting book") | cori | https://commons.wikimedia.org/wiki/File:Old_book.ogg | Domínio público |
| `rain.mp3` | Rain (loopable) | Ylmir | https://opengameart.org/content/rain-loopable | CC0 1.0 |
| `clock.mp3` | Ticking Clock | bart | https://opengameart.org/content/ticking-clock | CC0 1.0 |
| `whispers.mp3` | Restaurant Ambience | stephan | https://commons.wikimedia.org/wiki/File:Restaurant_ambience.ogg | Domínio público |
| `fire.mp3` | Fireplace Sound Loop | PagDev | https://opengameart.org/content/fireplace-sound-loop | CC0 1.0 |
| `keys.mp3` | Keyboard Soundpack #1 [Typing and Single Keystrokes] | unicaegames | https://opengameart.org/content/keyboard-soundpack-1-typing-and-single-keystrokes | CC0 1.0 |

## Processamento por arquivo

- **pages.mp3** (mono, 64 s): usa o trecho de 15 s a 67 s do original. Ficaram de fora o folhear alto do início e o livro sendo fechado no fim. A esse trecho foi emendada uma segunda passagem (20 s a 35 s), com crossfade de 1,5 s. Filtros: `highpass` de 90 Hz, `afftdn` (redução de ruído), `acompressor` e `alimiter` para domar os estalos de página. Loop com crossfade de 1,5 s.
- **rain.mp3** (estéreo, 67,5 s): os takes 1 e 3 do pacote foram encadeados com crossfade de 2 s. Normalização com `loudnorm` em duas passadas, modo linear. Loop com crossfade de 2,5 s.
- **clock.mp3** (mono, 64 s): o loop original de 8 s ("8 ticks") foi repetido 8 vezes, sem crossfade, porque o original já é loopável e um crossfade duplicaria os tiques. Depois foi feito downmix para mono e aplicado o limitador.
- **whispers.mp3** (estéreo, 65,2 s): ambiente de restaurante transformado em murmúrio. Foram usados os trechos de 0,8–11,2 s, 12,0–64,2 s e 66,4–72,6 s, ficando de fora picos de voz e risadas mais altos e o final. Filtros: `highpass` de 120 Hz, dois `lowpass` em cascata de 1,1 kHz (cerca de 24 dB/oitava, para deixar a fala ininteligível e abafar a louça), EQ suave de +2 dB em 250 Hz e `acompressor`. Crossfades de 0,8 s entre os trechos, normalização com `loudnorm` em duas passadas no modo linear e loop com crossfade de 2 s.
- **fire.mp3** (estéreo, 81,8 s): o original (29,3 s) foi repetido 3 vezes, com crossfade de 2 s entre as repetições. Ganho com limitador. Loop com crossfade de 2 s.
- **keys.mp3** (mono, 61,3 s): os 10 takes de "Human Typing" (`human_vel-001` a `010`) foram concatenados em ordem embaralhada, com crossfades de 0,25 s. O silêncio final do take 004 foi cortado. Filtros: `highpass` de 60 Hz e limitador. Loop com crossfade de 0,4 s.
