import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../utils/api';
import ProfileBadges from '../components/ProfileBadges';
import { useAuth } from '../contexts/AuthContext';

const PHASES = { countdown: 30000, dissolve: 7000, black: 3000, chaos: 22000, thankYou: 7000, cut: 3000 };
const CEREMONY_START = Object.values(PHASES).reduce((sum, value) => sum + value, 0);
const CHAOS_START = PHASES.countdown + PHASES.dissolve + PHASES.black;
const END_AT = CEREMONY_START + 70000;
const RELEASE_AT = CEREMONY_START + 58000;
const phaseAt = (elapsed) => {
  const boundaries = [PHASES.countdown, PHASES.countdown + PHASES.dissolve, PHASES.countdown + PHASES.dissolve + PHASES.black, PHASES.countdown + PHASES.dissolve + PHASES.black + PHASES.chaos, PHASES.countdown + PHASES.dissolve + PHASES.black + PHASES.chaos + PHASES.thankYou, CEREMONY_START];
  if (elapsed < boundaries[0]) return 'countdown';
  if (elapsed < boundaries[1]) return 'dissolve';
  if (elapsed < boundaries[2]) return 'black';
  if (elapsed < boundaries[3]) return 'chaos';
  if (elapsed < boundaries[4]) return 'thankYou';
  if (elapsed < boundaries[5]) return 'cut';
  return elapsed < END_AT ? 'ceremony' : 'done';
};

const random = (min, max) => Math.round(min + Math.random() * (max - min));
const interfaceSelectors = ['.tavora-topbar', '.tavora-server-rail', '.tavora-navigation', '.tavora-chat', '.tavora-members-rail', '.tavora-music-panel', '.tavora-modal', '.tavora-mobile-bottom-nav'];
const fadeAudio = (audio, targetVolume, duration, onComplete) => {
  const startVolume = audio.volume;
  const startedAt = performance.now();
  const animate = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    audio.volume = startVolume + (targetVolume - startVolume) * easedProgress;
    if (progress < 1) window.requestAnimationFrame(animate); else onComplete?.();
  };
  window.requestAnimationFrame(animate);
};

const captureInterface = () => interfaceSelectors.flatMap((selector) => [...document.querySelectorAll(selector)]).filter((element, index, elements) => elements.indexOf(element) === index && !element.closest('.tavora25-event') && element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0).map((element, index) => {
  const bounds = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  const clone = element.cloneNode(true);
  clone.classList.add('tavora25-snapshot');
  Object.assign(clone.style, { position: 'fixed', width: `${bounds.width}px`, height: `${bounds.height}px`, left: `${bounds.left}px`, top: `${bounds.top}px` });
  clone.style.setProperty('--original-transform', computedStyle.transform);
  clone.style.setProperty('--original-opacity', computedStyle.opacity);
  clone.style.setProperty('--original-filter', computedStyle.filter);
  clone.style.setProperty('--snapshot-index', index);
  clone.style.setProperty('--chaos-x', `${random(-30, 30)}vw`);
  clone.style.setProperty('--chaos-y', `${random(-28, 28)}vh`);
  clone.style.setProperty('--chaos-rotate', `${random(-10, 10)}deg`);
  clone.style.setProperty('--chaos-scale', (random(82, 108) / 100).toFixed(2));
  clone.style.setProperty('--entry-x', `${random(-35, 35)}vw`);
  clone.style.setProperty('--entry-y', `${random(-35, 35)}vh`);
  element.style.visibility = 'hidden';
  return { element, clone, originalStyle: element.getAttribute('style') };
});

const restoreInterface = (snapshots) => snapshots.forEach(({ element, clone, originalStyle }) => {
  element.style.visibility = '';
  if (originalStyle == null) element.removeAttribute('style'); else element.setAttribute('style', originalStyle);
  clone.remove();
});

const revealInterface = (snapshots) => snapshots.forEach(({ element, originalStyle }) => {
  element.style.visibility = '';
  if (originalStyle == null) element.removeAttribute('style'); else element.setAttribute('style', originalStyle);
});

const removeSnapshots = (snapshots) => snapshots.forEach(({ clone }) => clone.remove());

function CeremonyMembers({ members, elapsed }) {
  const ceremonyElapsed = Math.max(0, elapsed - CEREMONY_START);
  const shown = Math.min(members.length, Math.floor(ceremonyElapsed / 850));
  const converging = ceremonyElapsed > 28000;
  return <div className={`tavora25-members ${converging ? 'is-converging' : ''}`}>
    {members.map((member, index) => <div key={member.id} className="tavora25-member" style={{ '--member-index': index, '--member-total': members.length }}>
      {index < shown ? <><span className="tavora25-member-name">{member.username}</span><ProfileBadges badges={['25-members']} compact /></> : null}
    </div>)}
  </div>;
}

export default function Tavora25Event() {
  const { user, getAuthHeaders } = useAuth();
  const [event, setEvent] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [hasRestoredInterface, setHasRestoredInterface] = useState(false);
  const audioRef = useRef(null);
  const snapshotsRef = useRef([]);
  const phase = event ? phaseAt(elapsed) : 'idle';
  const members = event?.members || [];

  useEffect(() => {
    const socket = io(API_URL, { transports: ['websocket'] });
    const start = (nextEvent) => { if (nextEvent?.startedAt) { setEvent(nextEvent); setElapsed(Math.max(0, Date.now() - new Date(nextEvent.startedAt).getTime())); } };
    const localStart = (customEvent) => start(customEvent.detail);
    const sync = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${API_URL}/api/event/state`, { headers: getAuthHeaders() });
        const result = await response.json();
        if (response.ok && result.event?.active) start(result.event);
      } catch (error) {
        console.warn('Unable to sync Tavora event:', error);
      }
    };
    socket.on('tavora:event:start', start);
    socket.on('connect', sync);
    window.addEventListener('tavora:event:start', localStart);
    sync();
    return () => { window.removeEventListener('tavora:event:start', localStart); socket.disconnect(); };
  }, [getAuthHeaders, user]);

  useEffect(() => {
    if (!event) return undefined;
    const timer = window.setInterval(() => setElapsed(Date.now() - new Date(event.startedAt).getTime()), 50);
    return () => window.clearInterval(timer);
  }, [event]);

  useEffect(() => {
    if (phase !== 'dissolve' || snapshotsRef.current.length) return undefined;
    const snapshots = captureInterface();
    snapshotsRef.current = snapshots;
    const stage = document.querySelector('.tavora25-snapshot-stage');
    snapshots.forEach(({ clone }) => stage?.appendChild(clone));
    return undefined;
  }, [phase]);

  useEffect(() => {
    if (phase !== 'ceremony' || !snapshotsRef.current.length) return undefined;
    let removeTimer;
    const currentElapsed = Date.now() - new Date(event.startedAt).getTime();
    const revealTimer = window.setTimeout(() => {
      revealInterface(snapshotsRef.current);
      removeTimer = window.setTimeout(() => {
        removeSnapshots(snapshotsRef.current);
        snapshotsRef.current = [];
        setHasRestoredInterface(true);
      }, 2300);
    }, Math.max(0, RELEASE_AT - currentElapsed));
    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(removeTimer);
    };
  }, [event, phase]);

  const audioSource = useMemo(() => phase === 'ceremony' ? '/music2.mp3' : ['chaos', 'thankYou'].includes(phase) ? '/musique1.mp3' : null, [phase]);
  useEffect(() => {
    const currentAudio = audioRef.current;
    if (!audioSource) {
      if (currentAudio) fadeAudio(currentAudio, 0, 700, () => currentAudio.pause());
      return undefined;
    }
    const sourceUrl = new URL(audioSource, window.location.origin).href;
    if (currentAudio?.src === sourceUrl) {
      fadeAudio(currentAudio, 0.82, 900);
      return undefined;
    }
    if (currentAudio) fadeAudio(currentAudio, 0, 650, () => currentAudio.pause());
    const nextAudio = new Audio(audioSource);
    nextAudio.preload = 'auto';
    nextAudio.volume = 0;
    audioRef.current = nextAudio;
    nextAudio.load();
    const startAudio = () => nextAudio.play().then(() => fadeAudio(nextAudio, 0.82, 1200)).catch(() => false);
    const retryOnGesture = () => { startAudio().then((started) => { if (started !== false) window.removeEventListener('pointerdown', retryOnGesture); }); };
    nextAudio.addEventListener('canplay', startAudio, { once: true });
    window.addEventListener('pointerdown', retryOnGesture);
    return () => {
      nextAudio.removeEventListener('canplay', startAudio);
      window.removeEventListener('pointerdown', retryOnGesture);
    };
  }, [audioSource]);

  useEffect(() => () => { audioRef.current?.pause(); restoreInterface(snapshotsRef.current); }, []);
  if (!event || phase === 'done' || phase === 'idle' || hasRestoredInterface) return null;
  const countdown = Math.max(0, 30 - Math.floor(elapsed / 1000));
  const ceremonyElapsed = elapsed - CEREMONY_START;
  const title = ceremonyElapsed < 30000 ? '' : ceremonyElapsed < 38000 ? '25 NAMES.' : ceremonyElapsed < 46000 ? '25 STORIES.' : ceremonyElapsed < 58000 ? 'ONE TAVORA.' : 'THANK YOU FOR BEING HERE.';
  const trackMood = ['chaos', 'thankYou'].includes(phase) ? 'hard' : phase === 'ceremony' ? 'cruise' : 'idle';
  const hardIntro = phase === 'chaos' && elapsed - CHAOS_START < 5000;

  return <div className={`tavora25-event tavora25-${phase} tavora25-mood-${trackMood} ${hardIntro ? 'is-hard-intro' : ''} ${phase === 'ceremony' && ceremonyElapsed >= 46000 ? 'is-rebuilding' : ''} ${phase === 'ceremony' && elapsed >= RELEASE_AT ? 'is-releasing' : ''}`} aria-live="polite">
    <div className="tavora25-snapshot-stage" aria-hidden="true" />
    {phase === 'chaos' && <div className="tavora25-hard-hit" aria-hidden="true"><span>NO SIGNAL</span><strong>25</strong><em>MAKE SOME NOISE</em></div>}
    {hardIntro && <div className="tavora25-hard-barrage" aria-hidden="true">{['WAKE UP', 'NO RULES', 'TAVORA', '25 MEMBERS', 'RUN IT BACK', 'THE ROOM IS LIVE'].map((label, index) => <span key={label} style={{ '--barrage-index': index }}>{label}</span>)}</div>}
    {phase === 'countdown' && <div className="tavora25-countdown"><span>THE NEXT CHAPTER</span><strong key={countdown}>{String(countdown).padStart(2, '0')}</strong><small>TAVORA / 25</small></div>}
    {phase === 'thankYou' && <h1 className="tavora25-thank-you">THANK YOU</h1>}
    {phase === 'ceremony' && <><div className="tavora25-ceremony-kicker">THE FOUNDING MEMBERS</div><CeremonyMembers members={members} elapsed={elapsed} />{title && <h1 className="tavora25-title">{title}</h1>}<div className="tavora25-mark">TAVORA</div>{ceremonyElapsed > 58000 && <div className="tavora25-finale"><strong>TAVORA</strong><span>25 MEMBERS</span><em>SEE YOU AT 50.</em></div>}</>}
  </div>;
}
