/** Original, intentionally compact offline vocabulary. Ñ is a distinct letter. */
export const normalizeWord = (text: string) =>
  text
    .trim()
    .toUpperCase()
    .replaceAll("Ñ", "~")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll("~", "Ñ");
export type Word = { word: string; syllables: string[]; category: string };
const groups: Record<string, string> = {
  Animales:
    "ga-to pe-rro ca-ba-llo ce-bra ra-na sa-po lo-bo zo-rro o-so ti-gre le-on mo-no go-ri-la co-ne-jo ra-ton pa-to gan-so cis-ne ga-lli-na ga-llo a-gui-la bu-ho lo-ro ca-na-rio pa-lo-ma tor-tu-ga ca-ra-col a-be-ja a-vis-pa mos-ca hor-mi-ga ma-ri-po-sa a-ra-ña es-cor-pion gri-llo pez ti-bu-ron ba-lle-na del-fin pul-po can-gre-jo fo-ca nu-tria va-ca to-ro o-ve-ja ca-bra cer-do ca-me-llo ce-bu ja-ba-li lie-bre pan-te-ra ja-guar pu-ma ko-a-la",
  Naturaleza:
    "a-gua ai-re tie-rra fue-go ro-ca pie-dra a-re-na pla-ya mar la-go ri-o o-ce-a-no bos-que sel-va cam-po flor ho-ja ra-ma ra-iz ar-bol pi-no ro-ble sau-ce pal-ma ro-sa li-rio a-ma-po-la tu-li-pan nu-be nie-ve llu-via gra-ni-zo vien-to sol lu-na es-tre-lla co-me-ta pla-ne-ta cie-lo mon-te sie-rra va-lle is-la vol-can pra-do ba-rro hie-lo o-la al-ba o-ca-so ca-mi-no",
  Objetos:
    "me-sa si-lla ca-ma so-fa ar-ma-rio puer-ta ven-ta-na te-ja-do pa-red sue-lo te-cho la-piz pa-pel li-bro cua-der-no go-ma ti-je-ras re-gla pin-cel tin-ta bo-li-gra-fo ca-ja cu-bo bo-te va-so ta-za pla-to cu-cha-ra te-ne-dor cu-chi-llo re-loj ra-dio te-le-fo-no ca-ma-ra pan-ta-lla te-cla-do ra-ton mo-chi-la bol-sa ma-le-ta za-pa-to bo-ta ca-mi-sa fal-da ves-ti-do a-bri-go som-bre-ro cin-tu-ron cor-ba-ta guan-te a-ni-llo jo-ya co-llar mo-ne-da bi-lle-te lla-ve can-da-do puen-te bar-co co-che tren a-vion bi-ci-cle-ta ca-rro ca-no-a ve-la re-mo rue-da es-pa-da da-do ta-ble-ro fi-cha car-ta pe-on rei-na rey to-rre al-fil",
  Alimentos:
    "pan sal a-zu-car le-che que-so yo-gur man-te-qui-lla hue-vo a-rroz pas-ta tri-go ma-iz a-ve-na ha-ri-na pa-ta-ta to-ma-te le-chu-ga za-na-ho-ria ce-bo-lla a-jo pe-pi-no pi-mien-to ca-la-ba-za se-ta ju-dia len-te-ja gar-ban-zo man-za-na pe-ra u-va me-lon san-di-a na-ran-ja li-mon fre-sa ce-re-za pla-ta-no pi-ña co-co hi-go me-lo-co-ton nuez al-men-dra a-cei-tu-na ca-fe te ca-ca-o cho-co-la-te miel so-pa en-sa-la-da tor-ti-lla pi-zza pa-e-lla a-cei-te vi-na-gre na-ta ta-pa",
  Ideas:
    "a-mor paz cal-ma mie-do sue-ño ri-sa son-ri-sa jue-go lo-gi-ca es-tra-te-gia me-mo-ria mu-si-ca ar-te bai-le can-to cuen-to po-e-ma his-to-ria i-de-a pa-la-bra fra-se le-tra nu-me-ro cla-ve pis-ta a-mi-go a-mi-ga fa-mi-lia her-ma-no her-ma-na ma-dre pa-dre hi-jo hi-ja a-bue-lo a-bue-la ni-ño ni-ña per-so-na gen-te a-lum-no ma-es-tro me-di-co pin-tor can-tan-te bio-lo-go ju-ga-dor sa-ber co-no-cer le-er es-cri-bir ju-gar can-tar bai-lar so-ñar pen-sar sa-lir en-trar co-rrer na-dar vo-lar ca-mi-nar mi-rar to-car u-nir con-tar ar-mar pa-rar ga-nar per-der dar de-do ro-jo a-zul ver-de ne-gro blan-co gris do-ra-do co-ral vio-le-ta na-riz ri-zar zar-pa pa-to to-ma-te te-la la-na na-ve ve-la la-go go-ma ma-no no-ta ta-lon lon-ja ja-rra ra-ma",
};
export const vocabulary: Word[] = Object.entries(groups)
  .flatMap(([category, words]) =>
    words.split(" ").map((w) => ({
      word: normalizeWord(w.replaceAll("-", "")),
      syllables: w.toUpperCase().split("-"),
      category,
    })),
  )
  .filter(
    (w, i, a) =>
      /^[A-ZÑ]+$/.test(w.word) &&
      a.findIndex((x) => x.word === w.word) === i &&
      w.syllables.join("") === w.word,
  );
export const wordSet = new Set(vocabulary.map((w) => w.word));
export const fiveLetterWords = vocabulary
  .filter((w) => w.word.length === 5)
  .map((w) => w.word);
export const randomItem = <T>(items: readonly T[], random = Math.random): T =>
  items[Math.floor(random() * items.length)];
export const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
