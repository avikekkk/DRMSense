# DRMSense

DRMSense shows which DRM systems and media codecs your browser supports. Open it in any browser to see what that browser can play, how well it is protected, and how high the quality can go.

Everything runs in your browser. Nothing is sent anywhere.

## What it checks

### DRM

- **Google Widevine**, with its security level: L1 (hardware), L2 (partly hardware) or L3 (software)
- **Microsoft PlayReady**, including SL3000 hardware security
- **Apple FairPlay**, both the modern and the older version
- **Huawei WisePlay** and **W3C ClearKey**

For each one it also shows the encryption types it can unlock, the HDCP version your screen connection supports, offline license support, and which codecs play with that DRM, up to which size.

### Codecs

- **Video:** 49 formats in 10 families, including H.264, HEVC, VP9, AV1, Dolby Vision and VVC
- **Audio:** 41 formats in 12 families, including AAC, Dolby, DTS, Opus, FLAC and IAMF

For each video codec it shows the largest size that plays smoothly (from 480p up to 8K), hardware decoding, and HDR support. For each audio codec it shows which speaker setups work (stereo up to 7.1.4) and spatial audio support.

Both tabs have a **How to read** button that explains every label.

## How it works

DRMSense asks the browser questions using standard web APIs and shows the answers. It does not play any real video or audio, so the results are what the browser says it can do. Answers can differ between browsers, devices and settings.

- [Media Capabilities API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capabilities_API) for codecs, sizes and features
- [Encrypted Media Extensions](https://developer.mozilla.org/en-US/docs/Web/API/Encrypted_Media_Extensions_API) for DRM
- [Media Source Extensions](https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API) as a fallback in older browsers

## Run it locally

You need Node.js 18 or newer.

```bash
git clone https://github.com/avikekk/DRMSense.git
cd DRMSense
npm install
npm run dev
```

Other commands:

```bash
npm run build      # build for production
npm test           # run the tests
npm run lint       # check the code style
npm run typecheck  # check the types
```

## Built with

[React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/), [Remix Icon](https://remixicon.com/) through [react-icons](https://react-icons.github.io/react-icons/), and the [Inter](https://rsms.me/inter/) and [JetBrains Mono](https://www.jetbrains.com/lp/mono/) fonts.

## License

MIT
