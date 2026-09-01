import React, { useState, useEffect, useRef } from 'react';
import { 
  X, UserPlus, MoreHorizontal, Send, Ban, Flag, UserMinus, 
  User, Camera, Pencil, Users, Server, MessageCircle, 
  Heart, Share2, Sparkles, Music, Gamepad2,
  Calendar, Clock, MapPin, Link as LinkIcon, Check, Unlock,
  Shield, Star, Crown, BadgeCheck, Activity, Award, Globe,
  Type
} from 'lucide-react';
import ProfileBadges from './ProfileBadges';
import { API_URL } from '../utils/api';

// Décorations d'avatar organisées par catégories
const AVATAR_DECORATIONS = [
  {
    id: 'spooky_night',
    name: 'Spooky Night',
    banner: 'https://discord-decoration.art/banners/spooky_night.webp',
    bannerText: 'https://discord-decoration.art/bannertext/spooky_night.webp',
    description: 'Beware what lurks in the dark...',
    tag: 'FALL 2024',
    decorations: [
      { id: 'spooky_cat_ears', url: 'https://discord-decoration.art/decorations/spooky_cat_ears.png' },
      { id: 'spooky_cat_ears_midnight', url: 'https://discord-decoration.art/decorations/spooky_cat_ears_midnight.webp' },
      { id: 'candlelight', url: 'https://discord-decoration.art/decorations/candlelight.webp' },
      { id: 'candlelight_crimson', url: 'https://discord-decoration.art/decorations/candlelight_crimson.png' },
      { id: 'candlelight_dark', url: 'https://discord-decoration.art/decorations/candlelight_dark.png' },
      { id: 'hood_dark', url: 'https://discord-decoration.art/decorations/hood_dark.webp' },
      { id: 'hood_crimson', url: 'https://discord-decoration.art/decorations/hood_crimson.webp' },
      { id: 'witch_hat_plum', url: 'https://discord-decoration.art/decorations/witch_hat_plum.webp' },
      { id: 'witch_hat_midnight', url: 'https://discord-decoration.art/decorations/witch_hat_midnight.webp' },
      { id: 'zombie_food', url: 'https://discord-decoration.art/decorations/zombie_food.png' },
      { id: 'zombie_food_purple', url: 'https://discord-decoration.art/decorations/zombie_food_purple.png' },
      { id: 'bloodthirsty', url: 'https://discord-decoration.art/decorations/bloodthirsty.png' },
      { id: 'bloodthirsty_green', url: 'https://discord-decoration.art/decorations/bloodthirsty_green.png' },
      { id: 'bloodthirsty_gold', url: 'https://discord-decoration.art/decorations/bloodthirsty_gold.png' },
    ]
  },
  {
    id: 'anime_v2',
    name: 'Anime 2',
    banner: 'https://discord-decoration.art/banners/anime_v2.webp',
    bannerText: 'https://discord-decoration.art/bannertext/anime_v2.webp',
    description: 'Senpai will definitely notice you.',
    decorations: [
      { id: 'cat_ears', url: 'https://discord-decoration.art/decorations/cat_ears.png' },
      { id: 'ki_energy', url: 'https://discord-decoration.art/decorations/ki_energy.png' },
      { id: 'heartbloom', url: 'https://discord-decoration.art/decorations/heartbloom.png' },
      { id: 'dismay', url: 'https://discord-decoration.art/decorations/dismay.png' },
      { id: 'rage', url: 'https://discord-decoration.art/decorations/rage.png' },
      { id: 'in_tears', url: 'https://discord-decoration.art/decorations/in_tears.png' },
      { id: 'radiating_energy', url: 'https://discord-decoration.art/decorations/radiating_energy.png' },
      { id: 'soul_leaving_body', url: 'https://discord-decoration.art/decorations/soul_leaving_body.png' },
      { id: 'sweat_drops', url: 'https://discord-decoration.art/decorations/sweat_drops.png' },
      { id: 'starry_eyed', url: 'https://discord-decoration.art/decorations/starry_eyed.png' },
      { id: 'in_love', url: 'https://discord-decoration.art/decorations/in_love.png' },
      { id: 'shocked', url: 'https://discord-decoration.art/decorations/shocked.png' },
      { id: 'angry', url: 'https://discord-decoration.art/decorations/angry.png' },
    ]
  },
  {
    id: 'anime_v1',
    name: 'Anime',
    banner: 'https://discord-decoration.art/banners/anime_v1.webp',
    bannerText: 'https://discord-decoration.art/bannertext/anime_v1.webp',
    description: 'Senpai will definitely notice you.',
    decorations: [
      { id: 'radiating_energy_v1', url: 'https://discord-decoration.art/decorations/radiating_energy.png' },
      { id: 'soul_leaving_body_v1', url: 'https://discord-decoration.art/decorations/soul_leaving_body.png' },
      { id: 'sweat_drops_v1', url: 'https://discord-decoration.art/decorations/sweat_drops.png' },
      { id: 'starry_eyed_v1', url: 'https://discord-decoration.art/decorations/starry_eyed.png' },
      { id: 'in_love_v1', url: 'https://discord-decoration.art/decorations/in_love.png' },
      { id: 'shocked_v1', url: 'https://discord-decoration.art/decorations/shocked.png' },
      { id: 'angry_v1', url: 'https://discord-decoration.art/decorations/angry.png' },
    ]
  },
  {
    id: 'anime_v3',
    name: 'Anime 3',
    banner: 'https://discord-decoration.art/banners/anime_v3.webp',
    bannerText: 'https://discord-decoration.art/bannertext/anime_v3.webp',
    description: 'Senpai will definitely notice you.',
    decorations: [
      { id: 'ki_energy_v3', url: 'https://discord-decoration.art/decorations/ki_energy.png' },
      { id: 'ki_energy_green', url: 'https://discord-decoration.art/decorations/ki_energy_green.png' },
      { id: 'ki_energy_cyan', url: 'https://discord-decoration.art/decorations/ki_energy_cyan.png' },
      { id: 'ki_energy_blue', url: 'https://discord-decoration.art/decorations/ki_energy_blue.png' },
      { id: 'ki_energy_fuchsia', url: 'https://discord-decoration.art/decorations/ki_energy_fuchsia.png' },
    ]
  },
  {
    id: 'lunar_new_year',
    name: 'Nouvel An Lunaire',
    banner: 'https://img.avatardecoration.com/banners/lunar_new_year_2025.png',
    bannerText: 'https://img.avatardecoration.com/bannertext/lunar_new_year_2025.png',
    description: 'Shed the old, embrace the new.',
    decorations: [
      { id: 'snakes_hug', url: 'https://img.avatardecoration.com/decorations/snakes_hug.png' },
      { id: 'lotus_flower', url: 'https://img.avatardecoration.com/decorations/lotus_flower.png' },
      { id: 'red_lantern', url: 'https://img.avatardecoration.com/decorations/red_lantern.png' },
      { id: 'fan_flourish', url: 'https://img.avatardecoration.com/decorations/fan_flourish.png' },
      { id: 'lunar_lanterns', url: 'https://img.avatardecoration.com/decorations/lunar_lanterns.png' },
      { id: 'firecrackers', url: 'https://img.avatardecoration.com/decorations/firecrackers.png' },
      { id: 'dragons_smile', url: 'https://img.avatardecoration.com/decorations/dragons_smile.png' },
      { id: 'lucky_envelopes', url: 'https://img.avatardecoration.com/decorations/lucky_envelopes.png' },
      { id: 'koi_pond', url: 'https://img.avatardecoration.com/decorations/koi_pond.png' },
    ]
  },
  {
    id: 'steampunk',
    name: 'Steampunk',
    banner: 'https://img.avatardecoration.com/banners/steampunk.png',
    bannerText: 'https://img.avatardecoration.com/bannertext/steampunk.png',
    description: 'What shall we tinker on today?',
    decorations: [
      { id: 'steampunk_cat_ears', url: 'https://img.avatardecoration.com/decorations/steampunk_cat_ears.png' },
      { id: 'mech_flora', url: 'https://img.avatardecoration.com/decorations/mech_flora.png' },
      { id: 'bowler_hat', url: 'https://img.avatardecoration.com/decorations/bowler_hat.png' },
      { id: 'brass_beats', url: 'https://img.avatardecoration.com/decorations/brass_beats.png' },
      { id: 'timekeepers_clock', url: 'https://img.avatardecoration.com/decorations/timekeepers_clock.png' },
      { id: 'flux_alchemy', url: 'https://img.avatardecoration.com/decorations/flux_alchemy.png' },
    ]
  },
];

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

export default function ProfileModal({
  profileTarget,
  profileDraft,
  setProfileDraft,
  profileMessage,
  isOpen,
  onClose,
  onSave,
  onImageChange,
  onMessage,
  onSendMessage,
  onAddFriend,
  onRemoveFriend,
  onBlockUser,
  onUnblockUser,
  onReport,
  serverContext,
  serverMembers = [],
  serverRoles = [],
  onToggleMemberRole,
  currentUserId,
  getAuthHeaders,
}) {
  const profileUserId = profileTarget?.id || profileTarget?._id || profileTarget?.userId;
  const isOwnProfile = Boolean(profileUserId && currentUserId && String(profileUserId) === String(currentUserId));
  const isOfficialProfile = Boolean(profileTarget?.isOfficial);
  const isFriend = profileTarget?.isFriend || false;
  const isBlockedByMe = profileTarget?.isBlockedByMe || false;
  const isBlockedByThem = profileTarget?.isBlockedByThem || false;
  const isBlocked = profileTarget?.isBlocked || isBlockedByMe || isBlockedByThem;
  const isInteractionBlocked = isBlocked && !isBlockedByMe;
  
  const [editingField, setEditingField] = useState(null);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [commonData, setCommonData] = useState({ friends: [], servers: [] });
  const [isCommonDataLoading, setIsCommonDataLoading] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportBusy, setReportBusy] = useState(false);
  const [note, setNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isDecorationModalOpen, setIsDecorationModalOpen] = useState(false);
  const [isNameplateModalOpen, setIsNameplateModalOpen] = useState(false);
  const [selectedDecoration, setSelectedDecoration] = useState(null);
  const [selectedNameplate, setSelectedNameplate] = useState(null);
  const [nameplateImageError, setNameplateImageError] = useState({});
  const initialDraftRef = useRef(profileDraft);
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    initialDraftRef.current = profileDraft;
    setEditingField(null);
    setBannerFailed(false);
    setAvatarFailed(false);
    setIsActionMenuOpen(false);
    setIsReportOpen(false);
    setReportReason('');
    setReportDetails('');
    setActionMessage('');
    setActiveTab('friends');
    setNote(profileTarget?.note || '');
    setIsEditingNote(false);
    setCommonData({ friends: [], servers: [] });
    setIsCommonDataLoading(!isOwnProfile && !isOfficialProfile);
    setIsDecorationModalOpen(false);
    setIsNameplateModalOpen(false);
    setSelectedDecoration(profileDraft?.avatarDecoration || null);
    const nameplateId = profileDraft?.nameplate || 'none';
    setSelectedNameplate(NAMEPLATES.find(n => n.id === nameplateId) || NAMEPLATES[0]);
    setNameplateImageError({});
    
    if (!isOwnProfile && !isOfficialProfile && profileUserId && getAuthHeaders) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      fetch(`${API_URL}/api/social/profile/${profileUserId}/common`, { 
        headers: getAuthHeaders(), 
        signal: controller.signal 
      })
        .then((response) => response.ok ? response.json() : { friends: [], servers: [] })
        .then((data) => setCommonData({ friends: data.friends || [], servers: data.servers || [] }))
        .catch(() => setCommonData({ friends: [], servers: [] }))
        .finally(() => {
          window.clearTimeout(timeout);
          setIsCommonDataLoading(false);
        });
      return () => {
        window.clearTimeout(timeout);
        controller.abort();
      };
    }
    setIsCommonDataLoading(false);
  }, [getAuthHeaders, isOpen, profileTarget?.id, profileTarget?._id]);

  if (!isOpen) return null;

  const displayName = profileDraft.displayName || profileTarget?.displayName || profileTarget?.username || 'Utilisateur';
  const username = profileDraft.username || profileTarget?.username || 'user';
  const visibleBadges = [
    ...(Array.isArray(profileTarget?.badges) ? profileTarget.badges : []),
    ...(profileTarget?.audioActivity?.connected || profileTarget?.spotifyConnected ? ['spotify'] : []),
  ];
  
  const currentServerHasBothUsers = Boolean(
    !isOwnProfile
      && serverContext?.id
      && serverMembers.some((member) => String(member.id || member._id) === String(currentUserId))
      && serverMembers.some((member) => String(member.id || member._id) === String(profileUserId)),
  );
  const commonServers = (() => {
    const baseServers = commonData.servers || [];
    if (!currentServerHasBothUsers) return baseServers;
    const alreadyHasContext = baseServers.some((server) => String(server.id || server._id) === String(serverContext.id));
    return alreadyHasContext ? baseServers : [{ ...serverContext, memberCount: serverMembers.length }, ...baseServers];
  })();
  
  const saveField = async (field) => {
    setEditingField(null);
    await onSave(null, profileDraft);
    if (field) onMessage('Profil mis à jour.');
  };
  
  const cancelField = () => {
    setProfileDraft((current) => ({ ...current, [editingField]: initialDraftRef.current?.[editingField] || '' }));
    setEditingField(null);
  };

  const runAction = async (action, successMessage) => {
    setIsActionMenuOpen(false);
    const result = await action?.(profileTarget?.id || profileTarget?._id);
    setActionMessage(result || successMessage);
  };

  const handleSpotifyConnect = async () => {
    try {
      const spotifyTargetUserId = profileUserId || currentUserId;
      if (!spotifyTargetUserId) {
        setActionMessage('Impossible de connecter Spotify : utilisateur introuvable.');
        return;
      }

      sessionStorage.setItem('pendingSpotifyUserId', String(spotifyTargetUserId));

      const response = await fetch(`${API_URL}/api/auth/spotify/login`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setActionMessage('Erreur lors de la connexion à Spotify.');
      }
    } catch (error) {
      console.error('Spotify login error:', error);
      setActionMessage('Erreur lors de la connexion à Spotify.');
    }
  };
  
  const submitReport = async (event) => {
    event.preventDefault();
    if (!reportReason || (reportReason === 'other' && !reportDetails.trim())) return;
    setReportBusy(true);
    const result = await onReport?.(profileUserId, reportReason, reportDetails);
    setReportBusy(false);
    if (result?.ok) { 
      setIsReportOpen(false); 
      setActionMessage('Signalement envoyé.'); 
    } else {
      setActionMessage(result?.message || 'Signalement impossible.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusColors = {
    online: '#23a55a',
    idle: '#f0b232',
    dnd: '#f23f43',
    offline: '#84858d',
  };

  const userStatus = profileTarget?.status || 'offline';
  const statusColor = statusColors[userStatus] || statusColors.offline;
  const statusLabel = {
    online: 'En ligne',
    idle: 'Absent',
    dnd: 'Ne pas déranger',
    offline: 'Hors ligne',
  }[userStatus] || 'Hors ligne';

  const nowPlaying = profileTarget?.audioActivity;
  const spotifyConnected = Boolean(nowPlaying?.connected || nowPlaying?.source === 'spotify');
  const nowPlayingTitle = nowPlaying?.track || nowPlaying?.title || 'Titre inconnu';
  const nowPlayingArtist = nowPlaying?.artist || nowPlaying?.creator || 'Artiste inconnu';
  const nowPlayingProgress = Number(nowPlaying?.progress || nowPlaying?.currentTime || 0);
  const nowPlayingDuration = Number(nowPlaying?.duration || 0);
  const nowPlayingPercent = nowPlayingDuration ? Math.min(100, (nowPlayingProgress / nowPlayingDuration) * 100) : 0;

  const handleAvatarChange = (event) => {
    // Vérifier que l'événement et event.target existent
    if (!event || !event.target) {
      console.error('Événement invalide pour le changement d\'avatar');
      return;
    }
    
    const file = event.target.files?.[0];
    if (file && typeof onImageChange === 'function') {
      // Passer l'événement complet et le type
      onImageChange(event, 'avatarUrl');
    } else if (file && !onImageChange) {
      console.warn('onImageChange n\'est pas défini');
    }
    
    // Réinitialiser l'input pour permettre de sélectionner le même fichier
    event.target.value = '';
  };
  
  const handleBannerChange = (event) => {
    // Vérifier que l'événement et event.target existent
    if (!event || !event.target) {
      console.error('Événement invalide pour le changement de bannière');
      return;
    }
    
    const file = event.target.files?.[0];
    if (file && typeof onImageChange === 'function') {
      // Passer l'événement complet et le type
      onImageChange(event, 'bannerUrl');
    } else if (file && !onImageChange) {
      console.warn('onImageChange n\'est pas défini');
    }
    
    // Réinitialiser l'input pour permettre de sélectionner le même fichier
    event.target.value = '';
  };

  const handleDecorationSelect = (decorationUrl) => {
    setSelectedDecoration(decorationUrl);
    setProfileDraft(curr => ({ ...curr, avatarDecoration: decorationUrl }));
    setIsDecorationModalOpen(false);
    onMessage('Décoration d\'avatar mise à jour.');
    onSave(null, { ...profileDraft, avatarDecoration: decorationUrl });
  };

  const handleNameplateSelect = (nameplate) => {
    setSelectedNameplate(nameplate);
    setProfileDraft(curr => ({ ...curr, nameplate: nameplate.id }));
    setIsNameplateModalOpen(false);
    onMessage('Plaque nominative mise à jour.');
    onSave(null, { ...profileDraft, nameplate: nameplate.id });
    setNameplateImageError(prev => ({ ...prev, [nameplate.id]: false }));
  };

  const getNameplateStyle = () => {
    if (!selectedNameplate || selectedNameplate.id === 'none') {
      return { 
        color: '#ffffff',
      };
    }
    
    return {
      backgroundImage: `url(${selectedNameplate.url})`,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      display: 'inline-block',
      padding: '8px 16px', // Ajuste selon la taille de l'image
      minHeight: '40px', // Ajuste selon la hauteur de l'image
      minWidth: '50px', // Ajuste selon la largeur de l'image
      borderRadius: '8px',
      lineHeight: '1.5',
    };
  };

  if (isBlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/95" onClick={onClose} />
        <div 
          className="relative z-10 flex flex-col items-center justify-center rounded-xl p-8 shadow-2xl"
          style={{
            width: 'min(500px, calc(100vw - 96px))',
            minHeight: '300px',
            background: '#000000',
            border: '1px solid #2a2a2a',
          }}
        >
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
              <Ban size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Utilisateur bloqué</h2>
            <p className="mt-2 text-sm text-gray-400">Vous avez bloqué cet utilisateur. Vous ne recevrez plus ses messages.</p>
            
            <button 
              type="button" 
              onClick={() => runAction(() => onUnblockUser?.(profileUserId), 'Utilisateur débloqué.')}
              className="mt-6 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              <Unlock size={18} className="inline mr-2" />
              Débloquer
            </button>
            
            <button 
              type="button" 
              onClick={onClose} 
              className="mt-3 rounded-lg px-6 py-2.5 text-sm text-gray-400 transition hover:text-white"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95" onClick={onClose} />
      
      {/* Inputs cachés pour les fichiers */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBannerChange}
      />
      
      <div 
        className="relative z-10 flex flex-row overflow-hidden rounded-[18px] shadow-2xl"
        style={{
          width: 'min(962px, calc(100vw - 96px))',
          height: 'min(800px, calc(100vh - 96px))',
          minHeight: '550px',
          background: '#000000',
          border: '1px solid #0e0d0d',
        }}
      >
        {/* PARTIE GAUCHE */}
        <main 
          className="flex flex-col overflow-hidden"
          style={{
            width: isOwnProfile || isOfficialProfile ? '100%' : '45%',
            minWidth: isOwnProfile || isOfficialProfile ? '100%' : '300px',
            background: '#000000',
          }}
        >
          {/* Bannière */}
          <div className="relative shrink-0" style={{ height: '140px', width: '100%' }}>
            {profileDraft.bannerUrl && !bannerFailed ? (
              <img 
                src={profileDraft.bannerUrl} 
                alt="" 
                className="h-full w-full object-cover" 
                onError={() => setBannerFailed(true)} 
              />
            ) : (
              <div 
                className="h-full w-full"
                style={{ 
                  background: isOfficialProfile 
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)'
                    : 'linear-gradient(135deg, #111111 0%, #222222 100%)' 
                }}
              />
            )}
            
            {isOwnProfile && (
              <button 
                type="button" 
                onClick={() => bannerInputRef.current?.click()} 
                className="absolute bottom-3 right-3 rounded-lg bg-black/70 p-2 text-gray-300 backdrop-blur-sm transition hover:bg-black hover:text-white border border-gray-700 z-20"
                title="Changer la bannière"
              >
                <Camera size={16} />
              </button>
            )}
            
            <button 
              type="button" 
              onClick={onClose} 
              className="absolute rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white z-20"
              style={{ right: '12px', top: '12px' }}
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Avatar avec décoration centrée */}
          <div className="relative px-6" style={{ marginTop: '-60px' }}>
            <div className="relative" style={{ width: '120px', height: '120px' }}>
              {/* Avatar de base */}
              <div 
                className="overflow-hidden rounded-full"
                style={{ 
                  width: '120px', 
                  height: '120px',
                  border: '6px solid #000000',
                  backgroundColor: '#111111',
                }}
              >
                {profileDraft.avatarUrl && !avatarFailed ? (
                  <img 
                    src={profileDraft.avatarUrl} 
                    alt={`Avatar de ${displayName}`} 
                    className="h-full w-full object-cover" 
                    onError={() => setAvatarFailed(true)} 
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User size={48} className="text-gray-600" />
                  </div>
                )}
              </div>
              
              {/* Décoration d'avatar - CENTRÉE SUR L'AVATAR */}
              {selectedDecoration && (
                <img 
                  src={selectedDecoration} 
                  alt="Décoration" 
                  style={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -52%) scale(1.5)',
                    width: '85px',
                    height: '90px',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                />
              )}
              
              {/* Bouton caméra */}
              {isOwnProfile && (
                <button 
                  type="button" 
                  onClick={() => avatarInputRef.current?.click()} 
                  className="absolute rounded-full bg-black/70 p-2 text-gray-300 backdrop-blur-sm transition hover:bg-black hover:text-white border border-gray-700 z-20"
                  style={{ bottom: '0px', right: '0px' }}
                  title="Changer l'avatar"
                >
                  <Camera size={16} />
                </button>
              )}
            </div>
          </div>
          
          {/* Corps du profil */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar" style={{ marginTop: '20px' }}>
            {/* Nom + badges */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {isOwnProfile && editingField === 'displayName' ? (
                    <input
                      autoFocus
                      value={profileDraft.displayName}
                      onChange={(event) => setProfileDraft((current) => ({ ...current, displayName: event.target.value }))}
                      onKeyDown={(event) => { 
                        if (event.key === 'Escape') cancelField(); 
                        if (event.key === 'Enter') saveField('displayName'); 
                      }} 
                      onBlur={() => saveField('displayName')}
                      className="w-full bg-transparent text-2xl font-bold text-white outline-none border-b border-gray-700 focus:border-white"
                    />
                  ) : (
                    <div className="relative inline-block w-full">
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          disabled={!isOwnProfile} 
                          onClick={() => isOwnProfile && setEditingField('displayName')} 
                          className="block truncate text-left text-2xl font-bold disabled:cursor-default relative"
                          title={displayName}
                        >
                          {(() => {
                            const targetNameplateId = profileTarget?.nameplate || 'none';
                            const targetNameplate = NAMEPLATES.find(n => n.id === targetNameplateId) || NAMEPLATES[0];
                            const hasNameplate = targetNameplateId !== 'none' && targetNameplate?.url;
                            
                            if (hasNameplate) {
                              return (
                                <span 
                                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-left"
                                  style={{
backgroundImage: `url(${targetNameplate.url})`,
backgroundSize: 'cover',
backgroundPosition: 'center',
backgroundRepeat: 'no-repeat',
fontSize: '1.5rem',
fontWeight: 'bold',
color: targetNameplate.color,
textShadow: targetNameplate.glow !== 'none' ? targetNameplate.glow : undefined,
minHeight: '50px',
width: '250px', // ← Largeur fixe
paddingLeft: '24px',
                                  }}
                                >
                                  <span className="inline-flex items-center">{displayName}</span>
                                  {visibleBadges.length > 0 && (
                                    <span className="inline-flex items-center shrink-0">
                                      <ProfileBadges badges={visibleBadges} compact />
                                    </span>
                                  )}
                                </span>
                              );
                            }

                            return (
                              <span style={{ color: '#ffffff' }}>
                                {displayName}
                                {visibleBadges.length > 0 && (
                                  <span className="ml-2 inline-flex items-center align-middle">
                                    <ProfileBadges badges={visibleBadges} compact />
                                  </span>
                                )}
                              </span>
                            );
                          })()}
                          {isOwnProfile && <Pencil size={14} className="inline ml-2 text-gray-500" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {!isOwnProfile && !isOfficialProfile && (
                  <div className="relative shrink-0">
                    <button 
                      type="button" 
                      onClick={() => setIsActionMenuOpen((open) => !open)} 
                      className="rounded-full p-2 text-gray-500 transition hover:bg-white/10 hover:text-white"
                      aria-label="Plus d'actions"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    
                    {isActionMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsActionMenuOpen(false)}
                        />
                        <div 
                          className="absolute right-0 z-20 mt-1 overflow-hidden rounded-lg p-1 shadow-xl"
                          style={{ 
                            top: '100%',
                            background: '#111111',
                            width: '220px',
                            border: '1px solid #2a2a2a',
                          }}
                        >
                          {isBlockedByMe && (
                            <button 
                              type="button" 
                              onClick={() => runAction(() => onUnblockUser?.(profileUserId), 'Utilisateur débloqué.')} 
                              className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-sm text-emerald-400 hover:bg-emerald-500/10"
                            >
                              <Unlock size={16} /> Débloquer
                            </button>
                          )}

                          {!isBlockedByMe && !isBlockedByThem && !isFriend && (
                            <button 
                              type="button" 
                              onClick={() => runAction(() => onAddFriend?.(profileTarget), 'Demande envoyée.')} 
                              className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                            >
                              <UserPlus size={16} /> Ajouter en ami
                            </button>
                          )}
                          
                          {!isBlockedByMe && !isBlockedByThem && isFriend && (
                            <button 
                              type="button" 
                              onClick={() => runAction(() => onRemoveFriend?.(profileUserId), 'Ami supprimé.')} 
                              className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                            >
                              <UserMinus size={16} /> Supprimer des amis
                            </button>
                          )}
                          
                          {!isBlockedByMe && !isBlockedByThem && (
                            <button 
                              type="button" 
                              onClick={() => runAction(() => onBlockUser?.(profileUserId), 'Utilisateur bloqué.')} 
                              className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                            >
                              <Ban size={16} /> Bloquer
                            </button>
                          )}
                          
                          <button 
                            type="button" 
                            onClick={() => { setIsActionMenuOpen(false); setIsReportOpen(true); }} 
                            className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                          >
                            <Flag size={16} /> Signaler
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Boutons principaux */}
            <div className="mt-6 flex items-center gap-2">
              {!isOwnProfile && !isOfficialProfile ? (
                <>
                  <button 
                    type="button" 
                    onClick={() => onSendMessage(profileTarget?.id || profileTarget?._id)} 
                    className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <MessageCircle size={16} className="inline mr-2" />
                    Envoyer un message
                  </button>
                  
                  {isBlockedByMe ? (
                    <button 
                      type="button" 
                      onClick={() => runAction(() => onUnblockUser?.(profileUserId), 'Utilisateur débloqué.')} 
                      className="rounded-lg bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 border border-emerald-500/30"
                      title="Débloquer"
                    >
                      <Unlock size={16} className="inline mr-1" />
                      Débloquer
                    </button>
                  ) : isBlockedByThem ? (
                    <button 
                      type="button" 
                      disabled
                      className="rounded-lg bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 opacity-80 border border-red-500/30"
                      title="Interaction bloquée"
                    >
                      <Ban size={16} className="inline mr-1" />
                      Bloqué
                    </button>
                  ) : !isFriend ? (
                    <button 
                      type="button" 
                      onClick={() => runAction(() => onAddFriend?.(profileTarget), 'Demande envoyée.')} 
                      className="rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 border border-gray-700"
                      title="Ajouter en ami"
                    >
                      <UserPlus size={18} />
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => runAction(() => onRemoveFriend?.(profileUserId), 'Ami supprimé.')} 
                      className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                      title="Retirer des amis"
                    >
                      <Check size={16} className="inline mr-1" />
                      Ami
                    </button>
                  )}
                </>
              ) : isOwnProfile ? (
                <>
                  <button 
                    type="button" 
                    onClick={() => onSave(null, profileDraft)} 
                    className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <Pencil size={16} className="inline mr-2" />
                    Modifier le profil
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsDecorationModalOpen(true)} 
                    className="rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 border border-gray-700"
                    title="Ajouter une décoration"
                  >
                    <Sparkles size={18} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsNameplateModalOpen(true)} 
                    className="rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 border border-gray-700"
                    title="Changer la plaque nominative"
                  >
                    <Type size={18} />
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSpotifyConnect} 
                    className="rounded-lg bg-green-600/20 px-4 py-3 text-sm font-semibold text-green-400 transition hover:bg-green-600/30 border border-green-700"
                    title="Connecter Spotify"
                  >
                    <Music size={16} className="inline mr-2" />
                    Spotify
                  </button>
                </>
              ) : null}
            </div>
            
            {/* Bio */}
            {!isOfficialProfile && (
              <section className="mt-8">
                {isOwnProfile && editingField === 'bio' ? (
                  <textarea 
                    autoFocus 
                    value={profileDraft.bio} 
                    onChange={(event) => setProfileDraft((current) => ({ ...current, bio: event.target.value }))} 
                    onKeyDown={(event) => { 
                      if (event.key === 'Escape') cancelField(); 
                      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) saveField('bio'); 
                    }} 
                    onBlur={() => saveField('bio')} 
                    rows={4} 
                    className="w-full resize-none rounded-lg bg-black p-3 text-sm text-white outline-none border border-gray-700 focus:border-white"
                    placeholder="Parlez de vous..."
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => isOwnProfile && setEditingField('bio')}
                    className="w-full text-left text-sm text-gray-300 whitespace-pre-wrap rounded-lg p-3 hover:bg-white/5 transition"
                  >
                    {profileDraft.bio || 'Aucune bio pour le moment.'}
                    {isOwnProfile && <Pencil size={12} className="inline ml-2 text-gray-600" />}
                  </button>
                )}
              </section>
            )}

            {/* Informations */}
            <section className="mt-8 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Informations
              </h2>
              
              <div className="flex items-center gap-3 text-sm text-gray-400 py-2">
                <Calendar size={16} className="text-gray-600" />
                {isOfficialProfile ? 'Membre depuis toujours' : `Membre depuis le ${formatDate(profileTarget?.createdAt) || 'Indisponible'}`}
              </div>
            </section>
            
            {/* Note */}
            {!isOwnProfile && !isOfficialProfile && (
              <section className="mt-8">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Note personnelle
                </h2>
                {isEditingNote ? (
                  <textarea 
                    autoFocus 
                    value={note} 
                    onChange={(event) => setNote(event.target.value)} 
                    onBlur={() => setIsEditingNote(false)} 
                    rows={3} 
                    className="w-full resize-none rounded-lg bg-black p-3 text-sm text-white outline-none border border-gray-700 focus:border-white"
                    placeholder="Ajouter une note privée..."
                  />
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setIsEditingNote(true)} 
                    className="w-full rounded-lg bg-black p-3 text-left text-sm text-gray-500 transition hover:bg-white/5 hover:text-gray-300 border border-gray-800"
                  >
                    {note || 'Cliquez pour ajouter une note'}
                  </button>
                )}
              </section>
            )}
            
            {actionMessage && (
              <p className="mt-6 rounded-lg bg-white/5 p-3 text-sm text-gray-300 border border-gray-800">
                {actionMessage}
              </p>
            )}
          </div>
        </main>
        
        {/* PARTIE DROITE */}
        {!isOwnProfile && !isOfficialProfile && !isInteractionBlocked && (
          <div 
            className="flex flex-col"
            style={{ 
              width: '55%', 
              minWidth: '280px',
              background: 'black',
              borderLeft: '1px solid #0a0a0a',
            }}
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-800 px-6 pt-4 gap-8">
              <button 
                type="button" 
                onClick={() => setActiveTab('friends')} 
                className={`relative text-sm font-medium transition ${
                  activeTab === 'friends' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
                style={{ paddingBottom: '12px' }}
              >
                Amis en commun
                {commonData.friends.length > 0 && (
                  <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">
                    {commonData.friends.length}
                  </span>
                )}
                {activeTab === 'friends' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                )}
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('servers')} 
                className={`relative text-sm font-medium transition ${
                  activeTab === 'servers' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
                style={{ paddingBottom: '12px' }}
              >
                Serveurs en commun
                {commonServers.length > 0 && (
                  <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">
                    {commonServers.length}
                  </span>
                )}
                {activeTab === 'servers' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                )}
              </button>
            </div>
            
            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {activeTab === 'friends' ? (
                <div className="space-y-1">
                  {isCommonDataLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-white" />
                    </div>
                  ) : commonData.friends.length ? (
                    commonData.friends.map((friend) => (
                      <div 
                        key={friend.id || friend._id} 
                        className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-white/5"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-800">
                          {friend.avatarUrl ? (
                            <img src={friend.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-400">
                              {friend.displayName?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{friend.displayName || friend.username}</p>
                          <p className="truncate text-xs text-gray-500">@{friend.username}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <Users size={32} className="mx-auto mb-3 text-gray-700" />
                      <p className="text-sm text-gray-500">Aucun ami en commun</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {isCommonDataLoading && !commonServers.length ? (
                    <div className="flex justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-white" />
                    </div>
                  ) : commonServers.length ? (
                    commonServers.map((server) => (
                      <div 
                        key={server.id || server._id} 
                        className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-white/5"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-800">
                          {server.avatarUrl ? (
                            <img src={server.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium text-gray-400">
                              {server.name?.charAt(0) || 'S'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{server.name}</p>
                          <p className="truncate text-xs text-gray-500">
                            <Users size={12} className="inline mr-1" />
                            {server.memberCount} membre(s)
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <Server size={32} className="mx-auto mb-3 text-gray-700" />
                      <p className="text-sm text-gray-500">Aucun serveur en commun</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* MODAL DE DÉCORATIONS */}
      {isDecorationModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90" onClick={() => setIsDecorationModalOpen(false)} />
          <div 
            className="relative z-10 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col"
            style={{ 
              background: '#0a0a0a',
              border: '1px solid #2a2a2a',
              maxHeight: '80vh',
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Choisir une décoration</h2>
              <button 
                type="button" 
                onClick={() => setIsDecorationModalOpen(false)} 
                className="rounded-full p-1 text-gray-500 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="flex flex-col gap-8">
                {AVATAR_DECORATIONS.map((category) => (
                  <div key={category.id}>
                    {/* Bannière de catégorie */}
                    <div className="relative mb-4 flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-black">
                      <img 
                        src={category.banner} 
                        alt={category.name} 
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="relative flex flex-col items-center justify-center p-4">
                        <img 
                          src={category.bannerText} 
                          alt={category.name} 
                          className="mb-2"
                          style={{ height: '48px', width: 'auto' }}
                          loading="lazy"
                        />
                        <p className="text-center text-sm font-medium text-white">
                          {category.description}
                        </p>
                        {category.tag && (
                          <p className="absolute top-2 right-2 bg-white px-2 py-0.5 rounded-full font-semibold text-black text-xs">
                            {category.tag}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Grille de décorations */}
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
                      {category.decorations.map((decoration) => (
                        <button
                          key={decoration.id}
                          type="button"
                          onClick={() => handleDecorationSelect(decoration.url)}
                          className={`relative aspect-square rounded-lg border-2 transition hover:scale-105 ${
                            selectedDecoration === decoration.url 
                              ? 'border-white bg-white/10' 
                              : 'border-gray-800 bg-black hover:border-gray-600'
                          }`}
                        >
                          <img 
                            src={decoration.url} 
                            alt={decoration.id} 
                            className="h-full w-full object-contain p-2 pointer-events-none"
                            loading="lazy"
                          />
                          {selectedDecoration === decoration.url && (
                            <div className="absolute top-1 right-1 rounded-full bg-white p-0.5">
                              <Check size={12} className="text-black" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL DE PLAQUES NOMINATIVES */}
      {isNameplateModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90" onClick={() => setIsNameplateModalOpen(false)} />
          <div 
            className="relative z-10 w-full max-w-md rounded-xl shadow-2xl flex flex-col"
            style={{ 
              background: '#0a0a0a',
              border: '1px solid #2a2a2a',
              maxHeight: '80vh',
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Choisir une plaque nominative</h2>
              <button 
                type="button" 
                onClick={() => setIsNameplateModalOpen(false)} 
                className="rounded-full p-1 text-gray-500 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {NAMEPLATES.map((nameplate) => (
                  <button
                    key={nameplate.id}
                    type="button"
                    onClick={() => handleNameplateSelect(nameplate)}
                    className={`rounded-lg border-2 p-4 transition hover:scale-105 relative overflow-hidden ${
                      selectedNameplate?.id === nameplate.id 
                        ? 'border-white bg-white/10' 
                        : 'border-gray-800 bg-black hover:border-gray-600'
                    }`}
                  >
                    {nameplate.url && !nameplateImageError[nameplate.id] && (
                      <div className="absolute inset-0 opacity-20">
                        <img 
                          src={nameplate.url} 
                          alt=""
                          className="h-full w-full object-cover"
                          onError={() => setNameplateImageError(prev => ({ ...prev, [nameplate.id]: true }))}
                        />
                      </div>
                    )}
                    <div className="relative z-10">
                      <div 
                        className="text-lg font-bold mb-2"
                        style={{
                          textShadow: nameplate.glow !== 'none' ? nameplate.glow : undefined,
                        }}
                      >
                        {displayName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {nameplate.name}
                      </div>
                      {selectedNameplate?.id === nameplate.id && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-white">
                          <Check size={12} /> Sélectionné
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Report modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90" onClick={() => setIsReportOpen(false)} />
          <form 
            onSubmit={submitReport} 
            className="relative z-10 w-full max-w-md rounded-xl p-6 shadow-2xl"
            style={{ 
              background: '#0a0a0a',
              border: '1px solid #2a2a2a',
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Signaler un utilisateur</h2>
              <button type="button" onClick={() => setIsReportOpen(false)} className="rounded-full p-1 text-gray-500 hover:bg-white/10 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">Veuillez sélectionner une raison pour ce signalement.</p>
            <div className="mt-4 space-y-1">
              {[
                ['harassment', 'Harcèlement'],
                ['threats', 'Menaces'],
                ['impersonation', "Usurpation d'identité"],
                ['spam', 'Spam'],
                ['scam', 'Arnaque'],
                ['dangerous', 'Contenu dangereux'],
                ['hate', 'Discours haineux'],
                ['abuse', 'Comportement abusif'],
                ['other', 'Autre']
              ].map(([value, label]) => (
                <label 
                  key={value} 
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                    reportReason === value ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="report-reason" 
                    value={value} 
                    checked={reportReason === value} 
                    onChange={(event) => setReportReason(event.target.value)} 
                    className="mt-0.5"
                    required 
                  />
                  <span className="text-sm text-white">{label}</span>
                </label>
              ))}
            </div>
            {reportReason === 'other' && (
              <textarea 
                required 
                value={reportDetails} 
                onChange={(event) => setReportDetails(event.target.value)} 
                placeholder="Décrivez la raison du signalement..." 
                rows={3} 
                className="mt-3 w-full rounded-lg bg-black p-3 text-sm text-white outline-none border border-gray-700 focus:border-white"
              />
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsReportOpen(false)} 
                className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white transition"
              >
                Annuler
              </button>
              <button 
                disabled={reportBusy || !reportReason || (reportReason === 'other' && !reportDetails.trim())} 
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:opacity-40"
              >
                {reportBusy ? 'Envoi...' : 'Envoyer le signalement'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}