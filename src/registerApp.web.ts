import { registerRootComponent } from 'expo';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

// Skia on web runs on CanvasKit (WASM), which must be loaded before any module that
// uses Skia is evaluated, so App is required only afterwards.
// `canvaskit.wasm` is copied into public/ by the postinstall script and resolved
// relative to the page URL (works under the GitHub Pages sub-path too).
LoadSkiaWeb({ locateFile: (file: string) => file }).then(() => {
  registerRootComponent(require('../App').default);
});
