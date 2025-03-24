
const ja = {
  APP_TITLE: "モテ写カメラ",
  START_SHOOTING: "撮影を開始します",
  END_SHOOTING: "撮影を終了します",
  PICTURE_DID_TAKE: "モッテモテ写真が撮影できました",
  GUIDE_MSG_POSITION_GOOD: "ちょうど良いです😀",
  GUIDE_MSG_POSITION_TOO_UPPER: "もう少しシタですね",
  GUIDE_MSG_POSITION_TOO_LOWER: "もう少しウエですね",
  GUIDE_MSG_POSITION_TOO_RIGHT: "もう少し右ですね",
  GUIDE_MSG_POSITION_TOO_LEFT: "もう少し左ですね",
  GUIDE_MSG_SIZE_GOOD: "ちょうど良い顔の大きさです🙆",
  GUIDE_MSG_SIZE_TOO_SMALL: "顔が小さすぎます。もう少しカメラに近づきましょう",
  GUIDE_MSG_SIZE_TOO_BIG: "顔が大きすぎます。もう少しカメラから離れましょう",
  GUIDE_MSG_EXP_GOOD: "良い表情です👍",
  GUIDE_MSG_EXP_NEUTRAL: "表情がちょっとかたいです",
  GUIDE_MSG_EXP_OTHERS: "もっとリラックスしてください",
  GUIDE_MSG_AGE_LOOKALIKE: "%age歳くらいに見えますよ",
  PHOTO_COMPLETION_TITLE: "撮影写真",
};

export const useLocale = () => {
  const locale = "ja"; // or get the locale from somewhere else

  const localizedStrings = ja;
  const languageCode = 'ja-JP';

  return { locale, localizedStrings, languageCode };
}