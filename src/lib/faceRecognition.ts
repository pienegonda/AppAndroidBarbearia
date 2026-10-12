import * as tf from '@tensorflow/tfjs';
import * as faceapi from '@vladmandic/face-api';

/**
 * Face descriptors are biometric data. Keep them on-device in this demo and
 * never log them or send them to a server. Production use requires a reviewed
 * consent/retention policy and presentation-attack detection.
 */
// Prefer the matching model files published with @vladmandic/face-api. The
// local path is retained as a fallback for deployments that bundle model files.
const MODEL_URLS = [
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/',
  '/models',
];
const MODEL_SOURCE_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, source: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(`O carregamento excedeu ${Math.round(timeoutMs / 1000)} segundos em ${source}.`));
    }, timeoutMs);
    promise.then(
      value => { window.clearTimeout(timeoutId); resolve(value); },
      error => { window.clearTimeout(timeoutId); reject(error); },
    );
  });
}

let runtimePromise: Promise<void> | null = null;
let modelsPromise: Promise<void> | null = null;
let loadedModelUrl: string | null = null;

/** Initialize TensorFlow explicitly before loading/running any face model.
 * This prevents the "highest priority backend 'wasm' has not yet been
 * initialized" error when backend registration and model loading race.
 */
async function initializeTensorFlow(): Promise<void> {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      try {
        const selected = await tf.setBackend('webgl');
        if (!selected) throw new Error('Backend WebGL indisponível.');
      } catch {
        const selected = await tf.setBackend('cpu');
        if (!selected) {
          throw new Error('Os backends WebGL e CPU não estão disponíveis.');
        }
      }

      await tf.ready();

      if (!tf.getBackend()) {
        throw new Error('O TensorFlow não inicializou um backend.');
      }
    })().catch(error => {
      runtimePromise = null;
      throw new Error(
        `Não foi possível inicializar o mecanismo de IA do navegador. Atualize o navegador e tente novamente. ${
          error instanceof Error ? error.message : ''
        }`
      );
    });
  }

  return runtimePromise;
}

async function loadFrom(url: string): Promise<void> {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(url),
    faceapi.nets.faceLandmark68Net.loadFromUri(url),
    faceapi.nets.faceRecognitionNet.loadFromUri(url),
  ]);
}

export function ensureFaceModels(): Promise<void> {
  if (modelsPromise) return modelsPromise;
  modelsPromise = (async () => {
    await initializeTensorFlow();
    let lastError: unknown;
    for (const url of MODEL_URLS) {
      try {
        await withTimeout(loadFrom(url), MODEL_SOURCE_TIMEOUT_MS, url);
        loadedModelUrl = url;
        return;
      } catch (error) {
        lastError = error;
      }
    }
    modelsPromise = null;
    throw new Error(`Não foi possível carregar os modelos faciais. Confira sua conexão com a internet. Se estiver offline, os arquivos dos modelos precisam estar disponíveis em public/models. ${lastError instanceof Error ? lastError.message : ''}`);
  })().catch(error => {
    modelsPromise = null;
    throw error;
  });
  return modelsPromise;
}

export function getLoadedFaceModelSource() {
  return loadedModelUrl;
}

export async function createFaceDescriptor(input: HTMLImageElement | HTMLVideoElement): Promise<number[]> {
  await ensureFaceModels();
  const result = await faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!result) throw new Error('Não foi possível detectar um rosto nítido. Posicione o rosto de frente, com boa iluminação, e tente novamente.');
  return Array.from(result.descriptor);
}

export function compareFaceDescriptors(a: number[], b: number[]): number {
  if (a.length !== 128 || b.length !== 128) return Number.POSITIVE_INFINITY;
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

/** Converts a data URL to a decoded image for descriptor extraction. */
export function imageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível abrir a foto capturada.'));
    image.src = dataUrl;
  });
}
