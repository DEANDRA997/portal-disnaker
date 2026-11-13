"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Landmark,
  User,
  Lock,
  LogIn,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { loginUser } from "../actions";

const PARTICLES = Array.from({ length: 32 }, (_, index) => ({
  id: index,
  left: `${(index * 37.7) % 100}%`,
  duration: `${8 + ((index * 13) % 110) / 10}s`,
  delay: `${-((index * 19) % 180) / 10}s`,
  drift: `${((index * 29) % 150) - 75}px`,
}));

export default function LoginPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || isOpening) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await loginUser(username.trim(), password);

      if (res?.success === true) {
        setIsLoading(false);
        setIsOpening(true);
        window.setTimeout(() => {
          router.replace("/dashboard");
        }, 2700);
        return;
      }

      setErrorMsg(res?.message || "ID Petugas atau kata sandi tidak sesuai.");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Tidak dapat menghubungi server. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  };

  const enteringClass = isOpening ? "is-open is-entering" : "";

  return (
    <div className={`app warehouse-login ${enteringClass}`}>
      <div className="particle-layer" aria-hidden="true">
        {PARTICLES.map((particle) => (
          <i
            key={particle.id}
            className="particle"
            style={{
              left: particle.left,
              animationDuration: particle.duration,
              animationDelay: particle.delay,
              "--drift": particle.drift,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="vignette" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <img src="/portal-disnaker-logo.png" alt="Logo Portal Disnaker" />
          </div>
          <div className="brand-copy">
            <strong>PEMERINTAH KOTA</strong>
            <span>LAYANAN LOGISTIK TERPADU</span>
          </div>
        </div>
        <div className="top-meta">
          <span className="live-dot" />
          <span>Sistem akses aktif</span>
        </div>
      </header>
      <div className="top-divider" />

      <main className="main">
        <section className="intro">
          <div className="eyebrow">Satu mimpi · Satu pelayanan</div>
          <h1>
            Gerbang <span>Gudang</span>
          </h1>
          <p className="subtitle">
            Pusat penyimpanan dan distribusi logistik Pemerintah Kota
          </p>
        </section>

        <div className="entry-layout">
          <div className="stage-wrap">
            <div className="side-label left">Akses terbatas · Area logistik</div>
            <div className="side-label right">Authorized personnel only</div>

            <div className="stage" aria-label="Animasi pintu gudang logistik">
              <div className="ambient-halo" />
              <div className="building">
                <div className="roof-line" />
                <i className="corner-bolt" />
                <i className="corner-bolt right" />

                <div className="building-sign">
                  <img src="/portal-disnaker-logo.png" alt="" />
                  <div>
                    <strong>PORTAL DISNAKER</strong>
                    <small>PEMERINTAH SATU MIMPI</small>
                  </div>
                </div>

                <div className="facade-grid" />
                <div className="entrance-frame">
                  <div className="interior">
                    <div className="interior-ceiling" />
                    <div className="ceiling-beam" />
                    <i className="lamp l1" />
                    <i className="lamp l2" />
                    <i className="lamp l3" />
                    <div className="back-wall" />
                    <div className="warehouse-sign">PUSAT DISTRIBUSI LOGISTIK</div>
                    <div className="shelf left" />
                    <div className="shelf right" />
                    <div className="box-stack left">
                      <i className="crate c1" />
                      <i className="crate c2" />
                      <i className="crate c3" />
                    </div>
                    <div className="box-stack right">
                      <i className="crate c1" />
                      <i className="crate c2" />
                      <i className="crate c3" />
                    </div>
                    <div className="forklift">
                      <i className="roof" />
                      <i className="post" />
                      <i className="body" />
                      <i className="wheel w1" />
                      <i className="wheel w2" />
                      <i className="fork" />
                    </div>
                    <div className="floor" />
                    <div className="floor-glow" />
                    <div className="light-beam" />
                  </div>

                  <div className="door-leaf left">
                    <i className="door-rib" />
                    <i className="door-rib" />
                    <i className="door-rib" />
                    <i className="door-rib" />
                    <i className="door-rib" />
                    <div className="door-badge">
                      <img src="/portal-disnaker-logo.png" alt="" />
                    </div>
                    <div className="door-label">PORTAL DISNAKER</div>
                    <i className="door-handle" />
                    <div className="warning-stripe" />
                  </div>

                  <div className="door-leaf right">
                    <i className="door-rib" />
                    <i className="door-rib" />
                    <i className="door-rib" />
                    <i className="door-rib" />
                    <i className="door-rib" />
                    <div className="door-badge">
                      <img src="/portal-disnaker-logo.png" alt="" />
                    </div>
                    <div className="door-label">AKSES TERBATAS</div>
                    <i className="door-handle" />
                    <div className="warning-stripe" />
                  </div>

                  <i className="hinge h1" />
                  <i className="hinge h2" />
                  <div className="stage-caption">
                    {isOpening
                      ? "Otorisasi diterima · Membuka akses gudang"
                      : "Pintu tertutup · Menunggu otorisasi akses"}
                  </div>
                </div>
                <i className="floor-shadow" />
              </div>
            </div>
          </div>

          <section className="login-panel" aria-label="Form login Portal Disnaker">
            {!isOpening ? (
              <>
                <div className="login-panel-head">
                  <div className="login-icon">
                    <Landmark size={22} />
                  </div>
                  <div>
                    <h2>Portal Disnaker</h2>
                    <p>Otorisasi personel</p>
                  </div>
                </div>

                <div className="security-notice">
                  <ShieldAlert size={17} />
                  <p>
                    Sistem terbatas. Akses dimonitor ketat oleh Server Kota.
                    Gunakan akun petugas yang telah terdaftar.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                  <div className="field-group">
                    <label className="field-label" htmlFor="username">
                      ID Petugas
                    </label>
                    <div className="field-control">
                      <User aria-hidden="true" />
                      <input
                        id="username"
                        className="login-input"
                        type="text"
                        required
                        autoComplete="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="ID Petugas (cth: menteri)"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label" htmlFor="password">
                      Kata Sandi
                    </label>
                    <div className="field-control">
                      <Lock aria-hidden="true" />
                      <input
                        id="password"
                        className="login-input"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Masukkan kata sandi"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="login-error" role="alert">
                      <AlertCircle size={15} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || isOpening}
                    className="login-submit"
                  >
                    {isLoading ? (
                      <>
                        <span className="login-spinner" />
                        Memverifikasi akses...
                      </>
                    ) : (
                      <>
                        <LogIn size={17} />
                        Otorisasi Akses
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div className="login-panel-foot">
                  <span>
                    <i /> Server terhubung
                  </span>
                  <span>Secure access · v2.0</span>
                </div>
              </>
            ) : (
              <div className="access-progress" role="status" aria-live="polite">
                <div className="access-check">
                  <CheckCircle2 size={29} />
                </div>
                <h2>Otorisasi Berhasil</h2>
                <p>Identitas terverifikasi. Membuka gerbang menuju dashboard.</p>
                <div className="access-meter">
                  <span />
                </div>
                <div className="access-caption">Menyiapkan ruang kerja...</div>
              </div>
            )}

            {!isOpening && (
              <a
                className="login-support"
                href="https://discord.com/channels/@me/882646127541903361"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Hubungi administrator melalui Discord"
              >
                <span className="login-support-icon" aria-hidden="true">
                  <MessageCircle size={19} />
                </span>
                <span className="login-support-copy">
                  <strong>Butuh bantuan?</strong>
                  <small>Kesulitan masuk? Hubungi administrator melalui Discord.</small>
                </span>
                <span className="login-support-action">
                  Hubungi <ExternalLink size={14} />
                </span>
              </a>
            )}
          </section>
        </div>
      </main>

      <footer className="footer">
        <span>
          <strong>GUDANG LOGISTIK</strong> · SISTEM MANAJEMEN TERPADU
        </span>
        <span className="footer-right">
          <i className="footer-mark" /> Satu mimpi, satu pelayanan
        </span>
      </footer>
      <div className="scanline" aria-hidden="true" />

      <style jsx global>{`
:root{
    --deep:#062e2c; --deep2:#073f3b; --teal:#0c665d; --teal2:#0fa38d;
    --mint:#31d2b5; --gold:#ffb900; --gold2:#ffd34d; --ink:#061d1c;
    --white:#eafff9; --muted:#9bc7bd; --door-speed:1.65s;
  }
  *{box-sizing:border-box}

  .app{position:relative;min-height:100vh;isolation:isolate;overflow:hidden;background:
    radial-gradient(ellipse at 50% 38%,rgba(22,163,141,.23),transparent 48%),
    radial-gradient(ellipse at 50% 100%,rgba(255,185,0,.10),transparent 38%),
    linear-gradient(145deg,#062e2c 0%,#041f1e 52%,#031514 100%)}
  .app::before{content:"";position:absolute;inset:0;z-index:-2;opacity:.24;background-image:linear-gradient(rgba(131,237,216,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(131,237,216,.08) 1px,transparent 1px);background-size:54px 54px;mask-image:linear-gradient(to bottom,black,transparent 80%)}
  .app::after{content:"";position:absolute;inset:-50%;z-index:-1;pointer-events:none;background:conic-gradient(from 120deg at 50% 45%,transparent 0 27%,rgba(28,218,186,.055) 29%,transparent 31% 63%,rgba(255,185,0,.035) 65%,transparent 68%);animation:slowTurn 42s linear infinite}
  @keyframes slowTurn{to{transform:rotate(360deg)}}
  .topbar{width:min(1440px,calc(100% - 64px));margin:auto;padding:26px 0 8px;display:flex;align-items:center;justify-content:space-between;gap:20px;position:relative;z-index:10}
  .brand{display:flex;align-items:center;gap:13px;min-width:0}
  .brand-mark{width:49px;height:49px;border-radius:15px;background:linear-gradient(145deg,rgba(18,163,141,.25),rgba(5,54,50,.8));border:1px solid rgba(72,229,199,.3);display:grid;place-items:center;box-shadow:0 7px 30px #001b19aa,inset 0 1px 0 #a3fff044;overflow:hidden}
  .brand-mark img{width:45px;height:45px;object-fit:contain;filter:drop-shadow(0 3px 5px #001a19aa)}
  .brand-copy{line-height:1.15}.brand-copy strong{display:block;letter-spacing:.13em;font-size:12px;font-weight:850}.brand-copy span{display:block;color:var(--muted);font-size:10px;letter-spacing:.16em;margin-top:5px}
  .top-meta{display:flex;align-items:center;gap:10px;color:#b2d8cf;font-size:11px;letter-spacing:.13em;text-transform:uppercase}
  .live-dot{width:7px;height:7px;border-radius:50%;background:#39e9a9;box-shadow:0 0 0 5px #39e9a91c,0 0 15px #39e9a9;animation:pulse 1.8s infinite}
  @keyframes pulse{50%{box-shadow:0 0 0 9px #39e9a900,0 0 22px #39e9a9}}
  .top-divider{height:1px;width:min(1440px,calc(100% - 64px));margin:18px auto 0;background:linear-gradient(90deg,transparent,#2b8b7e66 15%,#2b8b7e66 85%,transparent)}
  .main{width:min(1440px,calc(100% - 64px));margin:auto;position:relative;z-index:2;padding:37px 0 34px}
  .intro{text-align:center;margin:0 auto 23px;max-width:720px}
  .eyebrow{display:inline-flex;align-items:center;gap:10px;color:var(--gold2);font-weight:800;font-size:10px;letter-spacing:.32em;text-transform:uppercase}
  .eyebrow::before,.eyebrow::after{content:"";width:30px;height:1px;background:linear-gradient(90deg,transparent,var(--gold))}
  .eyebrow::after{transform:scaleX(-1)}
  h1{font-size:clamp(29px,4.6vw,58px);line-height:1.02;letter-spacing:-.045em;margin:13px 0 9px;font-weight:900;text-transform:uppercase;text-shadow:0 8px 34px #001a18}
  h1 span{color:var(--gold);text-shadow:0 0 35px #ffba0033}
  .subtitle{margin:0;color:#9dcac0;font-size:13px;letter-spacing:.04em}
  .stage-wrap{position:relative;max-width:1120px;margin:0 auto}
  .stage{position:relative;width:100%;aspect-ratio:16/8.2;min-height:360px;max-height:600px;perspective:1500px;isolation:isolate;filter:drop-shadow(0 35px 45px #0009)}
  .ambient-halo{position:absolute;left:13%;right:13%;top:17%;height:66%;border-radius:50%;background:radial-gradient(ellipse,rgba(22,212,178,.23),rgba(22,212,178,.04) 47%,transparent 72%);filter:blur(30px);transition:opacity 1s;opacity:.55}
  .building{position:absolute;inset:7% 3% 10%;background:linear-gradient(180deg,#126e63 0%,#0a534d 15%,#073e3a 100%);border:1px solid #4bd5ba55;border-radius:10px 10px 3px 3px;box-shadow:inset 0 2px 0 #c0fff222,0 18px 65px #001d1caa;overflow:visible}
  .building::before{content:"";position:absolute;inset:-13px -12px auto;height:22px;background:linear-gradient(180deg,#20a590,#0c6259);clip-path:polygon(1% 100%,5% 0,95% 0,99% 100%);border-bottom:2px solid #ffbd19;filter:drop-shadow(0 7px 4px #001c1a)}
  .roof-line{position:absolute;left:3%;right:3%;top:18px;height:2px;background:linear-gradient(90deg,transparent,#ffcf46aa,transparent)}
  .corner-bolt{position:absolute;width:7px;height:7px;border-radius:50%;background:#8ce6d3;box-shadow:0 0 0 3px #062e2c55;top:21px;left:18px;z-index:3}.corner-bolt.right{left:auto;right:18px}
  .building-sign{position:absolute;top:5%;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:10px;padding:7px 15px;border:1px solid #e3b43c55;border-radius:7px;background:linear-gradient(180deg,#0b4c47,#07332f);box-shadow:0 8px 20px #001a18aa;white-space:nowrap;z-index:4}
  .building-sign img{width:30px;height:30px;object-fit:contain}
  .building-sign strong{font-size:clamp(8px,1vw,12px);letter-spacing:.2em;color:#ffcc3f}
  .building-sign small{display:block;font-size:7px;letter-spacing:.19em;color:#a9d8cd;margin-top:3px}
  .facade-grid{position:absolute;inset:22% 2% 0;opacity:.2;pointer-events:none;background:repeating-linear-gradient(90deg,transparent 0 9.5%,#6bd7c3 9.6% 9.75%,transparent 9.85% 19.2%)}
  .entrance-frame{position:absolute;left:17%;right:17%;top:22%;bottom:0;background:#031c1a;border:9px solid #0a3431;border-bottom:0;box-shadow:0 0 0 2px #27a38f66,0 0 45px #001b1b,inset 0 0 0 2px #1aa18a66;overflow:hidden;transform-style:preserve-3d}
  .entrance-frame::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:8;border:1px solid #b4fff322;box-shadow:inset 0 0 35px #000b}
  .interior{position:absolute;inset:0;background:linear-gradient(180deg,#0a3733 0%,#0b5149 30%,#092e2b 100%);overflow:hidden;opacity:.25;transition:opacity 1.3s ease}
  .is-open .interior{opacity:1}
  .interior-ceiling{position:absolute;inset:0 0 auto;height:20%;background:linear-gradient(180deg,#0a2826,#0d4a43);clip-path:polygon(0 0,100% 0,88% 100%,12% 100%);border-bottom:1px solid #6ed8c466}
  .ceiling-beam{position:absolute;top:11%;left:13%;right:13%;height:3px;background:#1d8a7a;box-shadow:0 0 16px #3be5c8}
  .lamp{position:absolute;top:13%;width:7%;height:5px;border-radius:50%;background:#fff3c1;box-shadow:0 0 8px 3px #ffdb78,0 0 24px 8px #ffb90099;opacity:0;transition:opacity .8s}
  .is-open .lamp{opacity:1;transition-delay:.6s}
  .lamp.l1{left:20%}.lamp.l2{left:47%;width:8%}.lamp.l3{right:20%}
  .back-wall{position:absolute;inset:18% 10% 0;background:linear-gradient(90deg,#0d6258,#13776a 48%,#0a514a);clip-path:polygon(9% 0,91% 0,100% 100%,0 100%)}
  .back-wall::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 24%,#65d8c21a 24.2% 24.5%,transparent 24.7% 49%)}
  .warehouse-sign{position:absolute;z-index:2;top:25%;left:50%;transform:translateX(-50%);font-size:clamp(8px,1.1vw,13px);font-weight:900;letter-spacing:.24em;color:#ffce47;text-shadow:0 2px 8px #042c28;padding:6px 11px;border:1px solid #efbe3d66;background:#073f3bd9;white-space:nowrap}
  .shelf{position:absolute;z-index:3;top:39%;bottom:13%;width:22%;border:5px solid #b47b27;background:repeating-linear-gradient(180deg,transparent 0 31%,#b47b27 31.5% 34%,transparent 34.5% 64%);box-shadow:0 0 0 1px #2c1e0b,7px 9px 15px #001b19;transform:translateY(16px);opacity:0;transition:transform 1.1s cubic-bezier(.2,.8,.2,1),opacity .8s}
  .is-open .shelf{transform:translateY(0);opacity:1;transition-delay:.7s}
  .shelf.left{left:5%}.shelf.right{right:5%}
  .box-stack{position:absolute;z-index:4;bottom:13%;width:19%;height:29%;opacity:0;transform:translateY(20px);transition:all 1s ease .9s}
  .is-open .box-stack{opacity:1;transform:translateY(0)}
  .box-stack.left{left:28%}.box-stack.right{right:28%;width:15%;height:22%}
  .crate{position:absolute;bottom:0;width:48%;height:48%;background:linear-gradient(135deg,#d99b2b,#80501d);border:2px solid #f4c35a;box-shadow:inset 0 0 0 4px #6e471d55,5px 7px 12px #001a18}
  .crate::before{content:"";position:absolute;left:12%;right:12%;top:12%;height:2px;background:#ffe18d88;box-shadow:0 12px #6d401d66,0 24px #ffe18d55}
  .crate.c1{left:0;height:48%}.crate.c2{right:0;height:59%;background:linear-gradient(135deg,#c48122,#71441a)}.crate.c3{left:25%;bottom:50%;height:48%;width:50%;background:linear-gradient(135deg,#efb747,#99611e)}
  .right .crate{height:55%}.right .crate.c2{height:45%}.right .crate.c3{bottom:57%}
  .forklift{position:absolute;z-index:5;left:47%;bottom:12%;width:11%;height:34%;opacity:0;transform:translateY(24px);transition:all 1.2s ease 1s}
  .is-open .forklift{opacity:1;transform:translateY(0)}
  .forklift .body{position:absolute;bottom:12%;left:10%;width:70%;height:35%;border-radius:8px 15px 3px 3px;background:linear-gradient(140deg,#ffca37,#bd790b);border:2px solid #ffe08a;box-shadow:inset 0 -8px #6c420b55}
  .forklift .roof{position:absolute;left:20%;top:17%;width:58%;height:4px;background:#f8c64c;box-shadow:0 0 0 2px #815312}
  .forklift .post{position:absolute;top:18%;bottom:42%;width:5px;background:#f4bd3e;left:21%;box-shadow:33px 0 #f4bd3e}
  .forklift .wheel{position:absolute;bottom:0;width:22%;aspect-ratio:1;border-radius:50%;background:#102b28;border:4px solid #526c60;box-shadow:inset 0 0 0 3px #071a19}.forklift .wheel.w1{left:12%}.forklift .wheel.w2{right:7%}
  .forklift .fork{position:absolute;right:-45%;bottom:17%;width:52%;height:4px;background:#e1b94d;box-shadow:0 8px #d3a737}
  .floor{position:absolute;z-index:2;left:0;right:0;bottom:0;height:23%;background:linear-gradient(180deg,#1d7165,#092f2c);clip-path:polygon(0 10%,100% 10%,100% 100%,0 100%)}
  .floor::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 17%,#9cebd91b 17.1% 17.3%,transparent 17.4% 34%);transform:perspective(150px) rotateX(35deg);transform-origin:top}
  .floor-glow{position:absolute;z-index:3;left:30%;right:30%;bottom:-4%;height:35%;background:radial-gradient(ellipse,#ffc43c66,transparent 70%);filter:blur(9px);opacity:0;transition:opacity 1s .6s}
  .is-open .floor-glow{opacity:1}
  .light-beam{position:absolute;z-index:4;left:22%;right:22%;top:10%;height:90%;background:linear-gradient(180deg,#ffe39b35,transparent 80%);clip-path:polygon(43% 0,57% 0,100% 100%,0 100%);filter:blur(13px);opacity:0;transition:opacity 1.1s .45s;pointer-events:none}
  .is-open .light-beam{opacity:1}
  .door-leaf{position:absolute;z-index:6;top:0;bottom:0;width:50%;transform-style:preserve-3d;transition:transform var(--door-speed) cubic-bezier(.76,0,.2,1),filter var(--door-speed);backface-visibility:visible;will-change:transform;overflow:hidden;background:linear-gradient(135deg,#14786d 0%,#0a4b45 38%,#073833 100%);box-shadow:inset 0 0 0 2px #48c5ad55,inset 0 0 30px #001b19aa,0 12px 30px #001411aa}
  .door-leaf.left{left:0;transform-origin:left center;border-right:3px solid #e4b341}
  .door-leaf.right{right:0;transform-origin:right center;border-left:3px solid #e4b341}
  .is-open .door-leaf.left{transform:rotateY(-103deg);filter:brightness(.72)}
  .is-open .door-leaf.right{transform:rotateY(103deg);filter:brightness(.72)}
  .door-leaf::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0 8.8%,#8be1cf12 9%,#001f1c55 9.25%,transparent 9.6% 10%);border:1px solid #a7ffeb22}
  .door-leaf::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,#ffffff0a,transparent 35%,#001a1955 100%)}
  .door-rib{position:absolute;top:0;bottom:0;width:2px;background:linear-gradient(180deg,#6bd2bc55,#031b19aa,#6bd2bc33);opacity:.65}
  .left .door-rib:nth-child(1){left:14%}.left .door-rib:nth-child(2){left:30%}.left .door-rib:nth-child(3){left:46%}.left .door-rib:nth-child(4){left:62%}.left .door-rib:nth-child(5){left:78%}
  .right .door-rib:nth-child(1){right:14%}.right .door-rib:nth-child(2){right:30%}.right .door-rib:nth-child(3){right:46%}.right .door-rib:nth-child(4){right:62%}.right .door-rib:nth-child(5){right:78%}
  .door-badge{position:absolute;top:34%;width:90px;height:90px;left:50%;transform:translateX(-50%);border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#117669,#063a35 70%);border:2px solid #dca936;box-shadow:0 0 0 5px #062f2b,0 0 0 7px #e2b13d66,0 8px 25px #001b19aa;backface-visibility:hidden}
  .door-badge img{width:83px;height:83px;object-fit:contain;filter:drop-shadow(0 2px 4px #001b19aa)}
  .door-label{position:absolute;top:calc(34% + 108px);width:100%;left:0;text-align:center;font-size:9px;font-weight:900;letter-spacing:.22em;color:#eec34b;text-shadow:0 2px 5px #00201d}
  .door-handle{position:absolute;top:53%;width:6px;height:52px;border-radius:9px;background:linear-gradient(90deg,#644b1d,#ffd35c,#8a601b);box-shadow:0 0 0 2px #062e2c,0 4px 8px #001a18}
  .left .door-handle{right:8%}.right .door-handle{left:8%}
  .warning-stripe{position:absolute;bottom:0;left:0;right:0;height:13%;background:repeating-linear-gradient(135deg,#ffbd19 0 13px,#172b27 13px 26px);border-top:3px solid #ffcf47;opacity:.95}
  .hinge{position:absolute;z-index:7;top:7%;bottom:7%;width:8px;background:linear-gradient(90deg,#061e1c,#4a9988,#06201d);box-shadow:0 0 7px #001a19;pointer-events:none}.hinge.h1{left:0}.hinge.h2{right:0}
  .stage-caption{position:absolute;bottom:3%;left:50%;transform:translateX(-50%);font-size:9px;letter-spacing:.22em;color:#a5d3c8;text-transform:uppercase;white-space:nowrap;z-index:9;text-shadow:0 2px 6px #001a18}
  .side-label{position:absolute;top:45%;font-size:9px;letter-spacing:.25em;color:#8abdb1;writing-mode:vertical-rl;text-transform:uppercase;opacity:.65}.side-label.left{left:-1.5%;transform:rotate(180deg)}.side-label.right{right:-1.5%}
  .floor-shadow{position:absolute;bottom:3%;left:18%;right:18%;height:17%;background:radial-gradient(ellipse,#000b 0%,transparent 70%);filter:blur(12px);z-index:-1}
  .control-panel{max-width:840px;margin:20px auto 0;padding:15px 18px 14px;border:1px solid #36b39e55;border-radius:13px;background:linear-gradient(135deg,#0a4943cc,#062e2bd9);box-shadow:0 15px 40px #001b19aa,inset 0 1px #a5ffe51a;backdrop-filter:blur(12px)}
  .panel-top{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:13px}
  .panel-heading{font-size:10px;font-weight:900;letter-spacing:.2em;color:#c5e9df;text-transform:uppercase;display:flex;align-items:center;gap:9px}
  .panel-heading svg{width:15px;height:15px;color:var(--gold)}
  .status{display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#a9d2c8}
  .status-dot{width:7px;height:7px;border-radius:50%;background:#ffbd35;box-shadow:0 0 12px #ffbd35;transition:all .3s}
  .is-open ~ .nothing{display:none}
  .status.open .status-dot{background:#39e9a9;box-shadow:0 0 12px #39e9a9}
  .controls{display:flex;align-items:center;justify-content:center;gap:9px;flex-wrap:wrap}
  .btn{border:1px solid #4bbda8;color:#e6fff8;background:#0d665c;padding:11px 17px;border-radius:8px;font-weight:800;font-size:10px;letter-spacing:.13em;text-transform:uppercase;display:inline-flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;transition:transform .2s,background .2s,border-color .2s,box-shadow .2s;min-height:41px}
  .btn svg{width:15px;height:15px;flex:none}
  .btn:hover{transform:translateY(-2px);background:#117e70;border-color:#8df0d9;box-shadow:0 8px 20px #001d1a88}
  .btn:active{transform:translateY(0) scale(.98)}
  .btn.primary{color:#19332c;background:linear-gradient(135deg,#ffd54a,#f7a900);border-color:#ffe17c;box-shadow:0 5px 20px #ffb90030}
  .btn.primary:hover{background:linear-gradient(135deg,#ffe27a,#ffc329);box-shadow:0 9px 26px #ffb90048}
  .btn.ghost{background:#062f2b;border-color:#286e64;color:#b9ddd3}
  .btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
  .panel-bottom{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:13px;padding-top:12px;border-top:1px solid #4bb39d2c}
  .meter-wrap{display:flex;align-items:center;gap:10px;flex:1;min-width:130px}
  .meter-label{font-size:9px;color:#8ebdb2;letter-spacing:.15em;text-transform:uppercase;white-space:nowrap}
  .meter{height:4px;background:#173f39;border-radius:20px;overflow:hidden;flex:1;max-width:180px}
  .meter-fill{height:100%;width:0;background:linear-gradient(90deg,#0fa38d,#ffca31);border-radius:20px;transition:width .15s linear}
  .meter-value{font-size:10px;color:#ffcf46;font-variant-numeric:tabular-nums;min-width:30px}
  .settings{display:flex;align-items:center;gap:15px}
  .setting{display:flex;align-items:center;gap:7px;color:#9bc9be;font-size:9px;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
  .switch{position:relative;width:28px;height:15px;border-radius:20px;background:#28534b;border:1px solid #4c8c7e;cursor:pointer;transition:background .2s;padding:0}
  .switch::after{content:"";position:absolute;width:9px;height:9px;left:2px;top:2px;border-radius:50%;background:#b6d7ce;transition:transform .2s,background .2s}
  .switch[aria-checked="true"]{background:#0c9f87}.switch[aria-checked="true"]::after{transform:translateX(13px);background:#fff2be}
  .speed-control{display:flex;align-items:center;gap:7px;color:#9bc9be;font-size:9px;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
  input[type=range]{width:70px;accent-color:#ffc52c;cursor:pointer}
  .footer{width:min(1440px,calc(100% - 64px));margin:0 auto;padding:0 0 24px;display:flex;align-items:center;justify-content:space-between;color:#5e9c90;font-size:9px;letter-spacing:.16em;text-transform:uppercase;position:relative;z-index:3}
  .footer strong{color:#83baad;font-weight:800}
  .footer-right{display:flex;align-items:center;gap:10px}.footer-mark{width:4px;height:4px;border-radius:50%;background:var(--gold);box-shadow:0 0 8px var(--gold)}
  .scanline{position:absolute;inset:0;pointer-events:none;z-index:10;opacity:.12;background:repeating-linear-gradient(180deg,transparent 0 3px,#b4fff9 4px,transparent 5px);mix-blend-mode:soft-light}
  .particle-layer{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
  .particle{position:absolute;bottom:-20px;width:3px;height:3px;border-radius:50%;background:#70f4d6;box-shadow:0 0 9px 2px #28cdb0;opacity:0;animation:floatUp linear infinite}
  @keyframes floatUp{0%{transform:translate3d(0,0,0) scale(.4);opacity:0}12%{opacity:.75}85%{opacity:.35}100%{transform:translate3d(var(--drift),-105vh,0) scale(1.2);opacity:0}}
  .toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);opacity:0;pointer-events:none;z-index:30;padding:11px 17px;background:#052e2acb;border:1px solid #45c7ad66;border-radius:9px;color:#d9fff4;font-size:11px;letter-spacing:.04em;box-shadow:0 12px 35px #001b19aa;backdrop-filter:blur(12px);transition:all .35s}
  .toast.show{transform:translate(-50%,0);opacity:1}
  .vignette{position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 45%,#00110f9c 100%)}
  .reduced-motion *, .reduced-motion *::before,.reduced-motion *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
  @media(max-width:800px){.topbar,.top-divider,.main,.footer{width:calc(100% - 34px)}.topbar{padding-top:18px}.main{padding-top:30px}.stage{min-height:310px;aspect-ratio:1.36}.building{inset:8% 1% 10%}.entrance-frame{left:12%;right:12%;top:25%;border-width:6px}.building-sign{top:5%;padding:5px 9px}.building-sign img{width:23px;height:23px}.door-badge{width:64px;height:64px}.door-badge img{width:60px;height:60px}.door-label{top:calc(34% + 78px);font-size:7px}.door-handle{height:38px}.side-label{display:none}.control-panel{margin-top:12px;padding:13px}.panel-bottom{align-items:flex-start;flex-direction:column}.settings{width:100%;justify-content:space-between}.footer{font-size:8px}.subtitle{font-size:11px}}
  @media(max-width:520px){.brand-copy strong{font-size:10px}.brand-copy span{font-size:8px}.brand-mark{width:42px;height:42px}.brand-mark img{width:39px;height:39px}.top-meta{font-size:8px;letter-spacing:.08em}.intro{margin-bottom:5px}.stage{min-height:260px;aspect-ratio:1.2}.building{inset:10% 0 12%}.entrance-frame{left:8%;right:8%;top:28%;border-width:5px}.building-sign strong{font-size:7px}.door-badge{top:30%;width:50px;height:50px}.door-badge img{width:48px;height:48px}.door-label{top:calc(30% + 61px);font-size:6px}.door-handle{top:52%;height:30px}.warning-stripe{height:10%}.controls{display:grid;grid-template-columns:1fr 1fr}.btn{padding:10px 8px;font-size:8px}.btn.primary{grid-column:1/-1}.panel-heading{font-size:9px}.status{font-size:8px}.meter-wrap{width:100%}.settings{flex-wrap:wrap;gap:10px}.setting,.speed-control{font-size:8px}.footer{gap:12px;line-height:1.7}.footer-right{white-space:nowrap}}
  @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}}


/* ===== LOGIN V2: LOGIN PANEL + AUTHENTICATED WAREHOUSE ENTRY ===== */
.app.warehouse-login{min-height:100svh;padding-bottom:1px}
.warehouse-login .main{padding-top:26px;padding-bottom:24px}
.warehouse-login .intro{margin-bottom:26px}
.warehouse-login .entry-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,390px);gap:28px;align-items:center;max-width:1320px;margin:0 auto}
.warehouse-login .stage-wrap{max-width:none;min-width:0}
.warehouse-login .stage{aspect-ratio:16/8.2;min-height:350px;max-height:540px}
.warehouse-login .login-panel{position:relative;width:100%;padding:25px 24px 20px;border:1px solid #36b39e66;border-radius:18px;background:linear-gradient(145deg,rgba(10,73,67,.88),rgba(4,35,33,.94));box-shadow:0 22px 65px #001411aa,inset 0 1px #a5ffe526;backdrop-filter:blur(18px);overflow:hidden;transition:opacity .45s ease,transform .45s ease,border-color .3s}
.warehouse-login .login-panel::before{content:"";position:absolute;inset:0 0 auto;height:2px;background:linear-gradient(90deg,transparent,#31d2b5,#ffbd35,transparent);opacity:.85}
.warehouse-login .login-panel::after{content:"";position:absolute;width:180px;height:180px;right:-100px;top:-110px;border-radius:50%;background:#20d7b333;filter:blur(25px);pointer-events:none}
.warehouse-login .login-panel-head{position:relative;z-index:1;display:flex;align-items:center;gap:12px;margin-bottom:21px}
.warehouse-login .login-icon{width:43px;height:43px;display:grid;place-items:center;border-radius:13px;color:#ffd04d;background:linear-gradient(145deg,#146c60,#073a35);border:1px solid #d9b64c66;box-shadow:0 7px 20px #001d19aa}
.warehouse-login .login-panel-head h2{margin:0;color:#effff9;font-size:17px;font-weight:900;letter-spacing:.04em}
.warehouse-login .login-panel-head p{margin:4px 0 0;color:#8ebdb2;font-size:10px;letter-spacing:.13em;text-transform:uppercase}
.warehouse-login .security-notice{position:relative;z-index:1;display:flex;align-items:flex-start;gap:10px;margin-bottom:20px;padding:11px 12px;border:1px solid #d9a93835;border-radius:10px;background:linear-gradient(100deg,#ffbd3514,#ffbd3508);color:#e9c96e}
.warehouse-login .security-notice svg{flex:none;margin-top:1px}
.warehouse-login .security-notice p{margin:0;color:#cdbb86;font-size:10px;line-height:1.55}
.warehouse-login .login-form{position:relative;z-index:1;display:flex;flex-direction:column;gap:16px}
.warehouse-login .field-group{display:flex;flex-direction:column;gap:7px}
.warehouse-login .field-label{padding-left:2px;color:#a9d2c8;font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}
.warehouse-login .field-control{position:relative}
.warehouse-login .field-control>svg{position:absolute;left:14px;top:50%;width:17px;height:17px;transform:translateY(-50%);color:#6e9e92;pointer-events:none}
.warehouse-login .login-input{display:block;width:100%;height:48px;padding:0 14px 0 43px;border:1px solid #2d6e63;background:#041f1ddd;border-radius:10px;color:#eafff9;font-family:inherit;font-size:12px;font-weight:500;line-height:1.4;outline:none;transition:border-color .2s,box-shadow .2s,background .2s}
.warehouse-login .login-input::placeholder{color:#557e74}
.warehouse-login .login-input:focus{border-color:#31d2b5;background:#052923;box-shadow:0 0 0 3px #31d2b51c,0 0 22px #31d2b512}
.warehouse-login .login-input:disabled{opacity:.6;cursor:not-allowed}
.warehouse-login .login-error{display:flex;align-items:flex-start;gap:8px;padding:10px 11px;border:1px solid #fb718555;border-radius:9px;background:#7f1d1d33;color:#fecaca;font-size:10px;line-height:1.5}
.warehouse-login .login-submit{width:100%;min-height:48px;margin-top:2px;display:flex;align-items:center;justify-content:center;gap:10px;border:1px solid #ffe17c;border-radius:10px;background:linear-gradient(135deg,#ffd54a,#f7a900);color:#17362f;font-size:10px;font-weight:950;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;box-shadow:0 8px 25px #ffb90026;transition:transform .2s,box-shadow .2s,filter .2s}
.warehouse-login .login-submit:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.06);box-shadow:0 12px 30px #ffb90040}
.warehouse-login .login-submit:active:not(:disabled){transform:scale(.985)}
.warehouse-login .login-submit:disabled{opacity:.65;cursor:wait}
.warehouse-login .login-spinner{width:17px;height:17px;border:2px solid #24473d55;border-top-color:#24473d;border-radius:50%;animation:loginSpin .7s linear infinite}
@keyframes loginSpin{to{transform:rotate(360deg)}}
.warehouse-login .login-panel-foot{margin-top:17px;padding-top:13px;border-top:1px solid #4bb39d2b;display:flex;align-items:center;justify-content:space-between;gap:10px;color:#6e9e92;font-size:8px;letter-spacing:.12em;text-transform:uppercase}
.warehouse-login .login-panel-foot span{display:flex;align-items:center;gap:6px}
.warehouse-login .login-panel-foot i{width:6px;height:6px;border-radius:50%;background:#39e9a9;box-shadow:0 0 9px #39e9a9}
.warehouse-login .login-support{position:relative;z-index:1;display:flex;align-items:center;gap:11px;margin-top:17px;padding:13px 12px;border:1px solid rgba(88,111,247,.38);border-radius:12px;background:linear-gradient(110deg,rgba(88,101,242,.13),rgba(10,73,67,.24));color:#eafff9;text-decoration:none;transition:transform .2s ease,border-color .2s ease,background .2s ease,box-shadow .2s ease}
.warehouse-login .login-support:hover{transform:translateY(-2px);border-color:rgba(125,139,255,.75);background:linear-gradient(110deg,rgba(88,101,242,.2),rgba(10,73,67,.34));box-shadow:0 9px 24px rgba(0,12,30,.22)}
.warehouse-login .login-support:focus-visible{outline:2px solid #a5b4fc;outline-offset:3px}
.warehouse-login .login-support-icon{width:38px;height:38px;flex:none;display:grid;place-items:center;border:1px solid rgba(133,146,255,.4);border-radius:11px;background:rgba(88,101,242,.22);color:#aab4ff}
.warehouse-login .login-support-copy{display:flex;flex:1;min-width:0;flex-direction:column;gap:4px}
.warehouse-login .login-support-copy strong{color:#ecf0ff;font-size:11px;font-weight:850;letter-spacing:.03em}
.warehouse-login .login-support-copy small{color:#a5b5c5;font-size:9px;line-height:1.5}
.warehouse-login .login-support-action{display:inline-flex;align-items:center;gap:5px;flex:none;color:#c5ccff;font-size:9px;font-weight:850;letter-spacing:.04em}
.warehouse-login .access-progress{position:relative;z-index:1;padding:12px 0 4px;text-align:center;animation:progressAppear .4s ease both}
.warehouse-login .access-check{width:58px;height:58px;margin:0 auto 15px;display:grid;place-items:center;border-radius:50%;color:#ffdc70;border:1px solid #e3b43c99;background:#ffbd3515;box-shadow:0 0 0 7px #ffbd350d,0 0 32px #ffbd3525}
.warehouse-login .access-progress h2{margin:0;color:#f4fff9;font-size:17px;font-weight:900;letter-spacing:.05em}
.warehouse-login .access-progress p{margin:7px 0 20px;color:#9bc7bd;font-size:11px}
.warehouse-login .access-meter{height:5px;overflow:hidden;border-radius:20px;background:#173f39}
.warehouse-login .access-meter span{display:block;width:100%;height:100%;transform:scaleX(0);transform-origin:left;background:linear-gradient(90deg,#0fa38d,#ffca31);animation:accessFill 2.55s cubic-bezier(.2,.75,.25,1) forwards}
.warehouse-login .access-caption{margin-top:10px;color:#e7c65e;font-size:8px;letter-spacing:.16em;text-transform:uppercase}
@keyframes accessFill{to{transform:scaleX(1)}}
@keyframes progressAppear{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
.warehouse-login.is-entering .login-panel{animation:loginPanelExit .55s .75s ease forwards;pointer-events:none}
@keyframes loginPanelExit{to{opacity:0;transform:translateX(18px)}}
.warehouse-login.is-entering .topbar,.warehouse-login.is-entering .top-divider,.warehouse-login.is-entering .intro,.warehouse-login.is-entering .footer{opacity:0;transition:opacity .65s ease}
.warehouse-login.is-entering .stage-wrap{animation:cameraEnter 2.55s cubic-bezier(.72,0,.2,1) forwards}
@keyframes cameraEnter{0%{transform:scale(1);filter:brightness(1)}35%{transform:scale(1.04);filter:brightness(1.12)}72%{transform:scale(1.34) translateY(1vh);filter:brightness(1.3)}100%{transform:scale(1.85) translateY(2vh);opacity:0;filter:brightness(1.7)}}
.warehouse-login.is-entering::after{opacity:.15}
@media(max-width:1050px){.warehouse-login .entry-layout{grid-template-columns:minmax(0,1fr) minmax(300px,350px);gap:18px}.warehouse-login .stage{min-height:320px}}
@media(max-width:820px){.warehouse-login .entry-layout{grid-template-columns:1fr;gap:16px;max-width:760px}.warehouse-login .stage-wrap{max-width:760px;margin:auto;width:100%}.warehouse-login .stage{min-height:300px;max-height:420px}.warehouse-login .login-panel{max-width:520px;margin:0 auto}.warehouse-login .main{padding-top:24px}}
@media(max-width:520px){.warehouse-login .main{padding-top:20px}.warehouse-login .intro{margin-bottom:4px}.warehouse-login .stage{min-height:250px;aspect-ratio:1.22;max-height:none}.warehouse-login .login-panel{padding:21px 17px 17px;border-radius:15px}.warehouse-login .login-panel-head h2{font-size:15px}.warehouse-login .footer{padding-bottom:18px}.warehouse-login .login-panel-foot{font-size:7px}.warehouse-login .login-support{gap:9px;padding:11px 10px}.warehouse-login .login-support-icon{width:34px;height:34px}.warehouse-login .login-support-copy small{font-size:8px}.warehouse-login .login-support-action{font-size:8px}}
@media(prefers-reduced-motion:reduce){.warehouse-login.is-entering .stage-wrap{animation:none;opacity:0}.warehouse-login .access-meter span{animation-duration:.01ms}}
      `}</style>
    </div>
  );
}
