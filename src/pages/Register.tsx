import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";
import { Layout } from "../components/Layout";
import { SectionTitle } from "../components/SectionTitle";
import { db } from "../db/db";
import { useAppState } from "../context";
import { createFaceDescriptor, imageFromDataUrl } from "../lib/faceRecognition";

export function Register({ navigate }: { navigate: (p: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lgpd, setLgpd] = useState(false);
  const [faceConsent, setFaceConsent] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [saving, setSaving] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { setClient } = useAppState();

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraActive(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function startCamera() {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Este navegador não permite acessar a câmera. Use HTTPS ou localhost e tente novamente.");
      return;
    }
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } }, audio: false });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError("Não foi possível abrir a câmera. Confira a permissão do navegador ou faça o cadastro sem foto por enquanto.");
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError("A câmera ainda está iniciando. Aguarde um instante e tente novamente.");
      return;
    }
    const canvas = document.createElement("canvas");
    const maxSide = 640;
    const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCameraError("Não foi possível processar a foto neste navegador.");
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL("image/jpeg", 0.82));
    setCameraError("");
    stopCamera();
  }

  useEffect(() => () => { streamRef.current?.getTracks().forEach(track => track.stop()); }, []);

  async function save() {
    if (!name.trim() || !lgpd || saving) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      let faceDescriptor: number[] | undefined;
      if (photo && faceConsent) {
        setCameraError("Preparando o reconhecimento facial. Inicializando o mecanismo de IA e carregando os modelos necessários. Isso pode levar alguns segundos na primeira utilização.");
        const image = await imageFromDataUrl(photo);
        faceDescriptor = await createFaceDescriptor(image);
      }
      const client = {
        id: crypto.randomUUID(), name: name.trim(), phone: phone.trim() || undefined,
        visits: 0, points: 0, totalSaved: 0, pendingBenefit: null as null,
        isPlan: false, firstVisit: now,
        ...(photo && faceConsent ? {
          facePhotoDataUrl: photo,
          facePhotoConsentAt: now,
          faceBiometricConsentAt: now,
          faceDescriptor
        } : {})
      };
      await db.clients.add(client);
      setClient(client);
      sessionStorage.removeItem("arte-fios-services");
      navigate("/servicos");
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Não foi possível salvar o cadastro. Verifique o armazenamento disponível e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return <Layout navigate={navigate}>
    <div className="pt-8">
      <SectionTitle eyebrow="Novo cliente" title="Seu cadastro" sub="Preencha seus dados e, se desejar, registre uma foto para preparar futuras visitas." />
      <div className="space-y-4">
        <label className="block text-sm font-semibold">Nome *<input value={name} onChange={e => setName(e.target.value)} placeholder="Como podemos chamar você?" autoComplete="name" className="mt-2 w-full rounded-2xl border border-brand-dark/10 bg-brand-surface px-4 py-4 outline-none focus:border-brand-gold" /></label>
        <label className="block text-sm font-semibold">Telefone (opcional)<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(51) 99999-9999" autoComplete="tel" className="mt-2 w-full rounded-2xl border border-brand-dark/10 bg-brand-surface px-4 py-4 outline-none focus:border-brand-gold" /></label>

        <section className="rounded-2xl border border-brand-dark/10 p-4">
          <div className="flex items-start gap-3"><Camera className="mt-1 shrink-0 text-brand-gold"/><div><h3 className="font-semibold">Foto para futuras visitas</h3><p className="mt-1 text-sm opacity-65">Tire uma foto nítida, de frente e com o rosto bem iluminado. Com seu consentimento, o sistema calculará uma representação biométrica para comparar nas próximas visitas; os dados ficam neste dispositivo.</p></div></div>
          {photo ? <div className="mt-4"><img src={photo} alt="Foto de cadastro do cliente" className="mx-auto max-h-64 rounded-2xl object-cover"/><div className="mt-3 flex gap-2"><button type="button" onClick={() => { setPhoto(null); void startCamera(); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-dark/15 py-3 text-sm font-semibold"><RotateCcw size={17}/> Tirar novamente</button><button type="button" onClick={() => setPhoto(null)} className="rounded-xl border border-brand-dark/15 px-4 py-3 text-sm">Remover</button></div></div> : <><div className="relative mt-4 overflow-hidden rounded-2xl bg-black/90"><video ref={videoRef} autoPlay playsInline muted className="max-h-72 min-h-40 w-full object-cover"/><div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="h-44 w-36 rounded-[50%] border-2 border-dashed border-white/80"/></div></div><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => void startCamera()} className="flex items-center justify-center gap-2 rounded-xl border border-brand-dark/15 py-3 text-sm font-semibold"><Camera size={17}/> Abrir câmera</button><button type="button" onClick={capturePhoto} disabled={!cameraActive} className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-40"><CheckCircle2 size={17}/> Tirar foto</button></div></>}
          {cameraError && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{cameraError}</p>}
          <label className="mt-4 flex gap-3 rounded-xl bg-brand-surface p-3 text-sm"><input type="checkbox" checked={faceConsent} onChange={e => setFaceConsent(e.target.checked)} className="mt-1 accent-[#C5A059]"/><span>Autorizo expressamente o processamento do meu rosto para reconhecimento facial e o armazenamento local da foto e da representação biométrica, apenas para identificação em futuras visitas. Posso optar pela identificação manual.</span></label>
          <p className="mt-2 flex gap-2 text-xs opacity-60"><ShieldCheck size={15} className="shrink-0"/> A foto e o descritor biométrico só são salvos com consentimento. Se a detecção falhar, o cadastro não será concluído com reconhecimento facial; tente outra foto ou desmarque o consentimento para seguir sem biometria.</p>
        </section>

        <label className="flex gap-3 rounded-2xl bg-brand-surface p-4 text-sm"><input type="checkbox" checked={lgpd} onChange={e => setLgpd(e.target.checked)} className="mt-1 accent-[#C5A059]"/><span>Aceito o tratamento dos meus dados para gestão do atendimento e fidelidade, conforme a LGPD.</span></label>
        <button disabled={!name.trim() || !lgpd || saving} onClick={() => void save()} className="w-full rounded-2xl bg-brand-dark py-4 font-bold text-white disabled:opacity-30">{saving ? "Salvando cadastro..." : "Salvar e escolher serviço"}</button>
        <button type="button" onClick={() => { stopCamera(); navigate("/identificacao"); }} className="w-full rounded-2xl border border-brand-dark/15 py-3">Cancelar</button>
      </div>
    </div>
  </Layout>;
}
