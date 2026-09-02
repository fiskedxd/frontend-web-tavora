import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WorkspaceSidebar from '../components/WorkspaceSidebar';
import ProfileModal from '../components/ProfileModal';
import AccountSettingsModal from '../components/AccountSettingsModal';
import RoleSettingsPanel from '../components/RoleSettingsPanel';
import ServerBannerEditor from '../components/ServerBannerEditor';
import ProfileBadges from '../components/ProfileBadges';
import { MessageMarkdown, MessageComposer } from '../components/MessageMarkdown';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  Users, User, Plus, LogOut, 
  MessageSquare, Home, Settings,
  UserPlus, Package, Search, X, Menu,
  Link, Server, UserCircle, Circle, 
  Settings2, Shield, Smartphone, Trash2,
  Key, Bell, Eye, Hash, Volume2, Monitor,
  Languages, Gamepad2, Code, LogIn,
  Copy, PenSquare, UserCheck, Sparkles,
  Crown, CreditCard, Gift, HelpCircle, ChevronUp, ChevronDown, ChevronLeft,
  Mic, MicOff, Video, VideoOff, Radio, Play, Pause, Download, FileAudio, FileVideo
} from 'lucide-react';

import { API_URL, uploadFile } from '../utils/api';

import GlobalTopBar from '../components/GlobalTopBar';

const REFRESH_INTERVAL = 1500;
const WorkspaceSidebarMemo = React.memo(WorkspaceSidebar);

// Ajoute ceci après les imports et avant const buildDefaultServerStructure
// Plaques nominatives - URLs Discord officielles avec noms personnalisés
const NAMEPLATES = [
  { 
    id: 'none', 
    name: 'Aucune', 
    url: null,
    color: '#ffffff',
    glow: 'none'
  },
  { 
    id: 'galactic_blue', 
    name: 'Bleu Galactique', 
    url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/1495806574269038713/static',
    color: '#5865F2',
    glow: '0 0 20px #5865F2'
  },
  { 
    id: 'emerald_glow', 
    name: 'Émeraude Lumineuse', 
    url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/1495807265175900180/static',
    color: '#57F287',
    glow: '0 0 20px #57F287'
  },
  { 
    id: 'crimson_fire', 
    name: 'Feu Cramoisi', 
    url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/1538991887497695252/static',
    color: '#ED4245',
    glow: '0 0 20px #ED4245'
  },
  { 
    id: 'golden_radiance', 
    name: 'Rayonnement Doré', 
    url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/1531411317477478654/static',
    color: '#FEE75C',
    glow: '0 0 20px #FEE75C'
  },
  { 
    id: 'neon_pulse', 
    name: 'Pulsation Néon', 
    url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/1488244924066566185/static',
    color: '#EB459E',
    glow: '0 0 20px #EB459E'
  },
  { 
    id: 'ocean_depth', 
    name: 'Profondeur Océanique', 
    url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/1488245817364975626/static',
    color: '#00B0F4',
    glow: '0 0 20px #00B0F4'
  },
  { 
    id: 'shadow_strike', 
    name: 'Frappe de l\'Ombre', 
    url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/1519015716097888296/static',
    color: '#1E1F22',
    glow: '0 0 20px #1E1F22'
  },
  { 
    id: 'sunburst', 
    name: 'Explosion Solaire', 
    url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/1377377712028516443/static',
    color: '#F0B232',
    glow: '0 0 20px #F0B232'
  },
  { 
    id: 'rose_tinted', 
    name: 'Rose Tinté', 
    url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/1519015238345822428/static',
    color: '#FF6B6B',
    glow: '0 0 20px #FF6B6B'
  },
  { 
    id: 'mystic_amethyst', 
    name: 'Améthyste Mystique', 
    url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/1519009618574053668/static',
    color: '#A855F7',
    glow: '0 0 20px #A855F7'
  },
  { 
    id: 'celestial_blue', 
    name: 'Bleu Céleste', 
    url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/1498424942121848852/static',
    color: '#3B82F6',
    glow: '0 0 20px #3B82F6'
  },
  { 
    id: 'arctic_ice', 
    name: 'Glace Arctique', 
    url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/1447654090921349235/static',
    color: '#60A5FA',
    glow: '0 0 20px #60A5FA'
  },
  { 
    id: 'midnight_storm', 
    name: 'Tempête de Minuit', 
    url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/1447654091173007401/static',
    color: '#4C1D95',
    glow: '0 0 20px #4C1D95'
  },
];

// Composant Avatar avec décoration
const AvatarWithDecoration = ({ user, size = 40, className = '' }) => {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const decoration = user?.avatarDecoration || null;
  const avatarUrl = user?.avatarUrl || '';
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <div 
        className="overflow-hidden rounded-full"
        style={{ 
          width: size, 
          height: size,
          border: '2px solid #1a1a24',
          backgroundColor: '#111111',
        }}
      >
        {avatarUrl && !avatarFailed ? (
          <img 
            src={avatarUrl} 
            alt={`Avatar de ${user?.displayName || user?.username || 'Utilisateur'}`} 
            className="h-full w-full object-cover" 
            onError={() => setAvatarFailed(true)} 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User size={size * 0.4} className="text-gray-600" />
          </div>
        )}
      </div>
      
      {decoration && (
        <img 
          src={decoration} 
          alt="Décoration" 
          style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -52%) scale(1.5)',
            width: size * 0.7,
            height: size * 0.75,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

// Composant Nom avec plaque nominative
const DisplayNameWithNameplate = ({ user, className = '' }) => {
  const nameplateId = user?.nameplate || 'none';
  const nameplate = NAMEPLATES.find(n => n.id === nameplateId) || NAMEPLATES[0];
  const displayName = user?.displayName || user?.username || 'Utilisateur';
  
  if (nameplateId === 'none' || !nameplate || !nameplate.url) {
    return <span className={className}>{displayName}</span>;
  }
  
  return (
    <span 
      className={className}
      style={{
        backgroundImage: `url(${nameplate.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '4px 12px',
        borderRadius: '6px',
        display: 'inline-block',
        color: nameplate.color,
        textShadow: nameplate.glow !== 'none' ? nameplate.glow : undefined,
      }}
    >
      {displayName}
    </span>
  );
};

const buildDefaultServerStructure = (server) => {
  const baseId = String(server.id || server.name || 'server').toLowerCase().replace(/\s+/g, '-');
  return {
    categories: [
      {
        id: `${baseId}-general`,
        name: 'Général',
        channels: [
          { id: `${baseId}-chat`, type: 'text', name: 'chat' },
          { id: `${baseId}-media`, type: 'text', name: 'media' },
        ],
      },
      {
        id: `${baseId}-voix`,
        name: 'Vocal',
        channels: [
          { id: `${baseId}-voc-1`, type: 'voice', name: 'voc1' },
          { id: `${baseId}-voc-2`, type: 'voice', name: 'voc2' },
        ],
      },
    ],
  };
};

const normalizeServer = (server) => ({
  ...server,
  structure: server.structure || buildDefaultServerStructure(server),
});

const readJsonResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const DEFAULT_VOICE_STATE = { joined: false, micOn: true, cameraOn: false, streaming: false };

const areSameValue = (left, right) => {
  if (Object.is(left, right)) return true;
  if (left == null || right == null) return left === right;
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
};

const mergeMessages = (existingMessages, incomingMessages) => {
  const merged = new Map();
  [...existingMessages, ...incomingMessages].forEach((message) => {
    const key = message._id || `${message.authorUsername || 'user'}-${message.createdAt || Date.now()}`;
    merged.set(key, message);
  });
  return Array.from(merged.values()).sort((left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0));
};

const extractServerIdFromInvite = (invite) => {
  const inviteUrl = typeof invite === 'string' ? invite : invite?.link || invite?.url || '';
  const rawValue = typeof invite === 'object' && invite?.serverId ? String(invite.serverId) : inviteUrl;
  if (!rawValue) return null;
  const candidates = [rawValue, rawValue.split(':')[0], rawValue.split('|')[0]];
  for (const candidate of candidates) {
    if (/^[0-9a-fA-F]{24}$/.test(candidate)) {
      return candidate;
    }
  }
  if (inviteUrl) {
    try {
      const parsedUrl = new URL(inviteUrl);
      const segments = parsedUrl.pathname.split('/').filter(Boolean);
      for (const segment of [...segments].reverse()) {
        const normalizedSegment = segment.split(':')[0].split('|')[0];
        if (/^[0-9a-fA-F]{24}$/.test(normalizedSegment)) {
          return normalizedSegment;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  return null;
};

const serverSummaryCache = new Map();

const getServerSummary = async (serverId, getAuthHeaders) => {
  const cached = serverSummaryCache.get(serverId);
  if (cached && Date.now() - cached.timestamp < 30000) return cached.server;

  const response = await fetch(`${API_URL}/api/social/servers/${serverId}/summary`, { headers: getAuthHeaders() });
  const data = await readJsonResponse(response);
  if (!response.ok || !data.server) {
    throw new Error(data.message || 'Invitation indisponible.');
  }
  serverSummaryCache.set(serverId, { server: data.server, timestamp: Date.now() });
  return data.server;
};

const invalidateServerSummary = (serverId) => {
  if (serverId) serverSummaryCache.delete(String(serverId));
};

const extractInviteUrl = (content) => {
  const match = String(content || '').match(/https?:\/\/[^\s]+\/invite\/[^\s]+/i);
  return match ? match[0].replace(/[),.!?]+$/, '') : null;
};

const ServerInviteCard = ({ inviteUrl, getAuthHeaders, onJoin, avatarTimestamp }) => {
  const [server, setServer] = useState(null);
  const [status, setStatus] = useState('loading');
  const [isDismissed, setIsDismissed] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [bannerFailed, setBannerFailed] = useState(false);

  useEffect(() => {
    const serverId = extractServerIdFromInvite(inviteUrl);
    if (!serverId) {
      setStatus('invalid');
      return undefined;
    }

    let cancelled = false;
    setServer(null);
    setStatus('loading');
    setIsDismissed(false);
    setAvatarFailed(false);
    setBannerFailed(false);

    const loadServer = async () => {
      try {
        const nextServer = await getServerSummary(serverId, getAuthHeaders);
        if (cancelled) return;
        setServer(nextServer);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('invalid');
      }
    };

    loadServer();
    return () => {
      cancelled = true;
    };
  }, [getAuthHeaders, inviteUrl]);

  if (isDismissed) {
    return <div className="mt-3 rounded-2xl border border-white/5 bg-[#11111a] px-3 py-2 text-xs text-white/35">Invitation ignorée.</div>;
  }

  if (status === 'loading') {
    return (
      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#11111a] p-4">
        <div className="flex animate-pulse items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/10" />
          <div className="flex-1 space-y-2"><div className="h-3 w-1/2 rounded bg-white/10" /><div className="h-2 w-3/4 rounded bg-white/5" /></div>
        </div>
      </div>
    );
  }

  if (status === 'invalid' || !server) {
    return (
      <div className="mt-3 rounded-2xl border border-rose-400/15 bg-rose-500/5 px-4 py-3">
        <p className="text-sm font-medium text-white/80">Invitation indisponible</p>
        <p className="mt-1 text-xs text-white/40">Ce serveur n’existe plus ou le lien n’est plus valide.</p>
        <button type="button" onClick={() => setIsDismissed(true)} className="mt-3 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/55 transition hover:bg-white/10 hover:text-white">Fermer</button>
      </div>
    );
  }

  const handleJoin = async () => {
    setIsJoining(true);
    setJoinError('');
    try {
      const joinedServer = await onJoin(inviteUrl);
      if (!joinedServer) setJoinError('Impossible de rejoindre ce serveur.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#11111a] shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
      {server.bannerUrl && !bannerFailed ? (
        <img src={server.bannerUrl} alt="" className="h-24 w-full object-cover" onError={() => setBannerFailed(true)} />
      ) : null}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-indigo-500/15 text-lg font-semibold text-indigo-200">
            {server.avatarUrl && !avatarFailed ? (
              <img src={server.avatarUrl} alt={`Icône de ${server.name}`} className="h-full w-full object-cover" onError={() => setAvatarFailed(true)} />
            ) : (
              server.name?.charAt(0)?.toUpperCase() || 'S'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-300/70">Invitation serveur</p>
                <h3 className="mt-1 truncate text-base font-semibold text-white">{server.name}</h3>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] ${server.isMember ? 'border-sky-300/20 bg-sky-400/10 text-sky-200' : 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200'}`}>
                {server.isMember ? 'Déjà membre' : 'Disponible'}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/50">{server.description || 'Rejoignez cette communauté sur Tavora.'}</p>
            {Number.isFinite(server.memberCount) ? <p className="mt-2 text-[11px] text-white/30">{server.memberCount} membre{server.memberCount > 1 ? 's' : ''}</p> : null}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/5 pt-3">
          <button type="button" onClick={() => setIsDismissed(true)} className="rounded-lg px-3 py-2 text-xs text-white/40 transition hover:bg-white/5 hover:text-white/70">Ignorer</button>
          <button type="button" onClick={handleJoin} disabled={isJoining} className="rounded-lg bg-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/25 disabled:cursor-wait disabled:opacity-60">
            {isJoining ? 'Ouverture...' : server.isMember ? 'Ouvrir le serveur' : 'Rejoindre'}
          </button>
        </div>
        {joinError ? <p className="mt-2 text-right text-xs text-rose-300">{joinError}</p> : null}
      </div>
    </div>
  );
};

const parseWelcomePayload = (content) => {
  if (!content || typeof content !== 'string') return null;
  try {
    const parsed = JSON.parse(content);
    return parsed && parsed.type === 'tavora-welcome' ? parsed : null;
  } catch {
    return null;
  }
};

const OfficialWelcomeMessage = ({ content, user, navigate }) => {
  const payload = parseWelcomePayload(content) || { type: 'tavora-welcome', version: 1, step: 1 };
  const [step, setStep] = useState(Number(payload.step) || 1);
  const [copied, setCopied] = useState(false);
  const inviteUrl = 'https://tavora-xi.vercel.app/invite/6a92e66c940745da8a000cc6';
  const steps = [
    { id: 1, label: 'Bienvenue', short: '01', name: 'Bienvenue' },
    { id: 2, label: 'Profil', short: '02', name: 'Profil' },
    { id: 3, label: 'Personnalisation', short: '03', name: 'Personnalisation' },
    { id: 4, label: 'Préférences', short: '04', name: 'Préférences' },
    { id: 5, label: 'Terminer', short: '05', name: 'Terminer' },
  ];
  const currentStep = steps[Math.min(steps.length - 1, Math.max(0, step - 1))];
  const progress = (step / steps.length) * 100;

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="rounded-2xl border border-white/10 bg-[#111318] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/35">Bienvenue sur Tavora</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Ton compte vient d’être créé.</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">Commençons par configurer ton espace et préparer les premières étapes de ton profil.</p>
            <button type="button" onClick={() => setStep(2)} className="mt-5 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/90">
              COMMENCER
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#111318] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Configuration du profil</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Commence par personnaliser les informations visibles.</h3>
            </div>
            <div className="space-y-2.5">
              {[
                ['Nom d’utilisateur', user?.username || 'ton_username'],
                ['Nom affiché', user?.displayName || 'Ton nom'],
                ['Bio', 'Ajouter une bio'],
                ['Lien', 'Ajouter un lien'],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 rounded-xl border border-white/10 bg-[#0d0f14] px-3 py-2.5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</span>
                  <span className="text-sm text-white/75">{value}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => navigate('/profile')} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/10">
              MODIFIER LE PROFIL
            </button>
          </div>
        );
      case 3:
        return (
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-[#111318] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)] md:grid-cols-2">
            {[
              ['PHOTO DE PROFIL', 'Ajoute ou modifie ton image de profil.', 'MODIFIER'],
              ['BANNIÈRE', 'Personnalise l’en-tête de ton profil.', 'MODIFIER'],
              ['BIO', 'Présente-toi avec une courte description.', 'MODIFIER'],
              ['APPARENCE', 'Configure l’apparence de ton profil.', 'MODIFIER'],
            ].map(([title, description, action]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-[#0d0f14] p-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
                <button type="button" onClick={() => navigate('/profile')} className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white transition hover:bg-white/10">
                  {action}
                </button>
              </div>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#111318] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Préférences</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Panneau de configuration</h3>
            </div>
            <div className="space-y-2">
              {[
                ['Notifications', 'Activées'],
                ['Visibilité du profil', 'Public'],
                ['Préférences', 'Configurer'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d0f14] px-3 py-2.5">
                  <span className="text-sm text-white/70">{label}</span>
                  <span className="text-xs uppercase tracking-[0.15em] text-white/45">{value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#111318] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Configuration terminée</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Ton espace Tavora est prêt.</h3>
            </div>
            <div className="grid gap-2">
              {[
                ['Profil', 'Configuré'],
                ['Personnalisation', 'Disponible'],
                ['Préférences', 'Configurées'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d0f14] px-3 py-2.5">
                  <span className="text-sm text-white/70">{label}</span>
                  <span className="text-xs uppercase tracking-[0.14em] text-white/45">{value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0d0f14] p-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">Invitation Tavora</p>
              <p className="mt-2 text-sm text-white/60">Utilise ton invitation pour accéder à ton espace.</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => window.open(inviteUrl, '_blank', 'noopener,noreferrer')} className="flex-1 rounded-lg bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white/90">
                  OUVRIR L’INVITATION
                </button>
                <button type="button" onClick={copyInvite} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/10">
                  {copied ? 'COPIÉ' : 'COPIER LE LIEN'}
                </button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => navigate('/profile')} className="rounded-lg bg-white px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/90">
                OUVRIR MON PROFIL
              </button>
              <button type="button" onClick={() => navigate('/home')} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/10">
                OUVRIR TAVORA
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-3 overflow-hidden rounded-[20px] border border-white/10 bg-[#090b11] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="border-b border-white/10 bg-[#0d1016] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">Tavora</p>
            <p className="mt-1 text-sm text-white/70">Configuration du profil</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/45">Étape {step} sur {steps.length}</div>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {steps.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStep(item.id)}
              className={`rounded-lg border px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] transition ${
                item.id === step
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-white/10 bg-transparent text-white/40 hover:bg-white/5 hover:text-white/75'
              }`}
            >
              {item.short}
            </button>
          ))}
        </div>

        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-[0.26em] text-white/30">{currentStep.label}</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Bienvenue dans ton espace Tavora.</h2>
          <p className="mt-1 text-sm text-white/60">Quelques étapes suffisent pour configurer ton profil.</p>
        </div>

        {renderStepContent()}

        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))} className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/55 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/5">
            PRÉCÉDENT
          </button>
          <button type="button" disabled={step === steps.length} onClick={() => setStep((current) => Math.min(steps.length, current + 1))} className="rounded-lg bg-white px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-black disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/90">
            SUIVANT
          </button>
        </div>
      </div>
    </div>
  );
};

const formatMediaTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
};

const getAttachmentDownloadUrl = (attachment) => {
  if (!attachment?.key) return attachment?.url || '#';
  const filename = encodeURIComponent(attachment.filename || attachment.key.split('/').pop() || 'fichier');
  return `${API_URL}/api/files/${attachment.key}?download=1&filename=${filename}`;
};

const MessageMediaPlayer = ({ attachment, kind }) => {
  const mediaRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const isVideo = kind === 'video';

  const togglePlayback = async () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await mediaRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const seek = (event) => {
    if (!mediaRef.current || !duration) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    mediaRef.current.currentTime = ((event.clientX - bounds.left) / bounds.width) * duration;
  };

  return (
    <div className={`mt-2 overflow-hidden rounded-2xl border border-cyan-200/15 bg-[#101722] shadow-[0_12px_35px_rgba(0,0,0,0.22)] ${isVideo ? 'max-w-xl' : 'max-w-md'}`}>
      <div className={`relative ${isVideo ? 'bg-black' : ''}`}>
        {isVideo ? <video ref={mediaRef} src={attachment.url} preload="metadata" className="max-h-80 w-full object-contain" onTimeUpdate={() => setCurrentTime(mediaRef.current?.currentTime || 0)} onLoadedMetadata={() => setDuration(mediaRef.current?.duration || 0)} onEnded={() => setIsPlaying(false)} /> : <audio ref={mediaRef} src={attachment.url} preload="metadata" className="hidden" onTimeUpdate={() => setCurrentTime(mediaRef.current?.currentTime || 0)} onLoadedMetadata={() => setDuration(mediaRef.current?.duration || 0)} onEnded={() => setIsPlaying(false)} />}
        {isVideo && !isPlaying ? <button type="button" onClick={togglePlayback} aria-label="Lire la vidéo" className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-200 text-slate-950 shadow-[0_0_28px_rgba(103,232,249,0.45)] transition hover:scale-105"><Play size={23} fill="currentColor" /></button> : null}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={togglePlayback} aria-label={isPlaying ? 'Mettre en pause' : 'Lire'} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-slate-950 transition hover:bg-cyan-100">{isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{attachment.filename || (isVideo ? 'Vidéo' : 'Audio')}</p>
            <div className="mt-2 h-1.5 cursor-pointer rounded-full bg-white/10" onClick={seek} role="slider" aria-label="Progression de la lecture" aria-valuemin="0" aria-valuemax={duration || 0} aria-valuenow={currentTime}>
              <div className="h-full rounded-full bg-cyan-200 transition-[width]" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
            </div>
          </div>
          <span className="shrink-0 font-mono text-[11px] text-white/45">{formatMediaTime(currentTime)} / {formatMediaTime(duration)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-cyan-200/45"><span className="inline-flex items-center gap-1">{isVideo ? <FileVideo size={12} /> : <FileAudio size={12} />}{isVideo ? 'Vidéo' : 'Audio'}</span><a href={getAttachmentDownloadUrl(attachment)} download={attachment.filename} title="Télécharger sur l’appareil" className="rounded-md p-1.5 text-white/45 transition hover:bg-white/10 hover:text-cyan-100"><Download size={14} /></a></div>
      </div>
    </div>
  );
};

const MessageAttachment = ({ attachment }) => {
  if (!attachment?.url) return null;
  const type = attachment.contentType || '';
  if (type.startsWith('image/')) return <div className="relative mt-2 w-fit"><img src={attachment.url} alt={attachment.filename || 'Image jointe'} className="max-h-80 max-w-full rounded-lg object-contain" /><a href={getAttachmentDownloadUrl(attachment)} download={attachment.filename} title="Télécharger l’image" className="absolute bottom-2 right-2 rounded-lg bg-slate-950/80 p-2 text-white/70 backdrop-blur transition hover:bg-cyan-200 hover:text-slate-950"><Download size={15} /></a></div>;
  if (type.startsWith('video/')) return <MessageMediaPlayer attachment={attachment} kind="video" />;
  if (type.startsWith('audio/')) return <MessageMediaPlayer attachment={attachment} kind="audio" />;
  return <a href={getAttachmentDownloadUrl(attachment)} download={attachment.filename} className="mt-2 flex max-w-md items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cyan-100 hover:bg-white/10"><span className="truncate">{attachment.filename || 'Fichier joint'}</span><span className="shrink-0 text-xs text-white/40">Télécharger</span></a>;
};

const MessageContent = ({ content, attachment, getAuthHeaders, onJoin, avatarTimestamp, user, navigate }) => {
  const welcomePayload = parseWelcomePayload(content);
  if (welcomePayload) {
    return <OfficialWelcomeMessage content={content} user={user} navigate={navigate} />;
  }

  const inviteUrl = extractInviteUrl(content);
  if (!inviteUrl) return <><MessageAttachment attachment={attachment} />{content ? <MessageMarkdown content={content} /> : null}</>;

  const [before, after] = String(content).split(inviteUrl);
  return (
    <div className="mt-3">
      {attachment ? <MessageAttachment attachment={attachment} /> : null}
      {before.trim() ? <MessageMarkdown content={before.trim()} /> : null}
      <ServerInviteCard inviteUrl={inviteUrl} getAuthHeaders={getAuthHeaders} onJoin={onJoin} avatarTimestamp={avatarTimestamp} />      {after.trim() ? <MessageMarkdown content={after.trim()} /> : null}
    </div>
  );
};

const ServerIcon = ({ server, timestamp }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(server?.avatarUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [server?.id, server?.avatarUrl]);

  return (
    <>
      {hasImage ? (
        <img
          src={timestamp ? `${server.avatarUrl}?t=${timestamp}` : server.avatarUrl}
          alt={`Icône de ${server.name}`}
          className="h-full w-full rounded-2xl object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-sm font-semibold text-white/60">
          {server?.name?.charAt(0)?.toUpperCase() || 'S'}
        </div>
      )}
    </>
  );
};

function AppHomePage() {
  const [avatarTimestamp, setAvatarTimestamp] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user, logout, getAuthHeaders, updateUser, updateSession } = useAuth();
  const userRef = useRef(user);
  const getAuthHeadersRef = useRef(getAuthHeaders);
  userRef.current = user;
  getAuthHeadersRef.current = getAuthHeaders;
  const [servers, setServers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [liveNotifications, setLiveNotifications] = useState({ directMessages: [], servers: [] });
  const [isLiveNotificationsOpen, setIsLiveNotificationsOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [mobileServerSettingsView, setMobileServerSettingsView] = useState('navigation');
  const [isMobileViewport, setIsMobileViewport] = useState(() => window.matchMedia?.('(max-width: 640px)').matches ?? false);
  const [isBannerEditorOpen, setIsBannerEditorOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileTarget, setProfileTarget] = useState(null);
  const [profileDraft, setProfileDraft] = useState({ displayName: '', username: '', bio: '', avatarUrl: '', bannerUrl: '', activity: null });
  const [profileMessage, setProfileMessage] = useState('');
  const reportUser = async (targetUserId, reason, details) => {
    try {
      const response = await fetch(`${API_URL}/api/social/reports/${targetUserId}`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ reason, details }) });
      const data = await readJsonResponse(response);
      return response.ok ? { ok: true } : { ok: false, message: data.message };
    } catch (error) { return { ok: false, message: error.message || 'Signalement impossible.' }; }
  };
  const [inviteLink, setInviteLink] = useState('');
  const [friendSearch, setFriendSearch] = useState('');
  const [friendUsername, setFriendUsername] = useState('');
  const [inviteDuration, setInviteDuration] = useState('1h');
  const [invitePreview, setInvitePreview] = useState(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [serverSettingsMessage, setServerSettingsMessage] = useState('');
  const [serverDraft, setServerDraft] = useState({ name: '', description: '', avatarUrl: '', bannerUrl: '', accent: '' });
  const [customInviteSuffix, setCustomInviteSuffix] = useState('');
  const [serverInviteLink, setServerInviteLink] = useState('');
  const [serverBannedMembers, setServerBannedMembers] = useState([]);
  const [isUpdatingServer, setIsUpdatingServer] = useState(false);
  const [isGeneratingServerInvite, setIsGeneratingServerInvite] = useState(false);
  const [voiceState, setVoiceState] = useState(DEFAULT_VOICE_STATE);
  const [voiceParticipants, setVoiceParticipants] = useState([]);
  const [voiceChannelStates, setVoiceChannelStates] = useState({});
  const [voiceError, setVoiceError] = useState('');
  const [audioSettingsOpen, setAudioSettingsOpen] = useState(false);
  const [audioDevices, setAudioDevices] = useState({ inputs: [], outputs: [] });
  const [channelMessages, setChannelMessages] = useState([]);
  const [serverMembers, setServerMembers] = useState([]);
  const [serverRoles, setServerRoles] = useState([]);
  const [serverPermissions, setServerPermissions] = useState([]);
  const [roleDraft, setRoleDraft] = useState({ id: null, name: '', color: '#99aab5', iconUrl: '', hoist: false, permissions: [] });
  const [activeVoiceChannelId, setActiveVoiceChannelId] = useState(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [privateChatUser, setPrivateChatUser] = useState(null);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [isLoadingPrivateChat, setIsLoadingPrivateChat] = useState(false);
  const [privateDraft, setPrivateDraft] = useState('');
  const [commandIndex, setCommandIndex] = useState(0);
  const [isSendingPrivateMessage, setIsSendingPrivateMessage] = useState(false);
  const [messageContext, setMessageContext] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageIsPrivate, setEditingMessageIsPrivate] = useState(false);
  const [editingMessageDraft, setEditingMessageDraft] = useState('');
  const [showChannelNewMessages, setShowChannelNewMessages] = useState(false);
  const [showPrivateNewMessages, setShowPrivateNewMessages] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [shareStream, setShareStream] = useState(null);
  const [homeAvatarFailed, setHomeAvatarFailed] = useState(false);
  const localVideoRef = useRef(null);
  const shareVideoRef = useRef(null);
  const profileRequestIdRef = useRef(0);
  const channelMessagesRef = useRef(null);
  const privateMessagesRef = useRef(null);
  const channelConversationKeyRef = useRef('');
  const privateConversationKeyRef = useRef('');
  const channelMessageCountRef = useRef(0);
  const privateMessageCountRef = useRef(0);
  const forceChannelScrollRef = useRef(false);
  const forcePrivateScrollRef = useRef(false);
  const sendingPrivateRef = useRef(false);
  const voiceSocketRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const remoteAudioRef = useRef(new Map());
  const pendingIceCandidatesRef = useRef(new Map());
  const serverDirectoryCacheRef = useRef(new Map());

  const selectedServer = useMemo(() => {
    if (!params.serverId) return null;
    const fromList = servers.find((item) => String(item.id) === String(params.serverId));
    if (fromList) return fromList;
    return {
      id: params.serverId,
      name: 'Serveur',
      structure: buildDefaultServerStructure({ id: params.serverId, name: 'Serveur' }),
    };
  }, [params.serverId, servers]);

  const activeChannelId = params.channelId || selectedServer?.structure?.categories?.[0]?.channels?.[0]?.id || null;
  const activeChannel = selectedServer?.structure?.categories
    ?.flatMap((category) => category.channels)
    ?.find((channel) => channel.id === activeChannelId) || null;
  const activeChannelType = activeChannel?.type || null;
  const isServerOwner = Boolean(selectedServer?.owner);
  const channelConversationKey = `${selectedServer?.id || ''}:${activeChannelId || ''}`;
  const privateConversationKey = params.userId || '';

  const totalCommunityMembers = Math.max(
    servers.reduce((total, server) => total + (server.memberCount ?? server.members?.length ?? 0), 0),
    friends.length + 1,
  );

  useEffect(() => {
    setHomeAvatarFailed(false);
  }, [user?.avatarUrl]);

  useEffect(() => {
    if (location.pathname.startsWith('/settings')) setIsAccountSettingsOpen(true);
  }, [location.pathname]);

  useEffect(() => {
    const conversationName = params.userId
      ? privateChatUser?.displayName || privateChatUser?.username
      : selectedServer?.name;
    document.title = conversationName ? `Tavora | ${conversationName}` : 'Tavora';
  }, [params.userId, privateChatUser?.displayName, privateChatUser?.username, selectedServer?.name]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobileViewport(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (isSettingsModalOpen) setMobileServerSettingsView('navigation');
  }, [isSettingsModalOpen]);

  useEffect(() => {
    const closeMobileSidebar = (event) => {
      if (event.key === 'Escape') setIsMobileSidebarOpen(false);
    };
    window.addEventListener('keydown', closeMobileSidebar);
    return () => window.removeEventListener('keydown', closeMobileSidebar);
  }, []);

  const isNearBottom = (container, threshold = 120) => {
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
  };

  const scrollMessagesToBottom = (container, behavior = 'auto') => {
    if (!container) return;
    const scroll = () => container.scrollTo({ top: container.scrollHeight, behavior });
    const images = Array.from(container.querySelectorAll('img'));
    const pendingImages = images.filter((image) => !image.complete).map((image) => new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    }));
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        await Promise.all(pendingImages);
        scroll();
      });
    });
  };

  const handleMessageScroll = (container, setShowNewMessages) => {
    if (isNearBottom(container)) setShowNewMessages(false);
  };

useEffect(() => {
  let cancelled = false;
  const userId = user?._id || user?.id;
  const applySocialData = (data) => {
    const nextServers = (data.servers || []).map(normalizeServer);
    const nextFriends = data.friends || [];
    const nextIncoming = data.incomingRequests || [];
    const nextOutgoing = data.outgoingRequests || [];
    setServers((current) => (areSameValue(current, nextServers) ? current : nextServers));
    setFriends((current) => (areSameValue(current, nextFriends) ? current : nextFriends));
    setIncomingRequests((current) => (areSameValue(current, nextIncoming) ? current : nextIncoming));
    setOutgoingRequests((current) => (areSameValue(current, nextOutgoing) ? current : nextOutgoing));
    if (data.user) {
      const currentUser = userRef.current;
      const nextUser = { ...(currentUser || {}), ...data.user };
      if (!areSameValue(currentUser, nextUser)) updateUser(nextUser);
    }
  };
  const loadSocial = async () => {
    try {
      const response = await fetch(`${API_URL}/api/social/me`, { headers: getAuthHeadersRef.current() });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible de charger la vue sociale.');
      if (cancelled) return;
      applySocialData(data);
    } catch (error) {
      console.error(error);
    }
  };
  if (userId) {
    loadSocial();
    const intervalId = window.setInterval(loadSocial, REFRESH_INTERVAL);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }
  return undefined;
}, [user?._id, user?.id, updateUser]);

useEffect(() => {
  if (!user) return undefined;
  let cancelled = false;
  let loading = false;
  const loadNotifications = async () => {
    if (loading) return;
    loading = true;
    try {
      const response = await fetch(`${API_URL}/api/social/notifications`, { headers: getAuthHeaders() });
      const data = await readJsonResponse(response);
      if (!cancelled && response.ok) {
        const nextNotifications = { directMessages: data.directMessages || [], servers: data.servers || [] };
        setLiveNotifications((current) => (areSameValue(current, nextNotifications) ? current : nextNotifications));
      }
    } catch (error) {
      if (!cancelled) console.error(error);
    } finally {
      loading = false;
    }
  };
  loadNotifications();
  const intervalId = window.setInterval(loadNotifications, REFRESH_INTERVAL);
  return () => { 
    cancelled = true; 
    window.clearInterval(intervalId); 
  };
}, [user?._id, user?.id]);

useEffect(() => {
  const serverId = selectedServer?.id;
  if (!serverId) return undefined;
  const cached = serverDirectoryCacheRef.current.get(String(serverId));
  if (cached) {
    setServerRoles((current) => (areSameValue(current, cached.roles) ? current : cached.roles));
    setServerPermissions((current) => (areSameValue(current, cached.permissions) ? current : cached.permissions));
    setServerMembers((current) => (areSameValue(current, cached.members) ? current : cached.members));
  }
  let cancelled = false;
  const loadMembers = async () => {
    try {
      const [rolesResponse, membersResponse] = await Promise.all([
        fetch(`${API_URL}/api/social/servers/${serverId}/roles`, { headers: getAuthHeadersRef.current() }),
        fetch(`${API_URL}/api/social/servers/${serverId}/members`, { headers: getAuthHeadersRef.current() }),
      ]);
      const rolesData = await readJsonResponse(rolesResponse);
      const membersData = await readJsonResponse(membersResponse);
      if (cancelled) return;
      const nextRoles = rolesResponse.ok ? (rolesData.roles || []) : null;
      const nextPermissions = rolesResponse.ok ? (rolesData.permissions || []) : null;
      const nextMembers = membersResponse.ok ? (membersData.members || []) : [];
      if (nextRoles) setServerRoles((current) => (areSameValue(current, nextRoles) ? current : nextRoles));
      if (nextPermissions) setServerPermissions((current) => (areSameValue(current, nextPermissions) ? current : nextPermissions));
      setServerMembers((current) => (areSameValue(current, nextMembers) ? current : nextMembers));
      serverDirectoryCacheRef.current.set(String(serverId), {
        roles: nextRoles || cached?.roles || [],
        permissions: nextPermissions || cached?.permissions || [],
        members: nextMembers,
      });
    } catch (error) {
      console.error(error);
    }
  };
  loadMembers();
  return () => {
    cancelled = true;
  };
}, [selectedServer?.id]);

useEffect(() => {
  const serverId = selectedServer?.id;
  if (!serverId || !activeChannelId || activeChannelType !== 'text') return undefined;
  let cancelled = false;
  let loading = false;
  const conversationKey = `${serverId}:${activeChannelId}`;
  const shouldReset = channelConversationKeyRef.current !== conversationKey;
  const loadMessages = async () => {
    if (loading) return;
    loading = true;
    try {
      const response = await fetch(`${API_URL}/api/social/servers/${serverId}/messages/${activeChannelId}`, {
        headers: getAuthHeadersRef.current(),
      });
      const data = await readJsonResponse(response);
      if (response.ok && !cancelled) {
        const nextMessages = data.messages || [];
        setChannelMessages((current) => (areSameValue(current, nextMessages) ? current : nextMessages));
      }
    } catch (error) {
      console.error(error);
    } finally {
      loading = false;
    }
  };
  if (shouldReset) setChannelMessages([]);
  loadMessages();
  const intervalId = window.setInterval(loadMessages, REFRESH_INTERVAL);
  return () => {
    cancelled = true;
    window.clearInterval(intervalId);
  };
}, [selectedServer?.id, activeChannelId, activeChannelType]);

  useEffect(() => {
    if (channelConversationKeyRef.current !== channelConversationKey) {
      channelConversationKeyRef.current = channelConversationKey;
      channelMessageCountRef.current = 0;
      setShowChannelNewMessages(false);
      scrollMessagesToBottom(channelMessagesRef.current);
      return;
    }

    const previousCount = channelMessageCountRef.current;
    const nextCount = channelMessages.length;
    const container = channelMessagesRef.current;
    const addedMessages = nextCount > previousCount;
    const shouldStick = isNearBottom(container);
    channelMessageCountRef.current = nextCount;
    const forceScroll = forceChannelScrollRef.current;
    forceChannelScrollRef.current = false;
    if (addedMessages && (forceScroll || previousCount === 0 || shouldStick)) {
      setShowChannelNewMessages(false);
      scrollMessagesToBottom(container, previousCount === 0 ? 'auto' : 'smooth');
    } else if (addedMessages) {
      setShowChannelNewMessages(true);
    }
  }, [channelConversationKey, channelMessages.length]);

  useEffect(() => {
    if (privateConversationKeyRef.current !== privateConversationKey) {
      privateConversationKeyRef.current = privateConversationKey;
      privateMessageCountRef.current = 0;
      setShowPrivateNewMessages(false);
      scrollMessagesToBottom(privateMessagesRef.current);
      return;
    }

    const previousCount = privateMessageCountRef.current;
    const nextCount = privateMessages.length;
    const container = privateMessagesRef.current;
    const addedMessages = nextCount > previousCount;
    const shouldStick = isNearBottom(container);
    privateMessageCountRef.current = nextCount;
    const forceScroll = forcePrivateScrollRef.current;
    forcePrivateScrollRef.current = false;
    if (addedMessages && (forceScroll || previousCount === 0 || shouldStick)) {
      setShowPrivateNewMessages(false);
      scrollMessagesToBottom(container, previousCount === 0 ? 'auto' : 'smooth');
    } else if (addedMessages) {
      setShowPrivateNewMessages(true);
    }
  }, [privateConversationKey, privateMessages.length]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (shareVideoRef.current && shareStream) {
      shareVideoRef.current.srcObject = shareStream;
    }
  }, [shareStream]);

  useEffect(() => {
    if (!voiceState.joined || !activeVoiceChannelId || !selectedServer?.id || !localStream) {
      voiceSocketRef.current?.disconnect();
      voiceSocketRef.current = null;
      peerConnectionsRef.current.forEach((peer) => peer.close());
      peerConnectionsRef.current.clear();
      remoteAudioRef.current.forEach((audio) => { audio.pause(); audio.srcObject = null; });
      remoteAudioRef.current.clear();
      if (!voiceState.joined) setVoiceParticipants([]);
      return undefined;
    }

    const socket = io(API_URL, { transports: ['websocket'] });
    voiceSocketRef.current = socket;
    const peers = peerConnectionsRef.current;
    const createPeer = (participant, initiator) => {
      if (!participant?.socketId || peers.has(participant.socketId)) return peers.get(participant.socketId);
      const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      localStream.getTracks().forEach((track) => { if (track.kind === 'audio') track.contentHint = 'speech'; peer.addTrack(track, localStream); });
      peer.onicecandidate = (event) => { if (event.candidate) socket.emit('voice:signal', { targetSocketId: participant.socketId, signal: { candidate: event.candidate } }); };
      peer.ontrack = (event) => { let audio = remoteAudioRef.current.get(participant.socketId); if (!audio) { audio = new Audio(); audio.autoplay = true; audio.volume = 1; audio.setAttribute('playsinline', ''); remoteAudioRef.current.set(participant.socketId, audio); } audio.srcObject = event.streams[0]; audio.play().catch(() => {}); };
      peer.onconnectionstatechange = () => { if (['failed', 'closed'].includes(peer.connectionState)) { peer.close(); peers.delete(participant.socketId); } };
      peers.set(participant.socketId, peer);
      if (initiator) peer.createOffer().then((offer) => peer.setLocalDescription(offer).then(() => socket.emit('voice:signal', { targetSocketId: participant.socketId, signal: { description: peer.localDescription } }))).catch(() => {});
      return peer;
    };
    socket.on('connect', () => socket.emit('voice:join', { serverId: selectedServer.id, channelId: activeVoiceChannelId, user: { id: user?._id || user?.id, username: user?.username, displayName: user?.displayName, avatarUrl: user?.avatarUrl } }));
    socket.on('voice:participants', (participants) => { setVoiceParticipants([...new Map(participants.map((participant) => [String(participant.userId), { ...participant, id: participant.userId, name: participant.displayName, isSelf: String(participant.userId) === String(user?._id || user?.id) }])).values()]); participants.filter((participant) => String(participant.userId) !== String(user?._id || user?.id)).forEach((participant) => createPeer(participant, false)); });
    socket.on('voice:peer-joined', (participant) => createPeer(participant, true));
    socket.on('voice:signal', async ({ fromSocketId, signal }) => {
      const participant = { socketId: fromSocketId };
      const peer = createPeer(participant, false);
      try { if (signal.description) { await peer.setRemoteDescription(signal.description); const queued = pendingIceCandidatesRef.current.get(fromSocketId) || []; for (const candidate of queued) await peer.addIceCandidate(candidate); pendingIceCandidatesRef.current.delete(fromSocketId); if (signal.description.type === 'offer') { const answer = await peer.createAnswer(); await peer.setLocalDescription(answer); socket.emit('voice:signal', { targetSocketId: fromSocketId, signal: { description: peer.localDescription } }); } } else if (signal.candidate) { if (peer.remoteDescription) await peer.addIceCandidate(signal.candidate); else pendingIceCandidatesRef.current.set(fromSocketId, [...(pendingIceCandidatesRef.current.get(fromSocketId) || []), signal.candidate]); } } catch { setVoiceError('Connexion vocale interrompue.'); }
    });
    socket.on('voice:peer-left', ({ socketId }) => { const peer = peers.get(socketId); peer?.close(); peers.delete(socketId); const audio = remoteAudioRef.current.get(socketId); audio?.pause(); remoteAudioRef.current.delete(socketId); });
    socket.on('connect_error', () => setVoiceError('Connexion vocale indisponible.'));
    return () => { socket.emit('voice:leave'); socket.disconnect(); peers.forEach((peer) => peer.close()); peers.clear(); remoteAudioRef.current.forEach((audio) => audio.pause()); remoteAudioRef.current.clear(); };
  }, [activeVoiceChannelId, selectedServer?.id, user, voiceState.joined]);

  useEffect(() => {
    if (activeChannelType === 'voice' && activeChannelId) {
      const nextState = voiceChannelStates[activeChannelId] || DEFAULT_VOICE_STATE;
      setVoiceState((current) => (areSameValue(current, nextState) ? current : nextState));
      setActiveVoiceChannelId((current) => (current === activeChannelId ? current : activeChannelId));
      return;
    }
    setVoiceState((current) => (areSameValue(current, DEFAULT_VOICE_STATE) ? current : DEFAULT_VOICE_STATE));
    setActiveVoiceChannelId((current) => (current == null ? current : null));
  }, [activeChannelType, activeChannelId, voiceChannelStates]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openAccountSettings = () => {
    setIsAccountSettingsOpen(true);
    setIsProfileModalOpen(false);
  };

  const openProfileFromAccountSettings = () => {
    setIsAccountSettingsOpen(false);
    openProfileModal(user, true);
  };

  const openServerSettingsFor = (server = selectedServer) => {
    setIsAccountSettingsOpen(false);
    setIsSettingsModalOpen(true);
  };

  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: user?.email, currentPassword, newPassword }),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible de changer le mot de passe.');
      if (data.user) updateSession({ ...(user || {}), ...data.user }, data.token);
      return 'Mot de passe mis à jour.';
    } catch (error) {
      return error.message || 'Impossible de changer le mot de passe.';
    }
  };

  const handleRemoveFriend = async (targetUserId) => {
    try {
      const response = await fetch(`${API_URL}/api/social/friends/remove/${targetUserId}`, { method: 'POST', headers: getAuthHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Impossible de supprimer cet ami.');
      await refreshSocial();
    } catch (error) {
      setProfileMessage(error.message);
    }
  };

  const handleBlockFriend = async (targetUserId) => {
    try {
      const response = await fetch(`${API_URL}/api/social/users/${targetUserId}/block`, { method: 'POST', headers: getAuthHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Impossible de bloquer cet utilisateur.');
      await refreshSocial();
      setProfileTarget((current) => ({ ...(current || {}), isBlocked: true, isFriend: false }));
      setProfileMessage('Utilisateur bloqué.');
    } catch (error) {
      setProfileMessage(error.message);
    }
  };

  const handleUnblockUser = async (targetUserId) => {
    try {
      const response = await fetch(`${API_URL}/api/social/users/${targetUserId}/unblock`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Impossible de débloquer cet utilisateur.');
      await refreshSocial();
      setProfileTarget((current) => ({ ...(current || {}), isBlocked: false, isFriend: false }));
      setProfileMessage('Utilisateur débloqué.');
      setIsProfileModalOpen(false);
    } catch (error) {
      setProfileMessage(error.message);
    }
  };

  const handleToggleMemberRole = async (memberId, role) => {
    if (!selectedServer?.id || !role?._id) return;
    const member = serverMembers.find((item) => String(item.id) === String(memberId));
    const assigned = member?.roles?.some((item) => String(item._id) === String(role._id));
    const response = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}/members/${memberId}/roles/${role._id}`, { method: assigned ? 'DELETE' : 'POST', headers: getAuthHeaders() });
    const data = await readJsonResponse(response);
    if (!response.ok) throw new Error(data.message || 'Impossible de modifier les rôles.');
    const membersResponse = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}/members`, { headers: getAuthHeaders() });
    const membersData = await readJsonResponse(membersResponse);
    if (membersResponse.ok) setServerMembers(membersData.members || []);
    return data.message;
  };

  const handleAddFriendFromProfile = async (targetProfile) => {
    const targetUsername = targetProfile?.username;
    if (!targetUsername) return 'Nom d’utilisateur indisponible.';
    try {
      const response = await fetch(`${API_URL}/api/social/friends`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username: targetUsername }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Impossible d’envoyer la demande.');
      await refreshSocial();
      return data.message || 'Demande d’amis envoyée.';
    } catch (error) {
      return error.message || 'Impossible d’envoyer la demande.';
    }
  };

  const handleLeaveServer = async (serverId) => {
    try {
      const response = await fetch(`${API_URL}/api/social/servers/${serverId}/leave`, { method: 'POST', headers: getAuthHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Impossible de quitter le serveur.');
      await refreshSocial();
    } catch (error) {
      setProfileMessage(error.message);
    }
  };

  const handleCreateServer = async (event) => {
    event.preventDefault();
    if (!draftName.trim()) return;
    try {
      setIsCreating(true);
      setMessage('');
      const response = await fetch(`${API_URL}/api/social/servers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: draftName.trim(), description: '', accent: 'from-indigo-500 to-violet-500' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Impossible de créer le serveur.');
      const createdServer = normalizeServer({ ...data.server, name: draftName.trim() });
      setServers((prev) => [createdServer, ...prev.filter((server) => String(server.id) !== String(createdServer.id))]);
      setPrivateChatUser(null);
      navigate(`/server/${createdServer.id}/channel/${createdServer.structure.categories[0].channels[0].id}`);
      setDraftName('');
      setMessage('Serveur créé avec succès.');
      setIsServerModalOpen(false);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendUsername.trim()) return;
    try {
      const response = await fetch(`${API_URL}/api/social/friends`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username: friendUsername.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Impossible d’envoyer la demande.');
      setOutgoingRequests((prev) => [...prev, data.friend]);
      setFriendUsername('');
      setProfileMessage(data.message || 'Demande envoyée.');
      setIsFriendModalOpen(false);
    } catch (error) {
      setProfileMessage(error.message || 'Impossible d’envoyer la demande.');
    }
  };

  const openServer = (server) => {
    const normalizedServer = normalizeServer(server);
    const nextServer = {
      ...normalizedServer,
      id: normalizedServer.id || server._id || server.id,
      name: normalizedServer.name || server.name || 'Serveur',
    };
    setPrivateChatUser(null);
    setServers((current) => {
      const index = current.findIndex((item) => String(item.id) === String(nextServer.id));
      if (index === -1) return [nextServer, ...current];
      if (areSameValue(current[index], nextServer)) return current;
      return current.map((item, itemIndex) => (itemIndex === index ? nextServer : item));
    });
    const firstChannelId = nextServer.structure?.categories?.[0]?.channels?.[0]?.id;
    const targetPath = firstChannelId ? `/server/${nextServer.id}/channel/${firstChannelId}` : `/server/${nextServer.id}`;
    navigate(targetPath);
  };

  const refreshSocial = async () => {
    try {
      const response = await fetch(`${API_URL}/api/social/me`, { headers: getAuthHeaders() });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible de recharger la vue sociale.');
      const nextServers = (data.servers || []).map(normalizeServer);
      const nextFriends = data.friends || [];
      const nextIncoming = data.incomingRequests || [];
      const nextOutgoing = data.outgoingRequests || [];
      setServers((current) => (areSameValue(current, nextServers) ? current : nextServers));
      setFriends((current) => (areSameValue(current, nextFriends) ? current : nextFriends));
      setIncomingRequests((current) => (areSameValue(current, nextIncoming) ? current : nextIncoming));
      setOutgoingRequests((current) => (areSameValue(current, nextOutgoing) ? current : nextOutgoing));

      if (data.user) {
        const currentUser = userRef.current;
        const nextUser = { 
          ...(currentUser || {}), 
          ...data.user,
          avatarDecoration: data.user?.avatarDecoration || null,
          nameplate: data.user?.nameplate || 'none',
        };
        if (!areSameValue(currentUser, nextUser)) updateUser(nextUser);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFriendRequestDecision = async (targetUserId, decision) => {
    try {
      const response = await fetch(`${API_URL}/api/social/friends/${decision}/${targetUserId}`, { method: 'POST', headers: getAuthHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Impossible de traiter la demande.');
      await refreshSocial();
      setProfileMessage(decision === 'accept' ? 'Demande acceptée.' : 'Demande refusée.');
    } catch (error) {
      setProfileMessage(error.message || 'Impossible de traiter la demande.');
    }
  };

  const openDirectMessage = (targetUserId) => {
    const normalizedUserId = targetUserId?.id || targetUserId?._id || targetUserId;
    if (!normalizedUserId) return;
    setIsProfileModalOpen(false);
    navigate(`/dm/${normalizedUserId}`);
  };

  const markDirectMessageRead = async (targetUserId) => {
    try {
      await fetch(`${API_URL}/api/social/notifications/read`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type: 'dm', userId: targetUserId }),
      });
      setLiveNotifications((current) => ({
        ...current,
        directMessages: current.directMessages.filter((item) => String(item.userId) !== String(targetUserId)),
      }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!selectedServer?.id) return undefined;
    const markServerRead = async () => {
      try {
        await fetch(`${API_URL}/api/social/notifications/read`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ type: 'server', serverId: selectedServer.id }),
        });
        setLiveNotifications((current) => ({ ...current, servers: current.servers.filter((item) => String(item.serverId) !== String(selectedServer.id)) }));
      } catch (error) {
        console.error(error);
      }
    };
    markServerRead();
    return undefined;
  }, [getAuthHeaders, selectedServer?.id]);

useEffect(() => {
  const targetUserId = params.userId;
  if (!targetUserId) {
    setPrivateChatUser(null);
    setPrivateMessages([]);
    setIsLoadingPrivateChat(false);
    return undefined;
  }

  let cancelled = false;
  setPrivateChatUser(null);
  setPrivateMessages([]);
  setPrivateDraft('');
  setProfileMessage('');
  setIsLoadingPrivateChat(true);

  const loadPrivateChat = async () => {
    try {
      const [profileResponse, messagesResponse] = await Promise.all([
        fetch(`${API_URL}/api/social/profile/${targetUserId}`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/api/social/messages/private/${targetUserId}`, { headers: getAuthHeaders() }),
      ]);
      const profileData = await readJsonResponse(profileResponse);
      const messagesData = await readJsonResponse(messagesResponse);
      if (!profileResponse.ok) throw new Error(profileData.message || 'Impossible de charger le profil.');
      if (!messagesResponse.ok) throw new Error(messagesData.message || 'Impossible de charger les messages privés.');
      if (cancelled) return;
      setPrivateChatUser(profileData.user || messagesData.friend || { id: targetUserId });
      setPrivateMessages(messagesData.messages || []);
    } catch (error) {
      if (!cancelled) {
        setPrivateChatUser(null);
        setPrivateMessages([]);
        setProfileMessage(error.message || 'Impossible de charger la conversation.');
      }
    } finally {
      if (!cancelled) setIsLoadingPrivateChat(false);
    }
  };

  loadPrivateChat();
  return () => {
    cancelled = true;
  };
}, [params.userId]); // ← Enlève getAuthHeaders et navigate

useEffect(() => {
  const targetUserId = params.userId;
  if (!targetUserId) return undefined;
  markDirectMessageRead(targetUserId);
  let cancelled = false;
  let loading = false;
  const syncPrivateMessages = async () => {
    if (loading) return;
    loading = true;
    try {
      const response = await fetch(`${API_URL}/api/social/messages/private/${targetUserId}`, { headers: getAuthHeaders() });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible de synchroniser les messages privés.');
      if (!cancelled) {
        setPrivateMessages((previousMessages) => mergeMessages(previousMessages, data.messages || []));
      }
    } catch (error) {
      if (!cancelled) {
        console.error(error);
      }
    } finally {
      loading = false;
    }
  };
  syncPrivateMessages();
  const intervalId = window.setInterval(syncPrivateMessages, REFRESH_INTERVAL);
  return () => {
    cancelled = true;
    window.clearInterval(intervalId);
  };
}, [params.userId]); // ← Enlève getAuthHeaders

  const handleSendPrivateMessage = async (event, attachment) => {
    event.preventDefault();
    if (sendingPrivateRef.current || isSendingPrivateMessage) return;
    if ((!privateDraft.trim() && !attachment) || !params.userId) return;
    sendingPrivateRef.current = true;
    const content = privateDraft.trim();
    if (privateChatUser?.isOfficial && content.startsWith('/send ')) {
      const match = content.match(/^\/send\s+"([\s\S]+)"\s+([^\s]+)$/);
      if (!match) { setProfileMessage('Format attendu : /send "message" nom_utilisateur'); return; }
      setPrivateDraft('');
      const response = await fetch(`${API_URL}/api/social/official/send`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ content: match[1], username: match[2] }) });
      const data = await readJsonResponse(response);
      if (!response.ok) { setProfileMessage(data.message || 'Commande refusée.'); return; }
      setPrivateMessages((prev) => mergeMessages(prev, [data.message]));
      setProfileMessage('Message officiel envoyé.');
      return;
    }
    if (privateChatUser?.isOfficial && content.startsWith('/actus ')) {
      const match = content.match(/^\/actus\s+"([\s\S]+)"$/);
      if (!match) { setProfileMessage('Format attendu : /actus "message"'); return; }
      const prepareResponse = await fetch(`${API_URL}/api/social/official/actus/prepare`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ content: match[1] }) });
      const prepared = await readJsonResponse(prepareResponse);
      if (!prepareResponse.ok) { setProfileMessage(prepared.message || 'Commande refusée.'); return; }
      if (!window.confirm(`Annonce de Tavora\n\n${prepared.announcement.content}\n\nDestinataires : ${prepared.announcement.recipientCount}\n\nEnvoyer l’annonce ?`)) { setProfileMessage('Annonce annulée.'); return; }
      const sendResponse = await fetch(`${API_URL}/api/social/official/actus/${prepared.announcement.id}/send`, { method: 'POST', headers: getAuthHeaders() });
      const sent = await readJsonResponse(sendResponse);
      setPrivateDraft('');
      setProfileMessage(sendResponse.ok ? 'Annonce lancée.' : (sent.message || 'Annonce refusée.'));
      return;
    }
    const temporaryId = `pending-private-${Date.now()}`;
    const optimisticMessage = { _id: temporaryId, id: temporaryId, isPending: true, authorId: user?._id || user?.id, authorDisplayName: user?.displayName || user?.username || 'Utilisateur', authorUsername: user?.username || 'user', authorAvatarUrl: user?.avatarUrl || '', content, attachment, createdAt: new Date().toISOString() };
    forcePrivateScrollRef.current = true;
    sendingPrivateRef.current = true;
    setPrivateMessages((prev) => mergeMessages(prev, [optimisticMessage]));
    setPrivateDraft('');
    setIsSendingPrivateMessage(true);
    try {
      const response = await fetch(`${API_URL}/api/social/messages/private/${params.userId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content, attachment }),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible d’envoyer le message privé.');
      forcePrivateScrollRef.current = true;
      setPrivateMessages((prev) => mergeMessages(prev.filter((message) => message._id !== temporaryId), [data.message]));
    } catch (error) {
      setPrivateMessages((prev) => prev.filter((message) => message._id !== temporaryId));
      setPrivateDraft(content);
      setProfileMessage(error.message || 'Impossible d’envoyer le message privé.');
    } finally {
      sendingPrivateRef.current = false;
      setIsSendingPrivateMessage(false);
    }
  };

  const handleModerationAlert = async (targetId, action) => {
    if (!targetId || !user?.canModerate) return;
    const response = await fetch(`${API_URL}/api/social/moderation/reports/${targetId}/${action}`, { method: 'POST', headers: getAuthHeaders() });
    const data = await readJsonResponse(response);
    setProfileMessage(data.message || (response.ok ? (action === 'warn' ? 'Avertissement envoyé et compte marqué suspect.' : 'Dossier ignoré.') : 'Action impossible.'));
    if (response.ok) setPrivateMessages((messages) => messages.map((message) => message.moderationTargetId === targetId ? { ...message, moderationAlert: false } : message));
  };

  const handleCopyReviewLink = async (reportId) => {
    if (!reportId || !user?.canModerate) return;
    const response = await fetch(`${API_URL}/api/social/moderation/reports/${reportId}/review-link`, { method: 'POST', headers: getAuthHeaders() });
    const data = await readJsonResponse(response);
    if (response.ok) { await navigator.clipboard?.writeText(data.link); setProfileMessage('Lien de vérification copié. Il expire dans 15 minutes.'); } else setProfileMessage(data.message || 'Lien indisponible.');
  };

  const officialCommands = [
    { name: '/send', description: 'Envoyer un message officiel à un utilisateur', template: '/send "" ' },
    { name: '/actus', description: 'Envoyer une annonce officielle', template: '/actus ""' },
  ];
  const commandSuggestions = privateChatUser?.isOfficial && privateDraft.startsWith('/')
    ? officialCommands.filter((command) => command.name.startsWith(privateDraft.split(' ')[0]))
    : [];
  const chooseOfficialCommand = (command) => { setPrivateDraft(command.template); setCommandIndex(0); };

  const handleCreateInvite = async (event) => {
    event.preventDefault();
    if (!selectedServer?.id) return;
    try {
      const response = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}/invite`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ duration: inviteDuration }),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible de générer l’invitation.');
      setInvitePreview(data.invite || { link: '', serverId: selectedServer.id, expiresAt: null });
      setInviteMessage('Lien d’invitation prêt.');
    } catch (error) {
      setInviteMessage(error.message || 'Impossible de générer l’invitation.');
    }
  };

  const handleJoinInvite = async (invite) => {
    const serverId = extractServerIdFromInvite(invite);
    if (!serverId) {
      setInviteMessage('Lien d’invitation invalide.');
      return null;
    }
    const inviteUrl = typeof invite === 'string' ? invite : invite?.link || invite?.url || '';
    try {
      const response = await fetch(`${API_URL}/api/social/servers/join`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ serverId, expiresAt: invite?.expiresAt || null }),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible de rejoindre le serveur.');
      setInviteMessage(`Vous avez rejoint ${data.server?.name || 'le serveur'}.`);
      const refreshedServers = await fetch(`${API_URL}/api/social/me`, { headers: getAuthHeaders() });
      const refreshedData = await readJsonResponse(refreshedServers);
      if (refreshedServers.ok) {
        const nextServers = (refreshedData.servers || []).map(normalizeServer);
        setServers(nextServers);
        if (data.server?.id) {
          const joinedServer = normalizeServer({ ...data.server, id: data.server.id });
          setServers((current) => {
            const exists = current.some((server) => String(server.id) === String(joinedServer.id));
            return exists
              ? current.map((server) => (String(server.id) === String(joinedServer.id) ? joinedServer : server))
              : [...current, joinedServer];
          });
          navigate(`/server/${joinedServer.id}`);
        }
      }
      return data.server || null;
    } catch (error) {
      setInviteMessage(error.message || 'Impossible de rejoindre le serveur.');
      return null;
    }
  };

  useEffect(() => {
    if (!user || !params.inviteId) return;
    const joinInviteFromRoute = async () => {
      const inviteString = `${window.location.origin}/invite/${params.inviteId}`;
      await handleJoinInvite(inviteString);
    };
    joinInviteFromRoute();
  }, [user, params.inviteId]);

  useEffect(() => {
    if (!isSettingsModalOpen || !selectedServer?.id) return;
    const loadServerSettings = async () => {
      setServerSettingsMessage('');
      setServerDraft({
        name: selectedServer.name || '',
        description: selectedServer.description || '',
        avatarUrl: selectedServer.avatarUrl || '',
        bannerUrl: selectedServer.bannerUrl || '',
        accent: selectedServer.accent || '',
      });
      setIsBannerEditorOpen(false);
      setServerInviteLink('');
      setCustomInviteSuffix('');
      try {
        const [membersResponse, bansResponse] = await Promise.all([
          fetch(`${API_URL}/api/social/servers/${selectedServer.id}/members`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/api/social/servers/${selectedServer.id}/bans`, { headers: getAuthHeaders() }),
        ]);
        const membersData = await readJsonResponse(membersResponse);
        const bansData = await readJsonResponse(bansResponse);
        if (membersResponse.ok) {
          setServerMembers(membersData.members || []);
        }
        if (bansResponse.ok) {
          setServerBannedMembers(bansData.banned || []);
        }
        const rolesResponse = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}/roles`, { headers: getAuthHeaders() });
        const rolesData = await readJsonResponse(rolesResponse);
        if (rolesResponse.ok) {
          setServerRoles(rolesData.roles || []);
          setServerPermissions(rolesData.permissions || []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadServerSettings();
  }, [isSettingsModalOpen, selectedServer?.id, getAuthHeaders]);

  const handleUpdateServerSettings = async (event) => {
    event.preventDefault();
    if (!selectedServer?.id) return;
    try {
      setIsUpdatingServer(true);
      setServerSettingsMessage('');
      const response = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(serverDraft),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible de mettre à jour le serveur.');
      const updatedServer = normalizeServer({
        ...selectedServer,
        ...data.server,
      });
      invalidateServerSummary(updatedServer.id);
      setServers((prev) => prev.map((server) => (server.id === updatedServer.id ? updatedServer : server)));
      setServerSettingsMessage('Paramètres du serveur mis à jour.');
    } catch (error) {
      setServerSettingsMessage(error.message || 'Impossible de mettre à jour le serveur.');
    } finally {
      setIsUpdatingServer(false);
    }
  };

  const updateServerStructure = async (path, method, body, successMessage) => {
    if (!selectedServer?.id) return null;
    const response = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}${path}`, { method, headers: getAuthHeaders(), body: body ? JSON.stringify(body) : undefined });
    const data = await readJsonResponse(response);
    if (!response.ok) throw new Error(data.message || 'Impossible de modifier les salons.');
    const updatedServer = { ...selectedServer, structure: data.structure };
    setServers((current) => current.map((server) => String(server.id) === String(updatedServer.id) ? updatedServer : server));
    setMessage(successMessage);
    return data.structure;
  };

  const handleCreateChannel = async (category) => {
    const name = window.prompt('Nom du salon', 'nouveau-salon');
    if (!name?.trim()) return;
    const type = window.confirm('Créer un salon vocal ? Cliquer sur Annuler pour un salon texte.') ? 'voice' : 'text';
    try { await updateServerStructure(`/categories/${category.id}/channels`, 'POST', { name: name.trim(), type }, 'Salon créé.'); } catch (error) { setMessage(error.message); }
  };

  const handleEditChannel = async (channel) => {
    const name = window.prompt('Nouveau nom du salon', channel.name);
    if (!name?.trim() || name.trim() === channel.name) return;
    try { await updateServerStructure(`/channels/${channel.id}`, 'PATCH', { name: name.trim() }, 'Salon renommé.'); } catch (error) { setMessage(error.message); }
  };

  const handleDeleteChannel = async (channel) => {
    if (!window.confirm(`Supprimer le salon « ${channel.name} » ?`)) return;
    try {
      const structure = await updateServerStructure(`/channels/${channel.id}`, 'DELETE', null, 'Salon supprimé.');
      if (String(activeChannelId) === String(channel.id)) {
        const firstChannel = structure.categories.flatMap((category) => category.channels || [])[0];
        navigate(firstChannel ? `/server/${selectedServer.id}/channel/${firstChannel.id}` : `/server/${selectedServer.id}`);
      }
    } catch (error) { setMessage(error.message); }
  };

  const handleCreateCategory = async () => {
    const name = window.prompt('Nom de la catégorie', 'Nouvelle catégorie');
    if (!name?.trim()) return;
    try { await updateServerStructure('/categories', 'POST', { name: name.trim() }, 'Catégorie créée.'); } catch (error) { setMessage(error.message); }
  };

  const handleEditCategory = async (category) => {
    const name = window.prompt('Nouveau nom de la catégorie', category.name);
    if (!name?.trim() || name.trim() === category.name) return;
    try { await updateServerStructure(`/categories/${category.id}`, 'PATCH', { name: name.trim() }, 'Catégorie renommée.'); } catch (error) { setMessage(error.message); }
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Supprimer la catégorie « ${category.name} » et ses salons ?`)) return;
    try {
      const structure = await updateServerStructure(`/categories/${category.id}`, 'DELETE', null, 'Catégorie supprimée.');
      if (category.channels?.some((channel) => String(channel.id) === String(activeChannelId))) {
        const firstChannel = structure.categories.flatMap((item) => item.channels || [])[0];
        navigate(firstChannel ? `/server/${selectedServer.id}/channel/${firstChannel.id}` : `/server/${selectedServer.id}`);
      }
    } catch (error) { setMessage(error.message); }
  };

  const saveRole = async (event, draftOverride = roleDraft) => {
    event.preventDefault();
    if (!selectedServer?.id || !draftOverride.name.trim()) return;
    const editing = Boolean(draftOverride.id);
    const response = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}/roles${editing ? `/${draftOverride.id}` : ''}`, {
      method: editing ? 'PUT' : 'POST', headers: getAuthHeaders(), body: JSON.stringify(draftOverride),
    });
    const data = await readJsonResponse(response);
    if (!response.ok) { setServerSettingsMessage(data.message || 'Impossible de sauvegarder le rôle.'); return; }
    setServerRoles((current) => editing ? current.map((role) => role._id === data.role._id ? data.role : role) : [...current, data.role]);
    setRoleDraft({ id: null, name: '', color: '#99aab5', iconUrl: '', hoist: false, permissions: [] });
    setServerSettingsMessage('Rôle sauvegardé.');
    if (selectedServer?.id) {
      const membersResponse = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}/members`, { headers: getAuthHeaders() });
      const membersData = await readJsonResponse(membersResponse); if (membersResponse.ok) setServerMembers(membersData.members || []);
    }
  };

  const handleRoleIconFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setServerSettingsMessage('L’icône doit être une image.'); return; }
    if (file.size > 2 * 1024 * 1024) { setServerSettingsMessage('L’icône ne doit pas dépasser 2 Mo.'); return; }
    try {
      const url = await uploadFile(file, { folder: 'role-icons', getAuthHeaders });
      setRoleDraft((current) => ({ ...current, iconUrl: url }));
    } catch (error) {
      setServerSettingsMessage(error.message || 'Impossible de lire ce fichier.');
    }
  };

  const deleteRole = async (role) => {
    if (role.isEveryone || !window.confirm(`Supprimer le rôle « ${role.name} » ?`)) return;
    const response = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}/roles/${role._id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await readJsonResponse(response);
    if (!response.ok) { setServerSettingsMessage(data.message || 'Impossible de supprimer le rôle.'); return; }
    setServerRoles((current) => current.filter((item) => item._id !== role._id)); setServerSettingsMessage('Rôle supprimé.');
  };

  const moveRole = async (role, direction) => {
    if (!selectedServer?.id || role.isEveryone) return;
    const response = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}/roles/${role._id}/position`, { method: 'PATCH', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ direction }) });
    const data = await readJsonResponse(response);
    if (!response.ok) { setServerSettingsMessage(data.message || 'Impossible de déplacer le rôle.'); return; }
    setServerRoles(data.roles || []);
    setServerSettingsMessage('Hiérarchie des rôles mise à jour.');
  };

  const handleGenerateServerInvite = async (event) => {
    event.preventDefault();
    if (!selectedServer?.id) return;
    try {
      setIsGeneratingServerInvite(true);
      setServerSettingsMessage('');
      const response = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}/invite`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ duration: inviteDuration, customCode: customInviteSuffix }),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible de générer le lien d’invitation.');
      setServerInviteLink(data.invite?.link || '');
      setServerSettingsMessage('Lien d’invitation généré.');
    } catch (error) {
      setServerSettingsMessage(error.message || 'Impossible de générer le lien d’invitation.');
    } finally {
      setIsGeneratingServerInvite(false);
    }
  };

  const handleBanMember = async (memberId) => {
    if (!selectedServer?.id) return;
    try {
      const response = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}/ban/${memberId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible de bannir le membre.');
      setServerSettingsMessage(data.message || 'Membre banni.');
      setServerMembers((prev) => prev.filter((member) => member.id !== memberId));
      setServerBannedMembers((prev) => [...prev, serverMembers.find((member) => member.id === memberId)].filter(Boolean));
    } catch (error) {
      setServerSettingsMessage(error.message || 'Impossible de bannir le membre.');
    }
  };

  const handleUnbanMember = async (memberId) => {
    if (!selectedServer?.id) return;
    try {
      const response = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}/unban/${memberId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible de débannir le membre.');
      setServerSettingsMessage(data.message || 'Utilisateur débanni.');
      setServerBannedMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (error) {
      setServerSettingsMessage(error.message || 'Impossible de débannir le membre.');
    }
  };

  const handleKickMember = async (memberId) => {
    if (!selectedServer?.id) return;
    try {
      const response = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}/kick/${memberId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible d’expulser le membre.');
      setServerSettingsMessage(data.message || 'Membre expulsé.');
      setServerMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (error) {
      setServerSettingsMessage(error.message || 'Impossible d’expulser le membre.');
    }
  };

  const handleMuteMember = async (memberId) => {
    if (!selectedServer?.id || !memberId) return 'Aucune action de mute disponible pour ce membre.';
    setServerSettingsMessage('Le mute des membres n’est pas encore branché sur la version active.');
    return 'Mute non disponible pour le moment.';
  };

  const handleSendMessage = async (event, attachment) => {
    event.preventDefault();
    if ((!draftMessage.trim() && !attachment) || !selectedServer?.id || !activeChannelId || activeChannel?.type !== 'text') return;
    const content = draftMessage.trim();
    const temporaryId = `pending-channel-${Date.now()}`;
    const optimisticMessage = { _id: temporaryId, id: temporaryId, isPending: true, authorId: user?._id || user?.id, authorDisplayName: user?.displayName || user?.username || 'Utilisateur', authorUsername: user?.username || 'user', authorAvatarUrl: user?.avatarUrl || '', content, attachment, createdAt: new Date().toISOString() };
    forceChannelScrollRef.current = true;
    setChannelMessages((prev) => mergeMessages(prev, [optimisticMessage]));
    setDraftMessage('');
    setIsSendingMessage(true);
    try {
      const response = await fetch(`${API_URL}/api/social/servers/${selectedServer.id}/messages/${activeChannelId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content, attachment }),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible d’envoyer le message.');
      forceChannelScrollRef.current = true;
      setChannelMessages((prev) => mergeMessages(prev.filter((message) => message._id !== temporaryId), [{
        ...data.message,
        authorDisplayName: user?.displayName || data.message.authorDisplayName || data.message.authorName || user?.username || 'Utilisateur',
        authorUsername: user?.username || data.message.authorUsername || 'user',
        authorAvatarUrl: user?.avatarUrl || data.message.authorAvatarUrl || '',
      }]));
    } catch (error) {
      setChannelMessages((prev) => prev.filter((message) => message._id !== temporaryId));
      setDraftMessage(content);
      setMediaError(error.message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const openMessageContext = (event, message, isPrivate = false) => {
    event.preventDefault();
    setMessageContext({ x: event.clientX, y: event.clientY, message, isPrivate });
  };

  const editMessage = async () => {
    if (!editingMessageId || !editingMessageDraft.trim()) return;
    const response = await fetch(`${API_URL}/api/social/messages/${editingMessageId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ content: editingMessageDraft.trim() }) });
    const data = await readJsonResponse(response);
    if (!response.ok) { setMediaError(data.message || 'Impossible de modifier le message.'); return; }
    const update = (messages) => messages.map((message) => message._id === data.message._id ? { ...message, ...data.message } : message);
    if (editingMessageIsPrivate) setPrivateMessages(update); else setChannelMessages(update);
    setEditingMessageId(null); setMessageContext(null);
  };

  const deleteMessage = async () => {
    const message = messageContext?.message;
    if (!message?._id || !window.confirm('Supprimer ce message ?')) return;
    const response = await fetch(`${API_URL}/api/social/messages/${message._id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await readJsonResponse(response);
    if (!response.ok) { setMediaError(data.message || 'Impossible de supprimer le message.'); return; }
    if (messageContext.isPrivate) setPrivateMessages((messages) => messages.filter((item) => item._id !== message._id)); else setChannelMessages((messages) => messages.filter((item) => item._id !== message._id));
    setMessageContext(null);
  };

  const applyVoiceChannelState = (channelId, nextState) => {
    setVoiceChannelStates((prev) => ({ ...prev, [channelId]: nextState }));
    if (activeChannelId === channelId) {
      setVoiceState(nextState);
      voiceSocketRef.current?.emit('voice:state', { micOn: nextState.micOn, cameraOn: nextState.cameraOn, streaming: nextState.streaming });
    }
  };

  const handleJoinVoice = async () => {
    if (!activeChannelId) return;
    const currentState = voiceChannelStates[activeChannelId] || { joined: false, micOn: true, cameraOn: false, streaming: false };
    if (currentState.joined) {
      applyVoiceChannelState(activeChannelId, { ...currentState, joined: false, cameraOn: false, streaming: false });
      setActiveVoiceChannelId(null);
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      if (shareStream) {
        shareStream.getTracks().forEach((track) => track.stop());
        setShareStream(null);
      }
      return;
    }
    try {
      setMediaError('');
      const voicePreferences = user?.voiceVideo || {};
      const audioConstraints = {
        echoCancellation: voicePreferences.echoCancellation !== false,
        noiseSuppression: voicePreferences.noiseSuppression !== false,
        autoGainControl: voicePreferences.autoGainControl !== false,
        channelCount: 1,
        ...(voicePreferences.inputDeviceId ? { deviceId: { exact: voicePreferences.inputDeviceId } } : {}),
      };
      const hasVideo = voicePreferences.cameraEnabled === true;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: hasVideo ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      });
      setLocalStream(stream);
      setActiveVoiceChannelId(activeChannelId);
      applyVoiceChannelState(activeChannelId, { ...currentState, joined: true, cameraOn: hasVideo, micOn: true, streaming: false });
    } catch (error) {
      setMediaError(error.message || 'Impossible d’activer le micro.');
    }
  };

  const handleToggleMic = () => {
    if (!activeChannelId) return;
    const currentState = voiceChannelStates[activeChannelId] || { joined: false, micOn: true, cameraOn: false, streaming: false };
    if (!currentState.joined) return;
    if (!localStream) {
      applyVoiceChannelState(activeChannelId, { ...currentState, micOn: !currentState.micOn });
      return;
    }
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      applyVoiceChannelState(activeChannelId, { ...currentState, micOn: audioTrack.enabled });
    }
  };

  const handleToggleCamera = async () => {
    if (!activeChannelId) return;
    const currentState = voiceChannelStates[activeChannelId] || { joined: false, micOn: true, cameraOn: false, streaming: false };
    if (!currentState.joined) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack && !currentState.cameraOn) {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } });
        const cameraTrack = cameraStream.getVideoTracks()[0];
        const nextStream = new MediaStream([...localStream.getAudioTracks(), cameraTrack]);
        setLocalStream(nextStream);
        peerConnectionsRef.current.forEach((peer) => peer.addTrack(cameraTrack, nextStream));
        applyVoiceChannelState(activeChannelId, { ...currentState, cameraOn: true });
      } catch (error) { setVoiceError(error.message || 'Caméra indisponible.'); }
      return;
    }
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      applyVoiceChannelState(activeChannelId, { ...currentState, cameraOn: videoTrack.enabled });
    }
  };

  const handleShareScreen = async () => {
    if (!activeChannelId) return;
    const currentState = voiceChannelStates[activeChannelId] || { joined: false, micOn: true, cameraOn: false, streaming: false };
    if (currentState.streaming && shareStream) {
      shareStream.getTracks().forEach((track) => track.stop());
      setShareStream(null);
      applyVoiceChannelState(activeChannelId, { ...currentState, streaming: false });
      return;
    }
    try {
      setMediaError('');
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      setShareStream(stream);
      applyVoiceChannelState(activeChannelId, { ...currentState, streaming: true });
    } catch (error) {
      setMediaError(error.message || 'Le partage d’écran a été annulé.');
    }
  };

  const refreshAudioDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    setAudioDevices({ inputs: devices.filter((device) => device.kind === 'audioinput'), outputs: devices.filter((device) => device.kind === 'audiooutput') });
  };

  const handleInputDeviceChange = async (event) => {
    if (!localStream || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: event.target.value }, echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
      const nextTrack = nextStream.getAudioTracks()[0];
      localStream.getAudioTracks().forEach((track) => track.stop());
      const nextMediaStream = new MediaStream([...localStream.getVideoTracks(), nextTrack]);
      setLocalStream(nextMediaStream);
      peerConnectionsRef.current.forEach((peer) => { const sender = peer.getSenders().find((item) => item.track?.kind === 'audio'); sender?.replaceTrack(nextTrack); });
    } catch (error) { setVoiceError(error.message || 'Impossible de changer de microphone.'); }
  };

  const hasVideoPreview = Boolean(localStream?.getVideoTracks().length && localStream.getVideoTracks().some((track) => track.readyState === 'live'));

  const openProfileModal = async (profileUser = null, isSelfProfile = false) => {
    const requestId = profileRequestIdRef.current + 1;
    profileRequestIdRef.current = requestId;
    setProfileTarget(null);
    setProfileDraft({ displayName: '', username: '', bio: '', avatarUrl: '', bannerUrl: '', activity: null, avatarDecoration: null, nameplate: 'none' });
    const loadAudioActivity = async (targetId) => {
      if (!targetId) return null;
      try {
        const [audioResponse, spotifyResponse] = await Promise.all([
          fetch(`${API_URL}/api/social/users/${targetId}/audio-activity`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/api/auth/spotify/activity/${targetId}`, { headers: getAuthHeaders() }),
        ]);

        const audioData = audioResponse.ok ? await readJsonResponse(audioResponse) : { activity: null };
        const spotifyData = spotifyResponse.ok ? await readJsonResponse(spotifyResponse) : { activity: null };

        if (spotifyData?.activity) {
          return { ...spotifyData.activity, connected: true, source: 'spotify' };
        }

        if (spotifyData?.connected) {
          return { connected: true, source: 'spotify', title: 'Spotify connecté', artist: 'Aucune lecture active' };
        }

        return audioData?.activity || null;
      } catch {
        return null;
      }
    };
    if (isSelfProfile) {
      const sourceProfile = user || {};
      const sourceUserId = sourceProfile._id || sourceProfile.id;
      const audioActivity = await loadAudioActivity(sourceUserId);
      setProfileTarget({ ...sourceProfile, audioActivity, isSelf: true });
      setProfileDraft({
        displayName: sourceProfile.displayName || sourceProfile.username || 'Utilisateur',
        username: sourceProfile.username || 'user',
        bio: sourceProfile.bio || '',
        avatarUrl: sourceProfile.avatarUrl || '',
        bannerUrl: sourceProfile.bannerUrl || '',
        activity: sourceProfile.activity || null,
        avatarDecoration: sourceProfile.avatarDecoration || null,
        nameplate: sourceProfile.nameplate || 'none',
      });
      setProfileMessage('');
      setIsProfileModalOpen(true);
      return;
    }
    const targetId = profileUser?.authorId || profileUser?.userId || profileUser?.id || profileUser?._id || null;
    const currentUserId = user?._id || user?.id;
    const isCurrentUserFriend = (profileUser) => {
      const targetUserId = profileUser?.authorId || profileUser?.userId || profileUser?.id || profileUser?._id;
      if (!targetUserId) return false;
      const friendIds = new Set((friends || []).map((friend) => String(friend.id || friend._id)));
      return friendIds.has(String(targetUserId));
    };
    const isCurrentUserBlocked = (profileUser) => {
      const targetUserId = profileUser?.authorId || profileUser?.userId || profileUser?.id || profileUser?._id;
      if (!targetUserId) return false;
      const blockedIds = new Set((user?.blockedUsers || []).map((item) => String(item)));
      return blockedIds.has(String(targetUserId));
    };
    const isCurrentUserBlockedByTarget = (profileUser) => {
      const targetUserId = profileUser?.authorId || profileUser?.userId || profileUser?.id || profileUser?._id;
      if (!targetUserId) return false;
      const blockedByIds = new Set((profileUser?.blockedBy || []).map((item) => String(item)));
      return blockedByIds.has(String(currentUserId));
    };
    if (!targetId) {
      const fallbackProfile = profileUser || {};
      const resolvedProfile = {
        ...fallbackProfile,
        id: fallbackProfile.id || fallbackProfile._id || targetId,
        _id: fallbackProfile._id || fallbackProfile.id || targetId,
        isSelf: false,
        isFriend: isCurrentUserFriend(fallbackProfile),
        isBlocked: isCurrentUserBlocked(fallbackProfile) || isCurrentUserBlockedByTarget(fallbackProfile),
        isBlockedByMe: isCurrentUserBlocked(fallbackProfile),
        isBlockedByThem: isCurrentUserBlockedByTarget(fallbackProfile),
      };
      setProfileTarget(resolvedProfile);
      setProfileDraft({
        displayName: fallbackProfile.displayName || fallbackProfile.username || 'Utilisateur',
        username: fallbackProfile.username || 'user',
        bio: fallbackProfile.bio || '',
        avatarUrl: fallbackProfile.avatarUrl || '',
        bannerUrl: fallbackProfile.bannerUrl || '',
        activity: fallbackProfile.activity || null,
        avatarDecoration: fallbackProfile.avatarDecoration || null,
        nameplate: fallbackProfile.nameplate || 'none',
      });
      setProfileMessage('');
      setIsProfileModalOpen(true);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/social/profile/${targetId}`, { headers: getAuthHeaders() });
      const data = await readJsonResponse(response);
      if (requestId !== profileRequestIdRef.current) return;
      if (!response.ok) {
        if (response.status === 404 && profileUser) {
          const fallbackProfile = profileUser || {};
          const resolvedProfile = {
            ...fallbackProfile,
            id: targetId,
            _id: targetId,
            isSelf: false,
            isFriend: isCurrentUserFriend(fallbackProfile),
            isBlocked: isCurrentUserBlocked(fallbackProfile) || isCurrentUserBlockedByTarget(fallbackProfile),
            isBlockedByMe: isCurrentUserBlocked(fallbackProfile),
            isBlockedByThem: isCurrentUserBlockedByTarget(fallbackProfile),
          };
          setProfileTarget(resolvedProfile);
          setProfileDraft({
            displayName: fallbackProfile.displayName || fallbackProfile.username || 'Utilisateur',
            username: fallbackProfile.username || 'user',
            bio: fallbackProfile.bio || '',
            avatarUrl: fallbackProfile.avatarUrl || '',
            bannerUrl: fallbackProfile.bannerUrl || '',
            activity: fallbackProfile.activity || null,
            avatarDecoration: fallbackProfile.avatarDecoration || null,
            nameplate: fallbackProfile.nameplate || 'none',
          });
          setProfileMessage('');
          setIsProfileModalOpen(true);
          return;
        }
        throw new Error(data.message || 'Impossible de charger le profil.');
      }
      const sourceProfile = data.user || {};
      const audioActivity = await loadAudioActivity(sourceProfile._id || sourceProfile.id || targetId);
      const sourceUserId = sourceProfile.id || sourceProfile._id || targetId;
      const targetStatusProfile = {
        ...(profileUser || {}),
        ...sourceProfile,
        audioActivity,
        isSelf: String(sourceUserId) === String(currentUserId),
        isFriend: (friends || []).some((friend) => String(friend.id || friend._id) === String(sourceUserId)) || (user?.friends || []).some((friendId) => String(friendId) === String(sourceUserId)),
        isBlocked: (user?.blockedUsers || []).some((blockedId) => String(blockedId) === String(sourceUserId)) || (sourceProfile?.blockedBy || []).some((blockedById) => String(blockedById) === String(currentUserId)),
        isBlockedByMe: (user?.blockedUsers || []).some((blockedId) => String(blockedId) === String(sourceUserId)),
        isBlockedByThem: (sourceProfile?.blockedBy || []).some((blockedById) => String(blockedById) === String(currentUserId)),
      };
      setProfileTarget(targetStatusProfile);
      setProfileDraft({
        displayName: sourceProfile.displayName || sourceProfile.username || 'Utilisateur',
        username: sourceProfile.username || 'user',
        bio: sourceProfile.bio || '',
        avatarUrl: sourceProfile.avatarUrl || '',
        bannerUrl: sourceProfile.bannerUrl || '',
        activity: sourceProfile.activity || null,
        avatarDecoration: sourceProfile.avatarDecoration || null,
        nameplate: sourceProfile.nameplate || 'none',
      });
      setProfileMessage('');
      setIsProfileModalOpen(true);
    } catch (error) {
      console.error(error);
      if (requestId !== profileRequestIdRef.current) return;
      const fallbackProfile = profileUser || user || {};
      const resolvedFallbackProfile = {
        ...fallbackProfile,
        id: targetId,
        _id: targetId,
        isSelf: false,
        isFriend: (friends || []).some((friend) => String(friend.id || friend._id) === String(targetId)) || (user?.friends || []).some((friendId) => String(friendId) === String(targetId)),
        isBlocked: (user?.blockedUsers || []).some((blockedId) => String(blockedId) === String(targetId)) || (fallbackProfile?.blockedBy || []).some((blockedById) => String(blockedById) === String(currentUserId)),
        isBlockedByMe: (user?.blockedUsers || []).some((blockedId) => String(blockedId) === String(targetId)),
        isBlockedByThem: (fallbackProfile?.blockedBy || []).some((blockedById) => String(blockedById) === String(currentUserId)),
      };
      setProfileTarget(resolvedFallbackProfile);
      setProfileDraft({
        displayName: fallbackProfile.displayName || fallbackProfile.username || 'Utilisateur',
        username: fallbackProfile.username || 'user',
        bio: fallbackProfile.bio || '',
        avatarUrl: fallbackProfile.avatarUrl || '',
        bannerUrl: fallbackProfile.bannerUrl || '',
        activity: fallbackProfile.activity || null,
        avatarDecoration: fallbackProfile.avatarDecoration || null,
        nameplate: fallbackProfile.nameplate || 'none',
      });
      setProfileMessage(error.message || 'Impossible de charger le profil.');
      setIsProfileModalOpen(true);
    }
  };

  const handleProfileImageChange = async (event, kind) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const folder = kind === 'bannerUrl' ? 'banners' : 'avatars';
      const url = await uploadFile(file, { folder, getAuthHeaders });
      setProfileDraft((prev) => ({ ...prev, [kind]: url }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleServerImageChange = async (event, kind) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const folder = kind === 'bannerUrl' ? 'server-banners' : 'server-avatars';
      const url = await uploadFile(file, { folder, getAuthHeaders });
      setServerDraft((prev) => ({ ...prev, [kind]: url }));
    } catch (error) {
      console.error(error);
    }
  };

  // Dans AppHomePage.jsx, modifie la fonction handleSaveProfile
  const handleSaveProfile = async (event, draftOverride = profileDraft) => {
    event?.preventDefault();
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/api/social/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          displayName: draftOverride.displayName.trim() || user.username || 'Utilisateur',
          username: draftOverride.username.trim() || user.username || 'user',
          bio: draftOverride.bio.trim(),
          avatarUrl: draftOverride.avatarUrl,
          bannerUrl: draftOverride.bannerUrl,
          activity: draftOverride.activity,
          status: draftOverride.status || user.status || 'En ligne',
          avatarDecoration: draftOverride.avatarDecoration || user?.avatarDecoration || null,
          nameplate: draftOverride.nameplate || user?.nameplate || 'none',
        }),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.message || 'Impossible de sauvegarder le profil.');
      const nextUser = { ...user, ...data.user };
      updateUser(nextUser);
      setProfileTarget({ ...nextUser, isSelf: true });
      setProfileDraft({
        displayName: nextUser.displayName || nextUser.username || 'Utilisateur',
        username: nextUser.username || 'user',
        bio: nextUser.bio || '',
        avatarUrl: nextUser.avatarUrl || '',
        bannerUrl: nextUser.bannerUrl || '',
        activity: nextUser.activity || null,
        avatarDecoration: nextUser.avatarDecoration || null,
        nameplate: nextUser.nameplate || 'none',
      });
      setProfileMessage('Profil mis à jour.');
      await refreshSocial();
      setAvatarTimestamp(Date.now());
      return 'Profil mis à jour.';
    } catch (error) {
      setProfileMessage(error.message || 'Impossible de sauvegarder le profil.');
      return error.message || 'Impossible de sauvegarder le profil.';
    }
  };

  const sortedFriends = [...friends].sort((a, b) => {
    const nameA = (a.displayName || a.username || '').toLowerCase();
    const nameB = (b.displayName || b.username || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const filteredFriends = sortedFriends.filter(friend => {
    const name = (friend.displayName || friend.username || '').toLowerCase();
    return name.includes(friendSearch.toLowerCase());
  });

  const settingsCategories = [
    { id: 'compte', icon: User, label: 'Compte' },
    { id: 'contenu', icon: Bell, label: 'Contenu et social' },
    { id: 'confidentialite', icon: Shield, label: 'Données et confidentialité' },
    { id: 'applications', icon: Code, label: 'Applications autorisées' },
    { id: 'connexions', icon: Link, label: 'Connexions' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'volt', icon: Crown, label: 'Volt' },
    { id: 'boost', icon: Sparkles, label: 'Boost de serveur' },
    { id: 'abonnements', icon: CreditCard, label: 'Abonnements' },
    { id: 'cadeaux', icon: Gift, label: 'Inventaire des cadeaux' },
    { id: 'facturation', icon: CreditCard, label: 'Facturation' },
    { id: 'voix', icon: Volume2, label: 'Voix & Vidéo' },
    { id: 'apparence', icon: Eye, label: 'Apparence' },
    { id: 'accessibilite', icon: UserCircle, label: 'Accessibilité' },
    { id: 'systeme', icon: Monitor, label: 'Système' },
    { id: 'langue', icon: Languages, label: 'Langue et heure' },
    { id: 'activite', icon: Gamepad2, label: 'Confidentialité des activités' },
    { id: 'developpeur', icon: Code, label: 'Développeur' },
  ];

  const handleOpenProfile = useCallback((profile) => {
    openProfileModal(profile);
  }, [openProfileModal]);
  
  const handleToggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((open) => !open);
  }, []);
  
  const handleOpenServer = useCallback((server) => {
    openServer(server);
  }, [openServer]);
  
  const handleOpenHome = useCallback(() => {
    navigate('/home');
  }, [navigate]);
  
  const handleOpenChannel = useCallback((channelId) => {
    navigate(`/server/${selectedServer?.id}/channel/${channelId}`);
    setIsMobileSidebarOpen(false);
  }, [navigate, selectedServer?.id]);
  
  const handleOpenProfileModal = useCallback((profile, isSelf = false) => {
    openProfileModal(profile, isSelf);
  }, [openProfileModal]);
  
  const handleOpenDirectMessage = useCallback((targetUserId) => {
    openDirectMessage(targetUserId);
  }, [openDirectMessage]);
  
  const handleOpenSettings = useCallback(() => {
    openAccountSettings();
  }, [openAccountSettings]);
  
  const handleOpenServerSettings = useCallback(() => {
    openServerSettingsFor();
  }, [openServerSettingsFor]);
  
  const handleOpenInvite = useCallback(() => {
    setIsInviteModalOpen(true);
  }, []);
  
  const handleOpenCreateServerModal = useCallback(() => {
    setIsServerModalOpen(true);
  }, []);
  
  const handleJoinServer = useCallback(() => {
    setIsServerModalOpen(true);
  }, []);
  
  const handleOpenFriendModal = useCallback(() => {
    setIsFriendModalOpen(true);
  }, []);

  return (
    <div className={`tavora-app-shell flex h-screen flex-col overflow-hidden text-white ${selectedServer ? 'tavora-server-shell' : ''}`}>
    <GlobalTopBar
      getAuthHeaders={getAuthHeaders}
      user={user}
      userId={user?._id || user?.id}
      onOpenProfile={handleOpenProfile}
      onToggleMobileSidebar={handleToggleMobileSidebar}
      liveNotifications={liveNotifications}
      isLiveNotificationsOpen={isLiveNotificationsOpen}
      setIsLiveNotificationsOpen={setIsLiveNotificationsOpen}
      openDirectMessage={openDirectMessage}
    />
      <div className="tavora-workspace flex min-h-0 flex-1 overflow-visible">
        <aside className="tavora-server-rail flex w-[64px] flex-col items-center justify-between py-2 shrink-0">
          <div className="flex flex-col items-center gap-2 w-full">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#15151b] text-sm font-semibold cursor-pointer border border-white/5"
              onClick={() => navigate('/home')}
            >
              {user?.avatarUrl && !homeAvatarFailed ? (
                <img
                  src={user.avatarUrl}
                  alt={`Avatar de ${user.displayName || user.username || 'mon profil'}`}
                  className="h-full w-full object-cover"
                  onError={() => setHomeAvatarFailed(true)}
                />
              ) : (
                <span className="text-base font-semibold text-white/60">{(user?.displayName || user?.username || 'U').charAt(0).toUpperCase()}</span>
              )}
            </motion.div>

            <div className="w-8 h-px bg-white/5" />
            <div className="flex flex-col items-center gap-1 w-full px-[14px]">
              {servers.length > 0 ? servers.map((server) => (
                <motion.button
                  key={server.id}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openServer(server)}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                    selectedServer?.id === server.id 
                      ? 'bg-[#2a2a38] text-white border border-white/10' 
                      : 'bg-[#1a1a24] text-white/40 hover:bg-[#2a2a38] hover:text-white border border-white/5'
                  }`}
                  aria-label={server.name}
                  title={server.name}
                >
                  <ServerIcon server={server} timestamp={avatarTimestamp} />
                  <span className="pointer-events-none absolute left-14 top-1/2 z-[60] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#171722] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
                    {server.name}
                  </span>
                  {server.unread && (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-[#0a0a0f]" />
                  )}
                  {liveNotifications.servers.some((item) => String(item.serverId) === String(server.id)) ? <span className="absolute -left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white" title="Messages non lus" /> : null}
                </motion.button>
              )) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-white/5 bg-[#1a1a24] text-white/20">
                  •
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsServerModalOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#15151b] text-white/40 transition-all duration-200 hover:border-indigo-500/50 hover:text-white hover:bg-[#202027]"
            >
              <Plus size={20} />
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#15151b] text-white/40 transition-all duration-200 hover:bg-rose-500/20 hover:text-rose-400 border border-white/5"
            title="Se déconnecter"
          >
            <LogOut size={20} />
          </motion.button>
        </aside>

        <nav className="tavora-mobile-bottom-nav" aria-label="Navigation mobile">
          <button type="button" onClick={() => { setPrivateChatUser(null); navigate('/home'); }} className={!selectedServer && !params.userId ? 'is-active' : ''} aria-label="Accueil" title="Accueil"><Home size={18} /><span>Accueil</span></button>
          <div className="tavora-mobile-server-list">
            {servers.map((server) => <button key={server.id} type="button" onClick={() => openServer(server)} className={selectedServer?.id === server.id ? 'is-active' : ''} aria-label={server.name} title={server.name}><span className="tavora-mobile-server-icon"><ServerIcon server={server} timestamp={avatarTimestamp} /></span></button>)}
            <button type="button" onClick={() => setIsServerModalOpen(true)} aria-label="Créer ou rejoindre un serveur" title="Créer ou rejoindre un serveur"><Plus size={18} /></button>
          </div>
          <button type="button" onClick={() => setIsMobileSidebarOpen((open) => !open)} className={isMobileSidebarOpen ? 'is-active' : ''} aria-label="Ouvrir les salons" title="Ouvrir les salons"><Menu size={18} /><span>Salons</span></button>
        </nav>

        {isMobileSidebarOpen ? <button type="button" aria-label="Fermer le menu" className="tavora-mobile-sidebar-backdrop" onClick={() => setIsMobileSidebarOpen(false)} /> : null}
        <WorkspaceSidebar
          className={isMobileSidebarOpen ? 'tavora-navigation-mobile-open' : ''}
          selectedServer={selectedServer}
          servers={servers}
          activeChannelId={activeChannelId}
          isDmMode={Boolean(params.userId)}
          friends={filteredFriends}
          friendSearch={friendSearch}
          onFriendSearchChange={setFriendSearch}
          onOpenServer={handleOpenServer}
          onOpenHome={handleOpenHome}
          onOpenChannel={handleOpenChannel}
          onOpenProfile={handleOpenProfileModal}
          onOpenDirectMessage={handleOpenDirectMessage}
          user={user}
          onOpenSettings={handleOpenSettings}
          isServerOwner={isServerOwner || serverPermissions.includes('ADMINISTRATOR') || serverPermissions.includes('MANAGE_SERVER')}
          canManageChannels={isServerOwner || serverPermissions.includes('ADMINISTRATOR') || serverPermissions.includes('MANAGE_CHANNELS')}
          onCreateChannel={handleCreateChannel}
          onEditChannel={handleEditChannel}
          onDeleteChannel={handleDeleteChannel}
          onCreateCategory={handleCreateCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onOpenServerSettings={handleOpenServerSettings}
          onOpenInvite={handleOpenInvite}
          onCreateServer={handleOpenCreateServerModal}
          onJoinServer={handleJoinServer}
          onOpenFriendModal={handleOpenFriendModal}
          incomingRequests={incomingRequests}
          onFriendRequestDecision={handleFriendRequestDecision}
        />

        {false ? (
          <aside className="tavora-navigation flex w-72 flex-col shrink-0">
            <div className="border-b border-white/5 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-medium">Bienvenue</p>
              <div className="mt-1.5 flex items-center gap-3 cursor-pointer" onClick={() => openProfileModal(user, true)}>
                <div className="h-9 w-9 overflow-hidden rounded-full border border-white/5 bg-[#1a1a24] flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User size={18} className="text-white/30" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-medium text-white">{user?.displayName || user?.username || 'Utilisateur'}</h2>
                  <p className="text-[10px] text-white/30">@{user?.username || 'user'}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <div className="rounded-xl border border-white/5 bg-[#13131c] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-white/40 flex items-center gap-2 uppercase tracking-wider">
                    <Users size={14} className="text-indigo-400/60" />
                    Amis
                  </p>
                  <button 
                    onClick={() => setIsFriendModalOpen(true)}
                    className="text-[11px] text-indigo-400/60 hover:text-indigo-400 transition flex items-center gap-1"
                  >
                    <UserPlus size={14} />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {filteredFriends.length > 0 ? filteredFriends.slice(0, 10).map((friend) => (
                    <motion.div
                      key={friend.id}
                      whileHover={{ x: 4 }}
                      onClick={() => openProfileModal(friend, false)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openProfileModal(friend, false);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="flex w-full items-center justify-between rounded-xl bg-[#1a1a24] px-3 py-2 text-sm text-white/60 hover:bg-[#222233] transition cursor-pointer border border-white/5"
                    >
                      <span className="flex items-center gap-2.5">
                        <AvatarWithDecoration user={friend} size={28} />
                        <DisplayNameWithNameplate user={friend} className="text-sm font-medium" />
                      </span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={(event) => { event.stopPropagation(); openDirectMessage(friend.id); }} className="rounded-md bg-indigo-500/15 px-2 py-1 text-[11px] text-indigo-300">MP</button>
                        <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
                      </div>
                    </motion.div>
                  )) : (
                    <div className="rounded-xl border border-dashed border-white/5 bg-[#1a1a24] px-3 py-3 text-xs text-white/20 text-center">
                      Aucun ami
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-white/5 bg-[#13131c] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-white/40 flex items-center gap-2 uppercase tracking-wider">
                    <MessageSquare size={14} className="text-indigo-400/60" />
                    Demandes
                  </p>
                </div>
                <div className="space-y-1.5">
                  {incomingRequests.length > 0 ? incomingRequests.slice(0, 4).map((request) => (
                    <div key={request.id} className="rounded-xl bg-[#1a1a24] px-3 py-2 text-sm text-white/60 border border-white/5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-white/80">{request.displayName || request.username}</span>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => openProfileModal(request, false)} className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-white/60">Voir</button>
                          <button type="button" onClick={() => handleFriendRequestDecision(request.id, 'accept')} className="rounded-md bg-emerald-500/20 px-2 py-1 text-[11px] text-emerald-300">Accepter</button>
                          <button type="button" onClick={() => handleFriendRequestDecision(request.id, 'decline')} className="rounded-md bg-rose-500/20 px-2 py-1 text-[11px] text-rose-300">Refuser</button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-dashed border-white/5 bg-[#1a1a24] px-3 py-3 text-xs text-white/20 text-center">
                      Aucune demande en attente
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="border-t border-white/5 p-3 bg-[#0d0d14]">
              <div className="flex items-center gap-2.5 rounded-xl bg-[#1a1a24] px-3 py-2 border border-white/5">
                <div className="h-8 w-8 overflow-hidden rounded-full border border-white/5 bg-[#1a1a24] flex items-center justify-center cursor-pointer" onClick={() => openProfileModal(user, true)}>
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User size={16} className="text-white/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openProfileModal(user, true)}>
                  <p className="text-sm font-medium text-white truncate">{user?.displayName || user?.username || 'Utilisateur'}</p>
                  <p className="text-[10px] text-white/20 flex items-center gap-1">
                    <Circle size={6} fill="#10b981" className="text-emerald-400/60" />
                    En ligne
                  </p>
                </div>
                <Settings2 
                  size={16} 
                  className="text-white/10 cursor-pointer hover:text-white/30 transition"
                  onClick={() => setIsSettingsModalOpen(true)}
                />
              </div>
            </div>
          </aside>
        ) : null}

        <main className="tavora-chat flex-1 min-h-0 overflow-hidden">
          {params.userId && (privateChatUser || isLoadingPrivateChat) ? (
            <div className="tavora-conversation flex h-full min-h-0">
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="tavora-chat-header border-b px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#1a1a24]">
                      {privateChatUser?.avatarUrl ? (
                        <img src={privateChatUser.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        <User size={18} className="text-white/30" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-400/40">Message privé</p>
                      <h3 className="mt-1 text-xl font-medium text-white">{privateChatUser?.displayName || privateChatUser?.username || 'Chargement...'}</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setPrivateChatUser(null); setPrivateMessages([]); setPrivateDraft(''); navigate('/home'); }}
                    className="rounded-xl border border-white/10 bg-[#1a1a24] px-3 py-2 text-sm text-white/50 hover:text-white"
                  >
                    Fermer
                  </button>
                </div>
                <div className="flex flex-1 min-h-0 flex-col">
                    <div
                      ref={privateMessagesRef}
                      onScroll={(event) => handleMessageScroll(event.currentTarget, setShowPrivateNewMessages)}
                      className="tavora-message-list relative flex-1 min-h-0 overflow-y-auto px-8 py-5"
                    >
                      {privateMessages.length > 0 ? (
                        <div className="space-y-3">
{privateMessages.map((msg) => {
  // Construire l'objet user pour la décoration
  const authorData = {
    id: msg.authorId,
    avatarUrl: msg.authorAvatarUrl || msg.author?.avatarUrl || '',
    avatarDecoration: msg.authorAvatarDecoration || msg.author?.avatarDecoration || null,
    displayName: msg.authorDisplayName || msg.author?.displayName || msg.authorUsername || 'Utilisateur',
    username: msg.authorUsername || msg.author?.username || 'user',
  };
  
  return (
    <div key={msg._id || `${msg.authorUsername}-${msg.createdAt}`} onContextMenu={(event) => openMessageContext(event, msg, true)} className="tavora-message px-2 py-2 text-sm text-white/70">
      <div className="flex items-start gap-3">
        {/* Avatar avec décoration */}
        <button
          type="button"
          onClick={() => openProfileModal(authorData, false)}
          className="shrink-0"
        >
          <AvatarWithDecoration user={authorData} size={36} />
        </button>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-2 font-medium text-white">
                {msg.authorDisplayName || msg.authorUsername || 'Utilisateur'}
                <ProfileBadges badges={msg.authorBadges} compact />
                {msg.isOfficialMessage ? <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200/75">Message officiel</span> : null}
              </span>
              <p className="text-[11px] text-white/30">@{msg.authorUsername || 'user'}</p>
            </div>
            <span className="text-[11px] text-white/30">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          {editingMessageId === msg._id ? (
            <div className="mt-2 flex gap-2">
              <input autoFocus value={editingMessageDraft} onChange={(event) => setEditingMessageDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') editMessage(); if (event.key === 'Escape') setEditingMessageId(null); }} className="min-w-0 flex-1 rounded-lg bg-black/30 px-2 py-1 text-sm text-white outline-none" />
              <button type="button" onClick={editMessage} className="text-xs text-cyan-200">Enregistrer</button>
            </div>
          ) : (
            <MessageContent content={msg.content} attachment={msg.attachment} getAuthHeaders={getAuthHeaders} onJoin={handleJoinInvite} user={user} navigate={navigate} />
          )}
          
          {msg.moderationAlert && user?.canModerate ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => handleModerationAlert(String(msg.moderationTargetId), 'ignore')} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 hover:bg-white/10">Ignorer</button>
              <button type="button" onClick={() => handleModerationAlert(String(msg.moderationTargetId), 'warn')} className="rounded-lg bg-rose-400/15 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-400/25">Envoyer l’avertissement</button>
              <button type="button" onClick={() => handleCopyReviewLink(String(msg.moderationReportId))} className="rounded-lg border border-cyan-200/20 px-3 py-2 text-xs text-cyan-100 hover:bg-cyan-200/10">Copier le lien de vérification</button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
})}
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-white/35">Aucun message privé pour l’instant.</div>
                      )}
                    </div>
                    {showPrivateNewMessages ? (
                      <button type="button" onClick={() => { setShowPrivateNewMessages(false); scrollMessagesToBottom(privateMessagesRef.current, 'smooth'); }} className="mb-3 self-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:bg-cyan-300/20">
                        Nouveaux messages ↓
                      </button>
                    ) : null}
                    <MessageComposer value={privateDraft} onChange={(nextValue) => { setPrivateDraft(nextValue); setCommandIndex(0); }} onSubmit={handleSendPrivateMessage} isSending={isSendingPrivateMessage} getAuthHeaders={getAuthHeaders} attachmentContext={{ userId: params.userId }} placeholder={`Écrire à ${privateChatUser?.displayName || privateChatUser?.username || 'cet utilisateur'}...`} className="mx-6 mb-5 mt-3" onKeyDown={(event) => { if (commandSuggestions.length && ['ArrowDown', 'ArrowUp', 'Tab'].includes(event.key)) { event.preventDefault(); if (event.key === 'Tab') chooseOfficialCommand(commandSuggestions[commandIndex]); else setCommandIndex((current) => (current + (event.key === 'ArrowDown' ? 1 : -1) + commandSuggestions.length) % commandSuggestions.length); } }}>
                      {commandSuggestions.length ? <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-20 rounded-xl border border-white/10 bg-[#111118] p-1 shadow-2xl">{commandSuggestions.map((command, index) => <button key={command.name} type="button" onClick={() => chooseOfficialCommand(command)} className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left ${index === commandIndex ? 'bg-cyan-200/10 text-white' : 'text-white/70 hover:bg-white/[0.06]'}`}><span className="font-mono text-sm text-cyan-100">{command.name}</span><span className="text-xs text-white/45">{command.description}</span></button>)}</div> : null}
                    </MessageComposer>
                </div>
              </div>
            </div>
          ) : selectedServer ? (
            <div className="tavora-conversation flex h-full min-h-0">
              <aside className="hidden tavora-channel-rail w-72 shrink-0 border-r p-4">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#09090f] mb-5">
                  {selectedServer.bannerUrl ? (
                    <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${selectedServer.bannerUrl})` }} />
                  ) : (
                    <div className="h-28 bg-gradient-to-r from-indigo-500/10 to-sky-500/10" />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-full border border-white/10 bg-[#10101a]">
                        {selectedServer.avatarUrl ? (
                          <img src={`${selectedServer.avatarUrl}?t=${avatarTimestamp}`} alt="Avatar du serveur" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-white/5 text-lg font-semibold text-white/50">
                            {selectedServer.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">Serveur</p>
                        <h2 className="mt-2 text-lg font-medium text-white truncate">{selectedServer.name}</h2>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-b border-white/5 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">Actions</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#1a1a24] text-white/70 transition hover:text-white"
                        aria-label="Inviter des membres"
                      >
                        <UserPlus size={16} />
                      </button>
                      {isServerOwner ? (
                        <button
                          type="button"
                          onClick={() => setIsSettingsModalOpen(true)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#1a1a24] text-white/70 transition hover:text-white"
                          aria-label="Paramètres du serveur"
                        >
                          <Settings2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
                {selectedServer.structure?.categories?.map((category) => (
                  <div key={category.id} className="mt-4">
                    <p className="px-2 text-[10px] uppercase tracking-[0.3em] text-white/20">{category.name}</p>
                    <div className="mt-2 space-y-1">
                      {category.channels.map((channel) => {
                        const isActive = activeChannelId === channel.id;
                        return (
                          <button
                            key={channel.id}
                            onClick={() => navigate(`/server/${selectedServer.id}/${channel.id}`)}
                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                              isActive ? 'bg-[#1a1a24] text-white' : 'text-white/40 hover:bg-[#1a1a24] hover:text-white/70'
                            }`}
                          >
                            {channel.type === 'voice' ? <Volume2 size={14} /> : <Hash size={14} />}
                            <span>{channel.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </aside>

              <div className="tavora-chat-column flex-1 flex flex-col">
                <div className="tavora-chat-header relative grid h-11 shrink-0 grid-cols-[1fr_auto_1fr] items-center px-5">
                  <button type="button" aria-label="Ouvrir les salons" title="Ouvrir les salons" onClick={() => setIsMobileSidebarOpen((open) => !open)} className="tavora-mobile-menu-button justify-self-start rounded-lg p-2 text-white/55 hover:bg-white/10 hover:text-white"><Menu size={17} /></button>
                  <h3 className="text-sm font-semibold tracking-wide text-white/85">{activeChannel?.type === 'voice' ? <span className="inline-flex items-center gap-2"><Volume2 size={15} className="text-cyan-200/70" />{activeChannel?.name || 'Salon'}</span> : `# ${activeChannel?.name || 'Salon'}`}</h3>
                  <div />
                </div>

                <div className="flex flex-1 min-h-0">
                  <div className="flex min-h-0 flex-1 flex-col">
                    {activeChannel?.type === 'voice' ? (
                      <div className="flex h-full flex-col p-6">
                        <div className="flex items-center justify-end"><button type="button" onClick={handleJoinVoice} className={`rounded-lg px-4 py-2 text-sm font-medium ${voiceState.joined ? 'bg-rose-400/15 text-rose-200' : 'bg-emerald-300/15 text-emerald-200'}`}>{voiceState.joined ? 'Quitter' : 'Rejoindre'}</button></div>
                        <div className="mt-8 flex-1"><div className="flex items-center justify-between border-b border-white/[0.08] pb-3"><span className="text-xs text-white/45">Participants</span><span className="text-xs text-white/35">{voiceParticipants.length} connecté{voiceParticipants.length > 1 ? 's' : ''}</span></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{voiceParticipants.map((participant) => <div key={`${participant.id}-${participant.socketId || ''}`} className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5"><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-cyan-200/10 text-sm text-cyan-100">{participant.avatarUrl ? <img src={participant.avatarUrl} alt="" className="h-full w-full object-cover" /> : (participant.name || 'U').charAt(0).toUpperCase()}</div><span className="truncate text-sm text-white/75">{participant.name}</span></div><div className="flex gap-2 text-white/45">{participant.micOn ? <Mic size={14} /> : <MicOff size={14} className="text-rose-300" />}{participant.cameraOn ? <Video size={14} className="text-cyan-200" /> : null}</div></div>)}</div>{hasVideoPreview ? <video ref={localVideoRef} autoPlay muted playsInline className="mt-4 max-h-56 w-full rounded-xl object-cover" /> : null}{voiceError || mediaError ? <p className="mt-4 text-xs text-rose-300">{voiceError || mediaError}</p> : null}</div>
                        {voiceState.joined ? <div className="relative mt-5 flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#111118] p-2"><button type="button" title={voiceState.micOn ? 'Couper le microphone' : 'Activer le microphone'} onClick={handleToggleMic} className={`rounded-lg p-3 ${voiceState.micOn ? 'text-white/70 hover:bg-white/10' : 'bg-rose-400/15 text-rose-200'}`}>{voiceState.micOn ? <Mic size={18} /> : <MicOff size={18} />}</button><button type="button" title="Activer ou désactiver la caméra" onClick={handleToggleCamera} className={`rounded-lg p-3 ${voiceState.cameraOn ? 'bg-cyan-300/15 text-cyan-100' : 'text-white/70 hover:bg-white/10'}`}>{voiceState.cameraOn ? <Video size={18} /> : <VideoOff size={18} />}</button><button type="button" title="Partager l’écran" onClick={handleShareScreen} className={`rounded-lg p-3 ${voiceState.streaming ? 'bg-cyan-300/15 text-cyan-100' : 'text-white/70 hover:bg-white/10'}`}><Radio size={18} /></button><button type="button" title="Paramètres audio" onClick={() => { setAudioSettingsOpen((open) => !open); refreshAudioDevices(); }} className="rounded-lg p-3 text-white/70 hover:bg-white/10"><Settings2 size={18} /></button><button type="button" title="Quitter le salon vocal" onClick={handleJoinVoice} className="rounded-lg p-3 text-rose-200/80 hover:bg-rose-400/10"><LogOut size={18} /></button>{audioSettingsOpen ? <div className="absolute bottom-16 right-2 z-20 w-72 rounded-xl border border-white/10 bg-[#0d0d14] p-3 shadow-2xl"><div className="flex items-center justify-between"><p className="text-xs font-medium text-white/75">Paramètres audio</p><button type="button" title="Rafraîchir les périphériques" onClick={refreshAudioDevices} className="text-xs text-cyan-200/70">Actualiser</button></div><label className="mt-3 block text-[11px] text-white/40">Microphone<select onChange={handleInputDeviceChange} className="mt-1 w-full rounded-lg border border-white/10 bg-[#171720] px-2 py-2 text-xs text-white"><option value="">Choisir un périphérique</option>{audioDevices.inputs.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label || 'Microphone détecté'}</option>)}</select></label><label className="mt-3 block text-[11px] text-white/40">Sortie audio{typeof HTMLMediaElement.prototype.setSinkId === 'function' ? <select onChange={(event) => { remoteAudioRef.current.forEach((audio) => audio.setSinkId?.(event.target.value)); }} className="mt-1 w-full rounded-lg border border-white/10 bg-[#171720] px-2 py-2 text-xs text-white"><option value="">Choisir un périphérique</option>{audioDevices.outputs.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label || 'Sortie détectée'}</option>)}</select> : <span className="mt-1 block text-white/30">Non supporté par ce navigateur.</span>}</label></div> : null}</div> : null}
                      </div>
                    ) : (
                      <div className="flex h-full min-h-0 flex-col">
                        <div
                          ref={channelMessagesRef}
                          onScroll={(event) => handleMessageScroll(event.currentTarget, setShowChannelNewMessages)}
                          className="tavora-message-list relative flex-1 min-h-0 overflow-y-auto px-8 py-5"
                        >
                          {channelMessages.length > 0 ? (
                            <div className="space-y-1">
{channelMessages.map((msg) => {
  // Construire l'objet user pour la décoration
  const authorData = {
    id: msg.authorId,
    avatarUrl: msg.authorAvatarUrl || (String(msg.authorId) === String(user?._id || user?.id) ? user?.avatarUrl : ''),
    avatarDecoration: msg.authorAvatarDecoration || null,
    displayName: msg.authorDisplayName || msg.authorName || 'Utilisateur',
    username: msg.authorUsername || msg.authorName || 'user',
  };
  
  return (
    <div key={msg._id || `${msg.authorName}-${msg.createdAt}`} onContextMenu={(event) => openMessageContext(event, msg, false)} className="tavora-message px-2 py-2">
      <div className="flex items-start gap-3">
        {/* Avatar avec décoration */}
        <button
          type="button"
          onClick={() => openProfileModal({ id: msg.authorId, authorId: msg.authorId, ...authorData }, false)}
          className="shrink-0"
        >
          <AvatarWithDecoration user={authorData} size={40} />
        </button>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-2 font-medium text-white">
                {msg.authorDisplayName || msg.authorName || 'Utilisateur'}
                <ProfileBadges badges={msg.authorBadges} compact />
                {msg.isOfficialMessage ? <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200/75">Message officiel</span> : null}
              </span>
              <p className="text-[11px] text-white/30">@{msg.authorUsername || msg.authorName || 'user'}</p>
            </div>
            <span className="text-[11px] text-white/30">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          {editingMessageId === msg._id ? (
            <div className="mt-2 flex gap-2">
              <input autoFocus value={editingMessageDraft} onChange={(event) => setEditingMessageDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') editMessage(); if (event.key === 'Escape') setEditingMessageId(null); }} className="min-w-0 flex-1 rounded-lg bg-black/30 px-2 py-1 text-sm text-white outline-none" />
              <button type="button" onClick={editMessage} className="text-xs text-cyan-200">Enregistrer</button>
            </div>
          ) : (
            <MessageContent content={msg.content} attachment={msg.attachment} getAuthHeaders={getAuthHeaders} onJoin={handleJoinInvite} avatarTimestamp={avatarTimestamp} user={user} navigate={navigate} />
          )}
        </div>
      </div>
    </div>
  );
})}
                            </div>
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-white/35">
                              Aucun message pour le moment.
                            </div>
                          )}
                        </div>
                        {showChannelNewMessages ? (
                          <button type="button" onClick={() => { setShowChannelNewMessages(false); scrollMessagesToBottom(channelMessagesRef.current, 'smooth'); }} className="mb-3 self-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:bg-cyan-300/20">
                            Nouveaux messages ↓
                          </button>
                        ) : null}
                        <MessageComposer value={draftMessage} onChange={setDraftMessage} onSubmit={handleSendMessage} isSending={isSendingMessage} getAuthHeaders={getAuthHeaders} attachmentContext={{ serverId: selectedServer.id, channelId: activeChannelId }} placeholder="Écrire un message..." className="mx-6 mb-5 mt-3" />
                      </div>
                    )}
                  </div>

                  <aside className="tavora-members-rail hidden w-72 shrink-0 px-4 py-5 lg:block">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">Membres</p>
                        <p className="mt-1 text-sm text-white/40">{serverMembers.length} membre{serverMembers.length > 1 ? 's' : ''}</p>
                      </div>
                      <div className="rounded-full border border-white/5 bg-[#13131e] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/20">
                        {selectedServer?.name || 'Serveur'}
                      </div>
                    </div>
                    <div className="mt-4 space-y-4">
                      {serverMembers.length > 0 ? Object.entries(serverMembers.reduce((groups, member) => {
                        const role = (member.roles || []).filter((item) => item.hoist).sort((left, right) => right.position - left.position)[0];
                        const key = role?._id || 'members';
                        if (!groups[key]) groups[key] = { role, members: [] };
                        groups[key].members.push(member);
                        return groups;
                      }, {})).sort(([, left], [, right]) => (right.role?.position || 0) - (left.role?.position || 0)).map(([groupKey, group]) => <section key={groupKey}><p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: group.role?.color || 'rgba(255,255,255,0.3)' }}>{group.role?.name || 'Membres'} · {group.members.length}</p>
{group.members.map((member) => {
  const nameplateId = member?.nameplate || 'none';
  const nameplate = NAMEPLATES.find(n => n.id === nameplateId) || NAMEPLATES[0];
  const hasNameplate = nameplateId !== 'none' && nameplate?.url;
  
  return (
    <button
      key={member.id}
      type="button"
      onClick={() => openProfileModal(member, false)}
      className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-[#13131e] px-3 py-3 text-left transition hover:bg-[#1a1a24] relative overflow-hidden"
      style={{
        backgroundImage: hasNameplate ? `url(${nameplate.url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay pour la lisibilité */}
      {hasNameplate && (
        <div className="absolute inset-0 bg-black/30" />
      )}
      
      <div className="relative z-10 flex w-full items-center gap-3">
        <AvatarWithDecoration user={member} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p 
              className="truncate text-sm font-medium" 
              style={{ 
              }}
            >
              {member.roleIconUrl ? <img src={member.roleIconUrl} alt="" className="mr-1 inline h-3.5 w-3.5 rounded object-cover align-[-2px]" /> : null}
              {member.displayName || member.username || 'Membre'}
            </p>
            {member.isOwner ? <Crown size={12} className="text-amber-400/70" /> : null}
          </div>
          <p className="truncate text-[11px] text-white/70">@{member.username || 'user'}</p>
        </div>
      </div>
    </button>
  );
})}
                      </section>) : (
                        <div className="rounded-2xl border border-white/5 bg-[#13131e] px-3 py-4 text-sm text-white/35">
                          Aucun membre à afficher pour le moment.
                        </div>
                      )}
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          ) : (
            <div className="">
              <div className="tavora-home-scene" aria-hidden="true">
                <div className="tavora-stars" />
                <div className="tavora-moon" />
                <div className="tavora-cloud tavora-cloud-left" />
                <div className="tavora-cloud tavora-cloud-right" />
                <div className="tavora-hills" />
              </div>

              <div className="relative z-10 p-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-indigo-300/60">
                      <Home size={14} />
                      Accueil
                    </p>
                    <h1 className="mt-1.5 text-2xl font-light text-white">
                      Bienvenue sur Tavora
                    </h1>
                  </div>
                  <button 
                    onClick={() => setIsServerModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1a1a24]/80 px-4 py-2 text-sm text-white/80 transition-all duration-200 hover:bg-[#2a2a38] hover:text-white"
                  >
                    <Plus size={16} />
                    Créer
                  </button>
                </div>

                <div className="grid flex-1 gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                  <div className="tavora-home-hero relative overflow-hidden rounded-[32px] border border-white/10 p-8 shadow-[0_30px_80px_rgba(8,12,22,0.6)] backdrop-blur-xl">
                    <div className="absolute inset-0 bg-[#080A12]/50" />
                    <div className="relative z-10">
                      <p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-white/60">
                        Ton espace
                      </p>
                      <h2 className="mt-5 max-w-[560px] text-3xl font-light leading-[1.1] text-white md:text-5xl">
                        Des conversations <span className="font-medium text-violet-300 drop-shadow-[0_0_18px_rgba(167,139,250,0.45)]">fluides</span>, des communautés <span className="font-medium text-violet-300 drop-shadow-[0_0_18px_rgba(167,139,250,0.45)]">vivantes</span>.
                      </h2>
                      <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/50 md:text-base">
                        Retrouve tes amis, tes discussions et tes serveurs dans une expérience pensée pour rester connecté sans friction.
                      </p>

                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          className="inline-flex items-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/15 px-5 py-3 text-sm font-medium text-violet-100 shadow-[0_12px_35px_rgba(109,92,255,0.28)] transition hover:bg-violet-500/20"
                        >
                          Découvrir Tavora
                          <span aria-hidden="true">›</span>
                        </button>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#101522]/70 px-3 py-2 text-xs text-white/55 backdrop-blur-sm">
                          <span className="text-white/40">Membres</span>
                          <span className="font-medium text-white/80">{totalCommunityMembers}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="tavora-home-summary rounded-[30px] border border-white/10 p-5 shadow-[0_24px_60px_rgba(8,12,20,0.42)] backdrop-blur-xl">
                    <p className="flex items-center gap-2 text-sm font-medium text-white/50">
                      <Package size={16} className="text-violet-300/80" />
                      Vue d'ensemble
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-white/8 bg-[#0e1320]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-violet-400/20 hover:bg-[#101827]">
                        <p className="flex items-center justify-between text-sm text-white/60">
                          <span className="flex items-center gap-2">
                            <Users size={14} className="text-violet-300/80" />
                            Serveurs
                          </span>
                          <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-200/90">
                            actif
                          </span>
                        </p>
                        <p className="mt-2 text-xl font-medium text-white">
                          {servers.length > 0 ? `${servers.length}` : '0'}
                        </p>
                        <p className="mt-1 text-xs text-white/35">
                          {servers.length > 0 ? `serveur${servers.length > 1 ? 's' : ''}` : 'Aucun serveur'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/8 bg-[#0e1320]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-violet-400/20 hover:bg-[#101827]">
                        <p className="flex items-center justify-between text-sm text-white/60">
                          <span className="flex items-center gap-2">
                            <User size={14} className="text-violet-300/80" />
                            Amis
                          </span>
                          <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-sky-200/90">
                            online
                          </span>
                        </p>
                        <p className="mt-2 text-xl font-medium text-white">
                          {friends.length > 0 ? `${friends.length}` : '0'}
                        </p>
                        <p className="mt-1 text-xs text-white/35">
                          {friends.length > 0 ? `contact${friends.length > 1 ? 's' : ''}` : 'Aucun ami'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {isServerModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsServerModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="tavora-modal border rounded-2xl p-8 max-w-md w-full mx-4 pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-light text-white">Rejoindre ou créer</h2>
                  <button
                    onClick={() => setIsServerModalOpen(false)}
                    className="text-white/20 hover:text-white/40 transition"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="border border-white/5 rounded-xl p-4 bg-[#13131c]">
                    <p className="text-sm font-medium text-white/60 flex items-center gap-2 mb-3">
                      <Link size={16} className="text-indigo-400/60" />
                      Rejoindre un serveur
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={inviteLink}
                        onChange={(e) => setInviteLink(e.target.value)}
                        placeholder="Lien d'invitation"
                        className="flex-1 rounded-lg bg-[#1a1a24] border border-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-indigo-500/50 transition"
                      />
                      <button onClick={() => handleJoinInvite(inviteLink)} className="rounded-lg bg-indigo-600/20 text-indigo-400/60 px-4 py-2 text-sm font-medium hover:bg-indigo-600/30 hover:text-indigo-400 transition">
                        Rejoindre
                      </button>
                    </div>
                  </div>
                  <div className="border border-white/5 rounded-xl p-4 bg-[#13131c]">
                    <p className="text-sm font-medium text-white/60 flex items-center gap-2 mb-3">
                      <Server size={16} className="text-indigo-400/60" />
                      Générer une invitation
                    </p>
                    <form onSubmit={handleCreateInvite} className="space-y-3">
                      <select value={inviteDuration} onChange={(e) => setInviteDuration(e.target.value)} className="w-full rounded-lg bg-[#1a1a24] border border-white/5 px-3 py-2 text-sm text-white outline-none">
                        <option value="5m">5 minutes</option>
                        <option value="10m">10 minutes</option>
                        <option value="30m">30 minutes</option>
                        <option value="1h">1 heure</option>
                        <option value="8h">8 heures</option>
                        <option value="never">Indéfiniment</option>
                      </select>
                      <button type="submit" className="w-full rounded-lg bg-indigo-600/20 text-indigo-400/60 px-4 py-2 text-sm font-medium hover:bg-indigo-600/30 hover:text-indigo-400 transition">
                        Générer le lien
                      </button>
                    </form>
                    {invitePreview ? <p className="mt-3 break-all text-xs text-indigo-300/80">{invitePreview.link}</p> : null}
                    {inviteMessage ? <p className="mt-2 text-xs text-white/40">{inviteMessage}</p> : null}
                  </div>
                  <div className="border border-white/5 rounded-xl p-4 bg-[#13131c]">
                    <p className="text-sm font-medium text-white/60 flex items-center gap-2 mb-3">
                      <Server size={16} className="text-indigo-400/60" />
                      Créer un serveur
                    </p>
                    <form onSubmit={handleCreateServer} className="flex gap-2">
                      <input
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        placeholder="Nom du serveur"
                        className="flex-1 rounded-lg bg-[#1a1a24] border border-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-indigo-500/50 transition"
                      />
                      <button
                        type="submit"
                        disabled={isCreating}
                        className="rounded-lg bg-indigo-600/20 text-indigo-400/60 px-4 py-2 text-sm font-medium hover:bg-indigo-600/30 hover:text-indigo-400 transition disabled:opacity-50"
                      >
                        {isCreating ? '...' : 'Créer'}
                      </button>
                    </form>
                    {message && <p className="mt-2 text-xs text-indigo-300/60">{message}</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInviteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="tavora-modal w-full max-w-md mx-4 rounded-2xl border p-8 shadow-2xl pointer-events-auto">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-light text-white">Inviter des membres</h2>
                  <button onClick={() => setIsInviteModalOpen(false)} className="text-white/20 transition hover:text-white/40">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/5 bg-[#13131c] p-4">
                    <p className="mb-3 flex items-center gap-2 text-sm font-medium text-white/60">
                      <Link size={16} className="text-indigo-400/60" />
                      Générer un lien
                    </p>
                    <form onSubmit={handleCreateInvite} className="space-y-3">
                      <select value={inviteDuration} onChange={(e) => setInviteDuration(e.target.value)} className="w-full rounded-lg border border-white/5 bg-[#1a1a24] px-3 py-2 text-sm text-white outline-none">
                        <option value="5m">5 minutes</option>
                        <option value="10m">10 minutes</option>
                        <option value="30m">30 minutes</option>
                        <option value="1h">1 heure</option>
                        <option value="8h">8 heures</option>
                        <option value="never">Indéfiniment</option>
                      </select>
                      <button type="submit" className="w-full rounded-lg bg-indigo-600/20 px-4 py-2 text-sm font-medium text-indigo-400/60 transition hover:bg-indigo-600/30 hover:text-indigo-400">
                        Générer le lien
                      </button>
                    </form>
                    {invitePreview ? <p className="mt-3 break-all text-xs text-indigo-300/80">{invitePreview.link}</p> : null}
                    {inviteMessage ? <p className="mt-2 text-xs text-white/40">{inviteMessage}</p> : null}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFriendModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFriendModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="tavora-modal border rounded-2xl p-8 max-w-md w-full mx-4 pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-light text-white flex items-center gap-3">
                    <UserPlus size={20} className="text-indigo-400/60" />
                    Ajouter un ami
                  </h2>
                  <button
                    onClick={() => setIsFriendModalOpen(false)}
                    className="text-white/20 hover:text-white/40 transition"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAddFriend} className="space-y-4">
                  <div className="border border-white/5 rounded-xl p-4 bg-[#13131c]">
                    <p className="text-sm font-medium text-white/60 mb-3">Nom d'utilisateur</p>
                    <div className="flex gap-2">
                      <input
                        value={friendUsername}
                        onChange={(e) => setFriendUsername(e.target.value)}
                        placeholder="exemple#1234"
                        className="flex-1 rounded-lg bg-[#1a1a24] border border-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-indigo-500/50 transition"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-indigo-600/20 text-indigo-400/60 px-4 py-2 text-sm font-medium hover:bg-indigo-600/30 hover:text-indigo-400 transition"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsModalOpen && selectedServer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
            >
              <div className={`tavora-modal tavora-server-settings-modal border rounded-2xl max-w-5xl w-full mx-4 pointer-events-auto shadow-2xl max-h-[85vh] overflow-hidden flex flex-col ${isMobileViewport ? `tavora-server-settings-mobile-${mobileServerSettingsView}` : ''}`}>
                <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
                  <div>
                    <button type="button" onClick={() => setMobileServerSettingsView('navigation')} aria-label="Retour à la navigation serveur" className="tavora-server-settings-back mb-3 items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/50 hover:bg-white/10 hover:text-white"><ChevronLeft size={14} />Paramètres</button>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Paramètres du serveur</p>
                    <h2 className="mt-2 text-xl font-medium text-white">{selectedServer.name}</h2>
                  </div>
                  <button
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="text-white/20 hover:text-white/40 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex flex-1 overflow-hidden">
                  <div className="w-56 shrink-0 overflow-y-auto border-r border-white/5 p-3 bg-[#0f0f17]">
                    <div className="mb-4 rounded-2xl border border-white/5 bg-[#13131c] p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#1a1a24] flex items-center justify-center border border-white/5 text-white/60">
                          <Server size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{selectedServer.name}</p>
                          <p className="text-[10px] text-white/40">Serveur</p>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute left-0 top-0 w-[2px] bg-white/10 rounded-full" style={{ height: '24rem' }} />
                      {[
                        { id: 'profile', icon: User, label: 'Infos du serveur' },
                        { id: 'invitations', icon: Link, label: 'Invitations' },
                        { id: 'members', icon: Users, label: 'Membres' },
                        { id: 'roles', icon: Shield, label: 'Rôles' },
                        { id: 'bans', icon: Shield, label: 'Bannissements' },
                      ].map((cat) => {
                        const Icon = cat.icon;
                        const isActive = settingsTab === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => { setSettingsTab(cat.id); setMobileServerSettingsView('content'); }}
                            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
                              isActive
                                ? 'bg-white/5 text-white'
                                : 'text-white/40 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <Icon size={16} className={isActive ? 'text-white' : 'text-white/40'} />
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    {serverSettingsMessage ? (
                      <div className="mb-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                        {serverSettingsMessage}
                      </div>
                    ) : null}
                    {settingsTab === 'profile' && (
                      <form onSubmit={handleUpdateServerSettings} className="space-y-6">
                        <div className="rounded-3xl border border-white/5 bg-[#13131e] p-5">
                          <div className="flex flex-col gap-4">
                            <div>
                              <label className="text-xs text-white/40">Nom du serveur</label>
                              <input
                                value={serverDraft.name}
                                onChange={(e) => setServerDraft((prev) => ({ ...prev, name: e.target.value }))}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-white outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-white/40">Description</label>
                              <textarea
                                value={serverDraft.description}
                                onChange={(e) => setServerDraft((prev) => ({ ...prev, description: e.target.value }))}
                                maxLength={280}
                                rows={3}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-white outline-none"
                              />
                              <p className="mt-1 text-right text-[10px] text-white/30">{serverDraft.description.length}/280</p>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div>
                                <label className="text-xs text-white/40">Avatar du serveur</label>
                                <div className="mt-2 rounded-2xl border border-white/10 bg-[#0d0d14] p-3">
                                  <div className="mb-3 h-24 w-full overflow-hidden rounded-2xl bg-[#0b0b13]">
                                    {serverDraft.avatarUrl ? (
                                      <img src={`${serverDraft.avatarUrl}?t=${avatarTimestamp}`} alt="Aperçu avatar serveur" className="h-full w-full object-cover" />
                                    ) : selectedServer?.avatarUrl ? (
                                      <img src={`${selectedServer.avatarUrl}?t=${avatarTimestamp}`} alt="Avatar serveur" className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="flex h-full items-center justify-center text-sm text-white/40">Aucun avatar</div>
                                    )}
                                  </div>
                                  <input
                                    type="text"
                                    value={serverDraft.avatarUrl?.startsWith('data:') ? '' : serverDraft.avatarUrl}
                                    onChange={(e) => setServerDraft((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                                    placeholder="URL de l'avatar"
                                    className="w-full rounded-2xl border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-white outline-none"
                                  />
                                  <label className="mt-2 flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm text-white/60 transition hover:bg-[#1a1a24]">
                                    <input type="file" accept="image/*" className="hidden" onChange={(event) => handleServerImageChange(event, 'avatarUrl')} />
                                    Importer un fichier avatar
                                  </label>
                                </div>
                              </div>
                              <div>
                                <label className="text-xs text-white/40">Bannière du serveur</label>
                                <div className="mt-2 rounded-2xl border border-white/10 bg-[#0d0d14] p-3">
                                  <div className="mb-3 h-24 w-full overflow-hidden rounded-2xl bg-[#0b0b13]">
                                    {serverDraft.bannerUrl ? (
                                      <img src={serverDraft.bannerUrl} alt="Aperçu bannière serveur" className="h-full w-full object-cover" />
                                    ) : selectedServer?.bannerUrl ? (
                                      <img src={selectedServer.bannerUrl} alt="Bannière serveur" className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="flex h-full items-center justify-center text-sm text-white/40">Aucune bannière</div>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/server/${selectedServer.id}/studio`)}
                                    className="tavora-banner-studio-button mb-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-300/20 bg-teal-300/10 px-3 py-2 text-sm text-teal-100 transition hover:bg-teal-300/20"
                                  >
                                    <PenSquare size={15} />
                                    Ouvrir l’éditeur graphique
                                  </button>
                                  <input
                                    type="text"
                                    value={serverDraft.bannerUrl?.startsWith('data:') ? '' : serverDraft.bannerUrl}
                                    onChange={(e) => setServerDraft((prev) => ({ ...prev, bannerUrl: e.target.value }))}
                                    placeholder="URL de la bannière"
                                    className="w-full rounded-2xl border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-white outline-none"
                                  />
                                  <label className="mt-2 flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm text-white/60 transition hover:bg-[#1a1a24]">
                                    <input type="file" accept="image/*" className="hidden" onChange={(event) => handleServerImageChange(event, 'bannerUrl')} />
                                    Importer un fichier bannière
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-white/40">Accent</label>
                              <input
                                value={serverDraft.accent}
                                onChange={(e) => setServerDraft((prev) => ({ ...prev, accent: e.target.value }))}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-white outline-none"
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isUpdatingServer}
                          className="rounded-2xl bg-indigo-500/15 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500/20 disabled:opacity-60"
                        >
                          {isUpdatingServer ? 'Enregistrement...' : 'Enregistrer les modifications du serveur'}
                        </button>
                      </form>
                    )}
                    {isBannerEditorOpen ? (
                      <ServerBannerEditor
                        source={serverDraft.bannerUrl || selectedServer.bannerUrl || ''}
                        onClose={() => setIsBannerEditorOpen(false)}
                        onExport={(bannerUrl) => {
                          setServerDraft((previous) => ({ ...previous, bannerUrl }));
                          setIsBannerEditorOpen(false);
                          setServerSettingsMessage('Bannière composée dans l’éditeur. Enregistrez les modifications pour la publier.');
                        }}
                      />
                    ) : null}
                    {settingsTab === 'invitations' && (
                      <div className="space-y-6">
                        <div className="rounded-3xl border border-white/5 bg-[#13131e] p-5">
                          <div className="flex flex-col gap-4">
                            <div>
                              <label className="text-xs text-white/40">Suffixe personnalisé</label>
                              <input
                                value={customInviteSuffix}
                                onChange={(e) => setCustomInviteSuffix(e.target.value)}
                                placeholder="code-personnalise"
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-white outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-white/40">Durée</label>
                              <select
                                value={inviteDuration}
                                onChange={(e) => setInviteDuration(e.target.value)}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-white outline-none"
                              >
                                <option value="5m">5 minutes</option>
                                <option value="10m">10 minutes</option>
                                <option value="30m">30 minutes</option>
                                <option value="1h">1 heure</option>
                                <option value="8h">8 heures</option>
                                <option value="never">Indéfiniment</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={handleGenerateServerInvite}
                            disabled={isGeneratingServerInvite}
                            className="rounded-2xl bg-indigo-500/15 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500/20 disabled:opacity-60"
                          >
                            {isGeneratingServerInvite ? 'Génération...' : 'Générer un lien d’invitation'}
                          </button>
                          {serverInviteLink ? (
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(serverInviteLink)}
                              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 hover:text-white"
                            >
                              Copier le lien
                            </button>
                          ) : null}
                        </div>
                        {serverInviteLink ? (
                          <div className="rounded-3xl border border-white/5 bg-[#13131e] p-4 text-sm text-white/70 break-all">
                            {serverInviteLink}
                          </div>
                        ) : null}
                      </div>
                    )}
                    {settingsTab === 'roles' && (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between"><div><p className="text-lg font-medium text-white">Rôles</p><p className="text-xs text-white/40">Les rôles sont propres à ce serveur et respectent la hiérarchie.</p></div><button type="button" onClick={() => setRoleDraft({ id: null, name: '', color: '#99aab5', iconUrl: '', hoist: false, permissions: [] })} className="rounded-xl bg-indigo-500/15 px-3 py-2 text-xs text-white">Créer un rôle</button></div>
                        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                          <div className="space-y-1">{serverRoles.map((role) => <div key={role._id} className={`flex items-center gap-1 rounded-xl px-2 py-1 ${roleDraft.id === role._id ? 'bg-white/10' : 'hover:bg-white/5'}`}><button type="button" onClick={() => setRoleDraft({ id: role._id, name: role.name, color: role.color, iconUrl: role.iconUrl || '', hoist: role.hoist, permissions: role.permissions || [] })} className="flex min-w-0 flex-1 items-center gap-2 px-1 py-1 text-left text-sm text-white/55"><span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: role.color }} /> <span className="truncate">{role.name}</span><span className="ml-auto text-[10px] text-white/25">{role.position}</span></button>{role.isEveryone ? null : <span className="flex shrink-0 items-center"><button type="button" title="Monter le rôle" onClick={() => moveRole(role, 'up')} className="rounded p-1 text-white/35 hover:bg-white/10 hover:text-white"><ChevronUp size={14} /></button><button type="button" title="Descendre le rôle" onClick={() => moveRole(role, 'down')} className="rounded p-1 text-white/35 hover:bg-white/10 hover:text-white"><ChevronDown size={14} /></button></span>}</div>)}</div>
                          <form onSubmit={saveRole} className="space-y-4 rounded-2xl border border-white/5 bg-[#13131e] p-5"><p className="text-sm font-medium text-white">{roleDraft.id ? 'Modifier le rôle' : 'Nouveau rôle'}</p><div className="flex items-center gap-3 rounded-xl bg-[#0d0d14] p-3"><span className="h-8 w-8 rounded-full" style={{ backgroundColor: roleDraft.color }} /> <span className="text-sm font-medium" style={{ color: roleDraft.color }}>{roleDraft.iconUrl ? '◈ ' : ''}{roleDraft.name || 'Aperçu du rôle'}</span></div><input required value={roleDraft.name} onChange={(event) => setRoleDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Nom du rôle" className="w-full rounded-xl border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-white outline-none" /><div className="flex gap-3"><label className="flex flex-1 items-center gap-2 text-xs text-white/45">Couleur<input type="color" value={roleDraft.color} onChange={(event) => setRoleDraft((current) => ({ ...current, color: event.target.value }))} className="h-8 w-10 rounded bg-transparent" /></label><input value={roleDraft.iconUrl} onChange={(event) => setRoleDraft((current) => ({ ...current, iconUrl: event.target.value }))} placeholder="URL icône (optionnel)" className="flex-[2] rounded-xl border border-white/10 bg-[#0d0d14] px-3 py-2 text-xs text-white outline-none" /></div><label className="flex items-center gap-2 text-xs text-white/60"><input type="checkbox" checked={roleDraft.hoist} onChange={(event) => setRoleDraft((current) => ({ ...current, hoist: event.target.checked }))} />Afficher séparément dans les membres</label><div><p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-white/35">Permissions principales</p><div className="grid gap-2 sm:grid-cols-2">{[['ADMINISTRATOR', 'Administrateur'], ['MANAGE_SERVER', 'Gérer le serveur'], ['MANAGE_ROLES', 'Gérer les rôles'], ['MANAGE_CHANNELS', 'Gérer les salons'], ['KICK_MEMBERS', 'Expulser'], ['BAN_MEMBERS', 'Bannir'], ['SEND_MESSAGES', 'Envoyer des messages'], ['MANAGE_MESSAGES', 'Gérer les messages'], ['CONNECT', 'Se connecter'], ['SPEAK', 'Parler']].map(([permission, label]) => <label key={permission} className="flex items-center gap-2 text-xs text-white/60"><input type="checkbox" checked={roleDraft.permissions.includes(permission)} onChange={(event) => setRoleDraft((current) => ({ ...current, permissions: event.target.checked ? [...current.permissions, permission] : current.permissions.filter((item) => item !== permission) }))} />{label}</label>)}</div></div><div className="flex gap-2"><button type="submit" className="rounded-xl bg-indigo-500/15 px-4 py-2 text-xs text-white">Sauvegarder</button>{roleDraft.id && !serverRoles.find((role) => role._id === roleDraft.id)?.isEveryone ? <button type="button" onClick={() => deleteRole(serverRoles.find((role) => role._id === roleDraft.id))} className="rounded-xl bg-rose-500/10 px-4 py-2 text-xs text-rose-200">Supprimer</button> : null}<button type="button" onClick={() => setRoleDraft({ id: null, name: '', color: '#99aab5', iconUrl: '', hoist: false, permissions: [] })} className="rounded-xl bg-white/5 px-4 py-2 text-xs text-white/55">Annuler</button></div></form>
                        </div>
                      </div>
                    )}
                    {settingsTab === 'members' && (
                      <div className="space-y-4">
                        <div className="rounded-3xl border border-white/5 bg-[#13131e] p-5">
                          <p className="text-sm font-medium text-white mb-3">Membres du serveur</p>
                          <div className="space-y-3">
                            {serverMembers.length > 0 ? serverMembers.map((member) => (
                              <div key={member.id} className="tavora-member-card flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-[#0d0d14] p-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-indigo-500/10 text-sm font-semibold text-white/70">
                                    {member.avatarUrl ? <img src={member.avatarUrl} alt={`Avatar de ${member.displayName || member.username || 'membre'}`} className="h-full w-full object-cover" /> : (member.displayName || member.username || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="inline-flex items-center gap-2 text-sm text-white">{member.displayName || member.username}<ProfileBadges badges={member.badges} compact /></p>
                                    <p className="text-xs text-white/40">@{member.username}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!member.isOwner ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleKickMember(member.id)}
                                        className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 hover:bg-amber-500/15"
                                      >
                                        Expulser
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleBanMember(member.id)}
                                        className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200 hover:bg-rose-500/15"
                                      >
                                        Bannir
                                      </button>
                                    </>
                                  ) : (
                                    <span className="rounded-2xl bg-white/5 px-3 py-2 text-xs text-white/40">Propriétaire</span>
                                  )}
                                </div>
                              </div>
                            )) : (
                              <div className="rounded-2xl border border-white/5 bg-[#0d0d14] p-4 text-sm text-white/50">
                                Aucun membre à afficher.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {settingsTab === 'bans' && (
                      <div className="space-y-4">
                        <div className="rounded-3xl border border-white/5 bg-[#13131e] p-5">
                          <p className="text-sm font-medium text-white mb-3">Utilisateurs bannis</p>
                          <div className="space-y-3">
                            {serverBannedMembers.length > 0 ? serverBannedMembers.map((member) => (
                              <div key={member.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-[#0d0d14] p-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-200">
                                    {(member.displayName || member.username || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm text-white">{member.displayName || member.username}</p>
                                    <p className="text-xs text-white/40">@{member.username}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUnbanMember(member.id)}
                                  className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-500/15"
                                >
                                  Débannir
                                </button>
                              </div>
                            )) : (
                              <div className="rounded-2xl border border-white/5 bg-[#0d0d14] p-4 text-sm text-white/50">
                                Aucun membre banni.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {false && isProfileModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
            >
              <div className="tavora-modal bg-[#0d0d14] border rounded-2xl max-w-2xl w-full mx-4 pointer-events-auto shadow-2xl max-h-[85vh] overflow-y-auto">
                <div className="sticky top-0 bg-[#0d0d14] border-b border-white/5 p-4 flex items-center justify-between z-10">
                  <h2 className="text-lg font-light text-white flex items-center gap-3">
                    <User size={18} className="text-indigo-400/60" />
                    Profil
                  </h2>
                  <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="text-white/20 hover:text-white/40 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="relative -mx-6 -mt-6 mb-6 h-36 overflow-hidden rounded-b-3xl border-b border-white/5">
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-slate-900"
                      style={profileDraft.bannerUrl ? { backgroundImage: `url(${profileDraft.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                    />
                    {profileTarget?.isSelf ? (
                      <label className="absolute right-4 top-4 cursor-pointer rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] text-white/70 backdrop-blur">
                        <input type="file" accept="image/*" className="hidden" onChange={(event) => handleProfileImageChange(event, 'bannerUrl')} />
                        Changer la bannière
                      </label>
                    ) : null}
                  </div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#1a1a24]">
                      {profileDraft.avatarUrl ? (
                        <img src={profileDraft.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User size={32} className="text-white/20" />
                        </div>
                      )}
                      {profileTarget?.isSelf ? (
                        <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-[10px] text-white/70">
                          <input type="file" accept="image/*" className="hidden" onChange={(event) => handleProfileImageChange(event, 'avatarUrl')} />
                          Modifier
                        </label>
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-light text-white">{profileDraft.displayName || profileTarget?.displayName || user?.displayName || 'Utilisateur'}</h3>
                      <p className="text-sm text-white/30">@{profileDraft.username || profileTarget?.username || user?.username || 'user'}</p>
                      <p className="mt-1 text-xs text-white/20">Membre depuis {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  {profileMessage ? <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{profileMessage}</div> : null}
                  <div className="space-y-4">
                    <div className="border border-white/5 rounded-xl p-4 bg-[#13131c]">
                      <p className="text-xs text-white/30 mb-2">Bio</p>
                      {profileTarget?.isSelf ? (
                        <textarea
                          value={profileDraft.bio}
                          onChange={(event) => setProfileDraft((prev) => ({ ...prev, bio: event.target.value }))}
                          placeholder="Écris une bio..."
                          rows={3}
                          className="w-full rounded-xl border border-white/5 bg-[#1a1a24] px-3 py-2 text-sm text-white outline-none placeholder:text-white/20"
                        />
                      ) : (
                        <p className="text-sm text-white/60">{profileDraft.bio || 'Aucune bio pour l’instant.'}</p>
                      )}
                    </div>
                    {profileTarget?.isSelf ? (
                      <div className="border border-white/5 rounded-xl p-4 bg-[#13131c] space-y-3">
                        <div>
                          <p className="text-xs text-white/30 mb-1">Nom d’affichage</p>
                          <input
                            value={profileDraft.displayName}
                            onChange={(event) => setProfileDraft((prev) => ({ ...prev, displayName: event.target.value }))}
                            className="w-full rounded-xl border border-white/5 bg-[#1a1a24] px-3 py-2 text-sm text-white outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-white/30 mb-1">Nom d’utilisateur</p>
                          <input
                            value={profileDraft.username}
                            onChange={(event) => setProfileDraft((prev) => ({ ...prev, username: event.target.value }))}
                            className="w-full rounded-xl border border-white/5 bg-[#1a1a24] px-3 py-2 text-sm text-white outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-white/30 mb-1">URL de bannière</p>
                          <input
                            value={profileDraft.bannerUrl}
                            onChange={(event) => setProfileDraft((prev) => ({ ...prev, bannerUrl: event.target.value }))}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-white/5 bg-[#1a1a24] px-3 py-2 text-sm text-white outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-white/30 mb-1">URL d’avatar</p>
                          <input
                            value={profileDraft.avatarUrl}
                            onChange={(event) => setProfileDraft((prev) => ({ ...prev, avatarUrl: event.target.value }))}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-white/5 bg-[#1a1a24] px-3 py-2 text-sm text-white outline-none"
                          />
                        </div>
                      </div>
                    ) : null}
                    <div className="border border-white/5 rounded-xl p-4 bg-[#13131c]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white/30">Activité en cours</p>
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-300">En direct</span>
                      </div>
                      <div className="mt-3 rounded-2xl border border-white/5 bg-[#0f1118] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                              <Code size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{profileDraft.activity?.app || ''}</p>
                              <p className="text-xs text-white/40">{profileDraft.activity?.detail || ''}</p>
                            </div>
                          </div>
                          <div className="text-right text-[10px] text-white/30">
                            <p>{profileDraft.activity?.branch || 'main'}</p>
                            <p>{profileDraft.activity?.line || 'line 18'}</p>
                          </div>
                        </div>
                        <div className="mt-3 rounded-xl border border-white/5 bg-[#161821] p-3 text-[11px] text-white/40">
                          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/25">
                            <span>{profileDraft.activity?.workspace || 'ENV'}</span>
                            <span>•</span>
                            <span>{profileDraft.activity?.status || 'Secrets'}</span>
                          </div>
                          <p className="text-white/60">{profileDraft.activity?.detail || ''}</p>
                          <p className="mt-1 text-white/40">{profileDraft.activity?.app || ''}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex gap-3">
                    {profileTarget?.isSelf ? (
                      <button onClick={handleSaveProfile} className="flex-1 rounded-lg bg-indigo-600/20 px-4 py-2 text-sm font-medium text-indigo-400/80 transition hover:bg-indigo-600/30 hover:text-indigo-400">
                        Enregistrer le profil
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(false);
                          if (profileTarget?.id || profileTarget?._id) {
                            const friendPayload = {
                              id: profileTarget.id || profileTarget._id,
                              username: profileTarget.username || profileTarget.displayName || 'user',
                              displayName: profileTarget.displayName || profileTarget.username || 'Utilisateur',
                              avatarUrl: profileTarget.avatarUrl || '',
                            };
                            openDirectMessage(friendPayload.id);
                          }
                        }}
                        className="flex-1 rounded-lg bg-indigo-600/20 px-4 py-2 text-sm font-medium text-indigo-400/80 transition hover:bg-indigo-600/30 hover:text-indigo-400"
                      >
                        Envoyer un message
                      </button>
                    )}
                    <button className="rounded-lg bg-[#1a1a24] px-4 py-2 text-sm text-white/40 transition hover:bg-[#2a2a38] hover:text-white">
                      Plus
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {messageContext ? <>
        <button type="button" aria-label="Fermer le menu du message" onClick={() => setMessageContext(null)} className="fixed inset-0 z-[80] cursor-default" />
        <div className="fixed z-[81] w-44 rounded-lg border border-white/10 bg-[#111116] p-1 shadow-2xl" style={{ left: Math.min(messageContext.x, window.innerWidth - 190), top: Math.min(messageContext.y, window.innerHeight - 150) }}>
          {String(messageContext.message.authorId) === String(user?._id || user?.id) ? <button type="button" onClick={() => { setEditingMessageId(messageContext.message._id); setEditingMessageIsPrivate(messageContext.isPrivate); setEditingMessageDraft(messageContext.message.content); setMessageContext(null); }} className="block w-full rounded px-3 py-2 text-left text-xs text-white/75 hover:bg-white/[0.07]">Modifier</button> : null}
          {(String(messageContext.message.authorId) === String(user?._id || user?.id) || (!messageContext.isPrivate && serverPermissions.includes('MANAGE_MESSAGES'))) ? <button type="button" onClick={deleteMessage} className="block w-full rounded px-3 py-2 text-left text-xs text-rose-200/80 hover:bg-rose-400/10">Supprimer</button> : null}
          <button type="button" onClick={() => { navigator.clipboard?.writeText(messageContext.message.content || ''); setMessageContext(null); }} className="block w-full rounded px-3 py-2 text-left text-xs text-white/60 hover:bg-white/[0.07]">Copier le message</button>
        </div>
      </> : null}

      {isSettingsModalOpen && settingsTab === 'roles' ? <RoleSettingsPanel
        role={roleDraft.id ? { ...(serverRoles.find((role) => role._id === roleDraft.id) || {}), ...roleDraft, _id: roleDraft.id } : { _id: 'draft', ...roleDraft, name: roleDraft.name || 'Nouveau rôle' }}
        roles={serverRoles}
        onChange={(nextRole) => setRoleDraft({ id: nextRole._id === 'draft' ? null : nextRole._id, name: nextRole.name, color: nextRole.color, iconUrl: nextRole.iconUrl || '', hoist: Boolean(nextRole.hoist), permissions: nextRole.permissions || [] })}
        onSave={(nextRole) => { const draft = { id: nextRole._id === 'draft' ? null : nextRole._id, name: nextRole.name, color: nextRole.color, iconUrl: nextRole.iconUrl || '', hoist: Boolean(nextRole.hoist), permissions: nextRole.permissions || [] }; setRoleDraft(draft); saveRole({ preventDefault: () => {} }, draft); }}
        onDelete={deleteRole}
        onClose={() => { setSettingsTab('profile'); setRoleDraft({ id: null, name: '', color: '#99aab5', iconUrl: '', hoist: false, permissions: [] }); }}
      /> : null}

      <ProfileModal
        isOpen={isProfileModalOpen}
        profileTarget={profileTarget}
        profileDraft={profileDraft}
        setProfileDraft={setProfileDraft}
        profileMessage={profileMessage}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        onImageChange={handleProfileImageChange}
        onMessage={setProfileMessage}
        currentUserId={user?._id || user?.id}
        serverMembers={serverMembers}
        onSendMessage={(targetUserId) => {
          setIsProfileModalOpen(false);
          openDirectMessage(targetUserId);
        }}
        onAddFriend={handleAddFriendFromProfile}
        onRemoveFriend={handleRemoveFriend}
        onBlockUser={handleBlockFriend}
        onUnblockUser={handleUnblockUser}
        onReport={reportUser}
        serverContext={selectedServer}
        serverRoles={serverRoles}
        serverPermissions={serverPermissions}
        isServerOwner={isServerOwner}
        onToggleMemberRole={handleToggleMemberRole}
        onKickMember={handleKickMember}
        onBanMember={handleBanMember}
        onMuteMember={handleMuteMember}
      />

      <AccountSettingsModal
        isOpen={isAccountSettingsOpen}
        initialTab={location.pathname.startsWith('/settings/') ? location.pathname.split('/')[2] : 'account'}
        user={user}
        servers={servers}
        friends={friends}
        incomingRequests={incomingRequests}
        outgoingRequests={outgoingRequests}
        getAuthHeaders={getAuthHeaders}
        onUpdateUser={(nextUser, nextToken) => updateSession({ ...(user || {}), ...nextUser }, nextToken)}
        onSaveProfile={(draft) => handleSaveProfile(null, draft)}
        onFriendDecision={handleFriendRequestDecision}
        onRemoveFriend={handleRemoveFriend}
        onBlockFriend={handleBlockFriend}
        onLeaveServer={handleLeaveServer}
        onLogout={handleLogout}
        onClose={() => { setIsAccountSettingsOpen(false); if (location.pathname.startsWith('/settings')) navigate(-1); }}
        onOpenProfile={openProfileFromAccountSettings}
        onOpenServerSettings={openServerSettingsFor}
        onChangePassword={handleChangePassword}
      />
    </div>
  );
}

export default AppHomePage;
