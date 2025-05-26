export default function handler(req, res) {
  const baseUrl = "https://fonts-nu.vercel.app/fonts";

  const fonts = [
    "SourceSans3-Black.ttf",
    "SourceSans3-BlackItalic.ttf",
    "SourceSans3-Bold.ttf",
    "SourceSans3-BoldItalic.ttf",
    "SourceSans3-ExtraBold.ttf",
    "SourceSans3-ExtraBoldItalic.ttf",
    "SourceSans3-ExtraLight.ttf",
    "SourceSans3-ExtraLightItalic.ttf",
    "SourceSans3-Italic-VariableFont_wght.ttf",
    "SourceSans3-Italic.ttf",
    "SourceSans3-Light.ttf",
    "SourceSans3-LightItalic.ttf",
    "SourceSans3-Medium.ttf",
    "SourceSans3-MediumItalic.ttf",
    "SourceSans3-Regular.ttf",
    "SourceSans3-SemiBold.ttf",
    "SourceSans3-SemiBoldItalic.ttf",
    "SourceSans3-VariableFont_wght.ttf"
  ];

  const fontData = fonts.map(filename => ({
    name: filename.replace(".ttf", ""),
    url: `${baseUrl}/${filename}`
  }));

  res.status(200).json({ fonts: fontData });
}
