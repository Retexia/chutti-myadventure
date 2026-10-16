import { driveImage } from "@/lib/drive";

export interface MemoryPhoto {
  id: string;
  src: string;
  caption: string;
  tag: string;
  /** Chapter that must be finished before this photo is revealed in the vault (0 = always visible). */
  unlockAfter: number;
}

/**
 * Photos load straight from the public Google Drive folder as small resized images —
 * nothing is downloaded into the repo. Folder must stay "Anyone with the link → Viewer":
 * https://drive.google.com/drive/folders/1YF8_6ULUcxEM2T47EUwC1MJUqe58ceTd
 * To add a photo: add a row [Drive link or file ID, caption] at the END of this list
 * (puzzles refer to photos by their index), or paste the link into the Memory Vault.
 */
export const DRIVE_PHOTOS: [string, string][] = [
  ["12kktSj6APiC1qnyLu2BBlg-nDOutnIoA", "9 June 2026 — Chutyymiii & Piccalito ❤️"], // 0: 20260609_140410.jpg
  ["1fhLtokH9iCc11S4a7VBuAav0hTZrq9MG", "10 June 2026 — Chutyymiii & Piccalito ❤️"], // 1: 20260610_152413.jpg
  ["1bT53hUaAXOvK9dcRmzoNoNUoPcVpRs0Y", "11 June 2026 — Chutyymiii & Piccalito ❤️"], // 2: 20260611_155857.jpg
  ["1LDKhKS0RVwHcYfuHqAcInDEppZog9Mes", "11 June 2026 — Chutyymiii & Piccalito ❤️"], // 3: 20260611_165155.jpg
  ["17eUb2ObS25OBlpW3vjLdjIaO7WWALvA3", "12 June 2026 — Chutyymiii & Piccalito ❤️"], // 4: 20260612_181527.jpg
  ["1QLpvaVQFaz7T3IdRxn1gaInVpmNyaiy_", "12 June 2026 — Chutyymiii & Piccalito ❤️"], // 5: 20260612_183521.jpg
  ["1BPn9MzZmO-duCaIVk6wjqArVDwMV8mu1", "4 July 2026 — Chutyymiii & Piccalito ❤️"], // 6: 20260704_212529.jpg
  ["1rFtFzQb15GtMdQv7VuuaavHJs1v116N5", "4 July 2026 — Chutyymiii & Piccalito ❤️"], // 7: 20260704_213439.jpg
  ["1R68SE5Tai6XpSHl3vW5mfRbusjRh4uQi", "5 July 2026 — Chutyymiii & Piccalito ❤️"], // 8: 20260705_135458.jpg
  ["1JeguC_QItJ9SDuE8wLW_zcjlFuUMqhhD", "16 July 2026 — Chutyymiii & Piccalito ❤️"], // 9: 20260716_110740.jpg
  ["1mmtdYALvTJeVY_H3qh6x7iq8TLS3lmfn", "16 July 2026 — Chutyymiii & Piccalito ❤️"], // 10: 20260716_110749.jpg
  ["1iGUmG1CoFIaOECWe58Px9cF1uXEga-HY", "19 July 2026 — Chutyymiii & Piccalito ❤️"], // 11: 20260719_144534.jpg
  ["1AnN-BhDgvef2HiyiSaDqHdVE0ol_G17Z", "21 July 2026 — Chutyymiii & Piccalito ❤️"], // 12: 20260721_135018.jpg
  ["16zqucafWguyC16hkyheRl6emFuCY12b_", "21 July 2026 — Chutyymiii & Piccalito ❤️"], // 13: 20260721_135020.jpg
  ["1JDPbKatihbRnatOOjcpP3QeJWGoID3sb", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 14: 20260726_090551.jpg
  ["1JMP5kd4pgYp3zVzdeJKLU_L-KAs9xejS", "3 August 2026 — Chutyymiii & Piccalito ❤️"], // 15: 20260803_101629.jpg
  ["1vZeCOZMlvj991te9FIZ38mNlrHRz9kdw", "19 August 2026 — Chutyymiii & Piccalito ❤️"], // 16: 20260819_074949.jpg
  ["1ug9E7cdZJMfzCFyhqeljMmoGGMX2OsF9", "19 August 2026 — Chutyymiii & Piccalito ❤️"], // 17: 20260819_110757.jpg
  ["1SDZgmSBGqPz4K1WXwpJA0F9wTkDXZQZY", "20 August 2026 — Chutyymiii & Piccalito ❤️"], // 18: 20260820_084811.jpg
  ["1fhJc3S1cIMGGRvsLrH4K8MPemz007EWV", "20 August 2026 — Chutyymiii & Piccalito ❤️"], // 19: 20260820_084814.jpg
  ["1DZ7DSLwDDtO7tNI1ywv-zkBwZM5ujFyO", "2 September 2026 — Chutyymiii & Piccalito ❤️"], // 20: 20260902_104726.jpg
  ["1N0iakf3tmdIve6rAwoMBzo4vxJdLQefb", "Piccalito with red roses — the flowers were always for you 🌹"], // 21: C5E9FA2C-351F-4901-BEC6-F53D2A4452D5.JPG
  ["1vv-fGk2yIj5nYe2vWtgvNdV0KLEj1KSy", "Chutyymiii & Piccalito Memory ❤️"], // 22: E1A8DF49-F24D-4BA5-9C9B-CEEF380E7824.JPG
  ["1LcoefE1nuaEW83OwIDG_YlpL_AqCNSDi", "Pizza date 🍕"], // 23: image209.jpg
  ["1r35bVcnwDZ205SRdguD33u4v7cpyZuOp", "Pizza date 🍕"], // 24: image211.jpg
  ["15Fn8yS1DHHMc4fBRvsWHAO4hxBhYjJqB", "Pizza date 🍕"], // 25: image212.jpg
  ["1NqwHIevwnC9e7VB6GcWto9Y5Pd93GsjZ", "Chutyymiii & Piccalito Memory ❤️"], // 26: image220.jpg
  ["1korsQPTICM9RRzZegFLi4g82ePPv8ges", "Chutyymiii & Piccalito Memory ❤️"], // 27: image221.jpg
  ["1Zg2OVbJ_KHmitjb12XbJ4KN-ZodbXDOp", "Chutyymiii & Piccalito Memory ❤️"], // 28: image225.jpg
  ["1agSbX-vlB-hTE5NPBX8Po31P0H8frvs_", "2 June 2026 — Chutyymiii & Piccalito ❤️"], // 29: IMG-20260602-WA0043.jpg
  ["1IuCQO4rV0SpzlpyliWTa72LIr-7OA9sO", "4 June 2026 — Chutyymiii & Piccalito ❤️"], // 30: IMG-20260604-WA0002.jpg
  ["18gaoCZJI0vqYHE6w8wqIh4U61CE2c3c2", "4 June 2026 — Chutyymiii & Piccalito ❤️"], // 31: IMG-20260604-WA0003.jpg
  ["18LIHixGRE8z59VuhQPIuodkhlqYVVFmj", "Dehiwala Zoo — where the first-date ride ended up 🦒"], // 32: IMG-20260605-WA0023.jpg
  ["14tZmgq7kcVOrUN0QWFnjk2h2V6xw90XP", "10 June 2026 — Chutyymiii & Piccalito ❤️"], // 33: IMG-20260610-WA0002.jpg
  ["1d_GN0wdqeI42gHoPG17Dv3CXfeqgh9QX", "10 June 2026 — Chutyymiii & Piccalito ❤️"], // 34: IMG-20260610-WA0005.jpg
  ["1cYvfse9SCDjeQVdA_nKuEBDSzGrFw1-v", "26 June 2026 — Chutyymiii & Piccalito ❤️"], // 35: IMG-20260626-WA0067.jpg
  ["1YU_GuBcrofjSIcgZv6ETmuIkWqVcqlpp", "5 July 2026 — Chutyymiii & Piccalito ❤️"], // 36: IMG-20260705-WA0029.jpg
  ["1J8Kbxbb4UgkhBrgrWGRqOe3A4NPHOfWl", "Kitten intelligence report 🐱"], // 37: IMG-20260706-WA0041.jpg
  ["1AAtYZa9-uEhvSAULUAtIFWIAv-UXPj7b", "Kitten intelligence report 🐱"], // 38: IMG-20260708-WA0014.jpg
  ["1S43fFMTlXLl2N6WSlehHmSnDLtc1slm5", "16 July 2026 — Chutyymiii & Piccalito ❤️"], // 39: IMG-20260716-WA0024.jpg
  ["1HgVa9Eg-9y1ShtfdcLT5OXns45p82NRO", "16 July 2026 — Chutyymiii & Piccalito ❤️"], // 40: IMG-20260716-WA0029.jpg
  ["1nnix8_ydNQ_d3EHmPoiEeNRr30_QZjdJ", "Stairs and silliness 😂"], // 41: IMG-20260719-WA0010.jpg
  ["1zXfZRO4vAnbZM0L-eja5qilcVgolUXWp", "Kitten intelligence report 🐱"], // 42: IMG-20260724-WA0030.jpg
  ["1VxH_AtdlQgiw16ow4sk-WGwhMq8eZuMP", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 43: IMG-20260726-WA0004.jpeg
  ["1nunGYAMVG5p0EVPUeS2JBjUhurZl5lqW", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 44: IMG-20260726-WA0008.jpg
  ["1YFEowhvrny5EIDKyREnYHLxEfaX_SZYC", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 45: IMG-20260726-WA0013.jpg
  ["1kOy-GoyeLZLJgfeDqhPsJjwQYqDhr2Yf", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 46: IMG-20260726-WA0022.jpg
  ["12GwJl-1wsp0jIlzKISYbLOjd7rKRQRGc", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 47: IMG-20260726-WA0026.jpg
  ["1fLJEtlYi1F7Cv8gmvlBvBwM3PdviodXc", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 48: IMG-20260726-WA0027.jpg
  ["1788xSBsAe7ko86XkXFYlUI2ob-Rq6nWE", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 49: IMG-20260726-WA0032.jpg
  ["1-Lm7F34Ue5itvrTGAtpmVh8EawfSq2JI", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 50: IMG-20260726-WA0037.jpg
  ["1VR4l9OzeeSeH-GTOLroS8F_iHYa7WoQo", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 51: IMG-20260726-WA0040.jpg
  ["1okunK15gl4y6pn7P8pqeTL-rAm5JnNUR", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 52: IMG-20260726-WA0041.jpg
  ["1K-vmlWI_zXHdTg_YtUHYAERp8vneeyTI", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 53: IMG-20260726-WA0043.jpg
  ["187x0kp3rI79z1UPuqJl_n5JytVOGe_Je", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 54: IMG-20260726-WA0045.jpg
  ["1dUnYuJ0EbLDKweDprqlvy7YKbUqOE9uM", "Building systems, building dreams 💻"], // 55: IMG-20260727-WA0006.jpg
  ["11ohg-XE_PFRXiJ-tW3xJV5HY3DthLRYB", "28 July 2026 — Chutyymiii & Piccalito ❤️"], // 56: IMG-20260728-WA0028.jpg
  ["1up5J3nlgdc0CkzK29WcVCpMwXvFhailt", "28 July 2026 — Chutyymiii & Piccalito ❤️"], // 57: IMG-20260728-WA0034.jpg
  ["118pLefYszQxfC8c-kSkKM1gV0pE0MiLQ", "28 July 2026 — Chutyymiii & Piccalito ❤️"], // 58: IMG-20260728-WA0044.jpg
  ["1hcc6bMGmMl9qAuHbeO9uLrgrZ6Ks0NDj", "3 August 2026 — Chutyymiii & Piccalito ❤️"], // 59: IMG-20260803-WA0014.jpg
  ["1sFjVfmqMuuM_99ikZhzfdpPv8fgh1eh9", "Sleeping Beauty, caught in her natural habitat 😴"], // 60: IMG-20260804-WA0021.jpg
  ["1FN5fy8LqvQDfbwjfrTSXAeD9T9k1evhK", "5 August 2026 — Chutyymiii & Piccalito ❤️"], // 61: IMG-20260805-WA0034.jpg
  ["1FjzELhG2W4THQCiZU0nkyt1xDsIffp3U", "6 August 2026 — Chutyymiii & Piccalito ❤️"], // 62: IMG-20260806-WA0035.jpg
  ["1UrQEK50zPOcWJLgqmj5HZyuy2MBR5KlH", "8 August 2026 — Chutyymiii & Piccalito ❤️"], // 63: IMG-20260808-WA0019.jpg
  ["1p_sBgj1oovUvlar73VaHmMpG9aO0TOi-", "Colombo Public Library — studying (not really) 📚"], // 64: IMG-20260812-WA0009.jpeg
  ["1w4mwOWzO9Nv8mVu_9XkSvoGpWdl0fXzA", "A library kiss 📚💋"], // 65: IMG-20260812-WA0010.jpeg
  ["1Vk4CeKToPE6sQ14OoOgvBdDXuGHnmngp", "Library date 📚"], // 66: IMG-20260812-WA0011.jpg
  ["10rMjDz1ewscxGCMCbBC5SS1CduIY67J5", "13 August 2026 — Chutyymiii & Piccalito ❤️"], // 67: IMG-20260813-WA0003.jpg
  ["1cUPLtnjwHLzm1ZimcVcPM5d1duviBeoz", "Kitten intelligence report 🐱"], // 68: IMG-20260815-WA0001.jpg
  ["1qMH6TJsOKurwevyDC4-VkLI5K8A3Y2Tk", "16 August 2026 — Chutyymiii & Piccalito ❤️"], // 69: IMG-20260816-WA0003.jpg
  ["1ds4m_rzB8UZ3_hGAkkOwiPkuKPLi8TK6", "16 August 2026 — Chutyymiii & Piccalito ❤️"], // 70: IMG-20260816-WA0004.jpg
  ["1t4210Lr1A6o1SCZVC1uw4q9E8DFuaokM", "Sunset in red ❤️"], // 71: IMG-20260816-WA0006.jpg
  ["1a16u2unrF0OOj_FoNJfYksxbg4Brx612", "Our Journey scrapbook 📖"], // 72: IMG-20260816-WA0007.jpg
  ["1NLhPvSkegH3rlcxtkrj6noCaXy7HnzxA", "Kitten intelligence report 🐱"], // 73: IMG-20260822-WA0043.jpg
  ["1dbddqooOhPBB_tXnQVbPzrY9negTV1cX", "Chocolate dessert — we always find chocolate 🍫"], // 74: IMG-20260822-WA0052.jpg
  ["1PVRB6DM39FpzEZ6aJMXXH9KZNgeSCNRa", "22 August 2026 — Chutyymiii & Piccalito ❤️"], // 75: IMG-20260822-WA0062.jpg
  ["1six8AjBe0ar5Q9Z0XxNStZ52Q-2JIBUu", "25 August 2026 — Chutyymiii & Piccalito ❤️"], // 76: IMG-20260825-WA0021.jpeg
  ["1DBvI09NiKLyFNv_3jvbi5I6weAj2ngHa", "Kitten intelligence report 🐱"], // 77: IMG-20260830-WA0024.jpg
  ["1Ojcg6gzXHEa3vj4NS8g2MBI2CgseiA0b", "Retexia boardroom energy 💼"], // 78: IMG-20260831-WA0035.jpg
  ["1sQhQfwDzBXvjf5fU5VhGglSjx1QGRk-N", "Retexia boardroom energy 💼"], // 79: IMG-20260831-WA0039.jpg
  ["1vbBl4w1ZXs0tm3Tc5gt3qWMj4QuskIT5", "1 September 2026 — Chutyymiii & Piccalito ❤️"], // 80: IMG-20260901-WA0111.jpg
  ["1-GOiQifznjMunLaQet9aRz5m19bHfmRH", "Kitten asleep — learned from the best 😴🐱"], // 81: IMG-20260902-WA0000.jpg
  ["1L5pm_K6MoIwmldpOwLLVHQu2N4OQgpRF", "Chutyymiii & Piccalito Memory ❤️"], // 82: IMG_0597.jpg
  ["1PaqZB4eIHz5_Cqy9m5ilugG7FwF5FX8f", "Chutyymiii & Piccalito Memory ❤️"], // 83: IMG_1367.heic
  ["1ptqhIpltAc3eV-VhenhYVuuemSagAXl7", "Chutyymiii & Piccalito Memory ❤️"], // 84: IMG_1384.HEIC
  ["1KPIWvjN2kDTDhcA9z8EzjNX-0QX8rQmY", "Roses ready, nerves on max 🌹"], // 85: IMG_1444.HEIC
  ["16qs_SeuzoE88kqoILu3d4wxqsZvNBiXs", "Roses ready, nerves on max 🌹"], // 86: IMG_1445.HEIC
  ["1Vw4HUQcwRrep_EOIvqi5MB8PaVvRIN35", "Waiting for you with flowers 💐"], // 87: IMG_1450.HEIC
  ["1JcxJSrBQY3xJt2t5CP9cOTdFYt3TGoV0", "Flowers for my Chutyymiii 💐"], // 88: IMG_1454.heic
  ["1F_AGs4w_4Y0_cTNwubW7ytAx5Pjb7yl5", "#nickasnap at the mall 📸"], // 89: IMG_1473.HEIC
  ["1WZpFPv6Y7ImESgCsfCYzDnAeI94Dz0Bo", "#nickasnap at the mall 📸"], // 90: IMG_1474.HEIC
  ["1NkqfxSmx7cg0lGfDY0lUm514VzufjRfj", "#nickasnap — black & white edition 🖤"], // 91: IMG_1475.heic
  ["1JH7w8k_1fJJH-icNilffSdwi7a-c3Lhf", "13 July 2026 — the camcorder hug 📼"], // 92: InShot_20260713_072321295.jpg
  ["10dUd2geVDAYLxK8lfHAcrBKzfoI7SD9y", "25 June 2026 — Chutyymiii & Piccalito ❤️"], // 93: Screenshot_20260625_222518_Spotify.jpg
  ["1O5tTXPRzOBrtmazI7P-FLQLpKsJk-3Ba", "1 July 2026 — Chutyymiii & Piccalito ❤️"], // 94: Screenshot_20260701_223847_WhatsApp.jpg
  ["1mKqaHIw_FYOG3MluLjZSMhiVpb8mvHR2", "26 July 2026 — Chutyymiii & Piccalito ❤️"], // 95: Screenshot_20260726_234805_WhatsApp.jpg
  ["11rTDjG-Gl4MkbjiKmdJOkbUyz5DFEcA-", "1 September 2026 — Chutyymiii & Piccalito ❤️"], // 96: Screenshot_20260901_011006_WhatsApp.jpg
  ["1RXZN_zQZ9OdMgUfAwdFm4CIm684t5LFh", "Super shy mode activated 🙈"], // 97: Screenshot_20260902_002525_WhatsApp.jpg
];

export const drivePhoto = (index: number, width = 800) => driveImage(DRIVE_PHOTOS[index][0], width);

const PER_CHAPTER = Math.ceil(DRIVE_PHOTOS.length / 8);

export const INITIAL_MEMORIES: MemoryPhoto[] = DRIVE_PHOTOS.map(([link, caption], i) => ({
  id: "drive-" + i,
  src: driveImage(link, 600),
  caption,
  tag: "Classified memory #" + (i + 1),
  unlockAfter: Math.floor(i / PER_CHAPTER)
}));
