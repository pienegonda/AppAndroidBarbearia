import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, ScanFace, ShieldCheck, Search, UserPlus, ScanSearch } from "lucide-react";
import { Layout } from "../components/Layout";
import { SectionTitle } from "../components/SectionTitle";
import { db } from "../db/db";
import { useAppState } from "../context";
import { compareFaceDescriptors, createFaceDescriptor, ensureFaceModels } from "../lib/faceRecognition";
import type { Client } from "../types";

// Conservative matching threshold. A close/ambiguous result always falls back to manual identification.
const MATCH_THRESHOLD = 0.48;
const MIN_MATCH_MARGIN = 0.04;

type CameraState = "idle" | "starting" | "ready" | "error";

export function Face({ navigate }: { navigate: (p: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const { setClient } = useAppState();

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState("idle");
  }

  async function startCamera() {
    setMessage("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("error");
      setMessage("Este navegador não disponibiliza acesso à câmera. Use a identificação manual.");
      return;
    }
    setCameraState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("ready");
      setMessage("Posicione apenas um rosto no centro, olhe para a câmera e toque em “Identificar meu rosto”.");
    } catch {
      setCameraState("error");
      setMessage("Não foi possível acessar a câmera. Verifique a permissão do navegador e se o site está em HTTPS ou localhost.");
    }
  }

  async function recognize() {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || busy) return;
    setBusy(true);
    setMessage("Carregando os modelos de reconhecimento. Se a conexão ou os arquivos não estiverem disponíveis, a tentativa será interrompida automaticamente e você poderá usar a identificação manual...");
    try {
      await ensureFaceModels();
      const descriptor = await createFaceDescriptor(video);
      const clients = await db.clients.toArray();
      const eligible = clients.filter((client): client is Client & { faceDescriptor: number[] } =>
        client.faceBiometricConsentAt !== undefined && Array.isArray(client.faceDescriptor) && client.faceDescriptor.length === 128
      );
      if (!eligible.length) {
        setMessage("Ainda não há clientes com reconhecimento facial configurado. Faça um cadastro com foto e consentimento ou use a busca manual.");
        return;
      }
      const ranked = eligible
        .map(client => ({ client, distance: compareFaceDescriptors(descriptor, client.faceDescriptor) }))
        .sort((a, b) => a.distance - b.distance);
      const best = ranked[0];
      const second = ranked[1];
      const ambiguous = second && (second.distance - best.distance) < MIN_MATCH_MARGIN;
      if (!best || best.distance > MATCH_THRESHOLD || ambiguous) {
        setMessage("Não foi possível confirmar sua identidade com segurança. Tente novamente com boa iluminação ou use a busca manual. Nenhum cadastro foi selecionado.");
        return;
      }
      setClient(best.client);
      sessionStorage.removeItem("arte-fios-services");
      stopCamera();
      setMessage(`Olá, ${best.client.name}! Seu cadastro foi localizado. Indo para a seleção de serviços...`);
      navigate("/servicos");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao realizar o reconhecimento. Tente novamente ou use a busca manual.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  return <Layout navigate={navigate} dark>
    <div className="pt-8">
      <SectionTitle eyebrow="Identificação" title="Reconhecimento facial" sub="Compare seu rosto com os cadastros que autorizaram o reconhecimento. Se não houver correspondência segura, você poderá se identificar manualmente." />
      <div className="overflow-hidden rounded-3xl border border-brand-gold/30 bg-white/5 p-4">
        <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-2xl bg-black/40">
          <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 h-full w-full object-cover ${cameraState === "ready" ? "" : "hidden"}`} />
          {cameraState !== "ready" && <div className="flex flex-col items-center px-6 py-10 text-center"><ScanFace size={64} className="text-brand-gold"/><p className="mt-3 text-sm opacity-60">Autorize o acesso à câmera para iniciar a identificação.</p></div>}
        </div>
        {message && <p role="status" aria-live="polite" className="mt-4 rounded-xl bg-white/5 p-3 text-sm">{message}</p>}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cameraState === "ready" ? <>
            <button disabled={busy} onClick={() => void recognize()} className="flex items-center justify-center gap-2 rounded-2xl bg-brand-gold py-3 font-bold text-brand-dark disabled:opacity-50"><ScanSearch size={18}/>{busy ? "Analisando rosto..." : "Identificar meu rosto"}</button>
            <button disabled={busy} onClick={stopCamera} className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 py-3 disabled:opacity-50"><CameraOff size={18}/> Desligar câmera</button>
          </> : <button disabled={cameraState === "starting"} onClick={() => void startCamera()} className="flex items-center justify-center gap-2 rounded-2xl bg-brand-gold py-3 font-bold text-brand-dark disabled:opacity-50"><Camera size={18}/>{cameraState === "starting" ? "Abrindo câmera..." : "Abrir câmera"}</button>}
          <button disabled={busy} onClick={() => { stopCamera(); navigate("/busca"); }} className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 py-3 disabled:opacity-50"><Search size={18}/> Buscar cliente</button>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm"><div className="flex gap-3"><ShieldCheck className="shrink-0 text-brand-gold"/><div><strong>Privacidade e transparência</strong><p className="mt-1 opacity-60">A comparação acontece no navegador usando descritores biométricos salvos neste dispositivo para clientes que deram consentimento. O aplicativo não envia esses descritores para um servidor. Esta versão não possui detecção de prova de vida; não deve ser usada como autenticação de alta segurança e requer avaliação de LGPD antes do uso comercial.</p></div></div></div>
      <button onClick={() => { stopCamera(); navigate("/cadastro"); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gold py-4 font-bold text-brand-dark"><UserPlus size={18}/> Sou novo por aqui</button>
      <button onClick={() => { stopCamera(); navigate("/identificacao"); }} className="mt-2 w-full rounded-2xl border border-white/15 py-3">Voltar</button>
    </div>
  </Layout>;
}
