import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, Copy, Hash, Home, Link2, MessageSquare, Plus, Search, Settings2, User, UserPlus, Users, Volume2 } from 'lucide-react';

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
const AvatarWithDecoration = ({ user, size = 'h-9 w-9', className = '' }) => {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const decoration = user?.avatarDecoration || null;
  const avatarUrl = user?.avatarUrl || '';
  const sizePx = size === 'h-9 w-9' ? 36 : size === 'h-7 w-7' ? 28 : 40;
  
  return (
    <div className={`relative ${className}`} style={{ width: sizePx, height: sizePx }}>
      <div 
        className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#16161d] text-xs font-semibold text-white/50`}
        style={{ 
          width: sizePx, 
          height: sizePx,
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
          <User size={sizePx * 0.4} className="text-white/20" />
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
            width: sizePx * 0.7,
            height: sizePx * 0.75,
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

const ServerIcon = ({ server }) => {
  const [failed, setFailed] = React.useState(false);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
  const imageUrl = server?.avatarUrl ? `${server.avatarUrl}?t=${avatarTimestamp}` : "";

  return imageUrl && !failed ? (
    <img src={imageUrl} alt="" className="h-full w-full rounded-xl object-cover" onError={() => setFailed(true)} />
  ) : (
    server?.name?.charAt(0)?.toUpperCase() || 'S'
  );
};

// Composant Avatar simple (pour la compatibilité)
const Avatar = ({ person, size = 'h-9 w-9' }) => (
  <div className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#16161d] text-xs font-semibold text-white/50`}>
    {person?.avatarUrl ? <img src={person.avatarUrl} alt="" className="h-full w-full object-cover" /> : <User size={16} />}
  </div>
);

export default function WorkspaceSidebar({
  selectedServer,
  activeChannelId,
  isDmMode,
  friends,
  friendSearch,
  onFriendSearchChange,
  onOpenServer,
  onOpenHome,
  onOpenChannel,
  onOpenProfile,
  onOpenDirectMessage,
  user,
  onOpenSettings,
  isServerOwner,
  onOpenServerSettings,
  canManageChannels = false,
  onCreateChannel,
  onEditChannel,
  onDeleteChannel,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onOpenInvite,
  onJoinServer,
  onOpenFriendModal,
  incomingRequests = [],
  onFriendRequestDecision,
  className = '',
}) {
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const serverMenuRef = useRef(null);
  const categories = selectedServer?.structure?.categories || [];
  const filteredFriends = friends.filter((friend) => {
    const label = `${friend.displayName || ''} ${friend.username || ''}`.toLowerCase();
    return label.includes(friendSearch.toLowerCase());
  });

  useEffect(() => {
    setBannerFailed(false);
    setIsServerMenuOpen(false);
    setContextMenu(null);
  }, [selectedServer?.id, selectedServer?.bannerUrl]);

  useEffect(() => {
    if (!isServerMenuOpen) return undefined;
    const handleOutsideClick = (event) => {
      if (!serverMenuRef.current?.contains(event.target)) setIsServerMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isServerMenuOpen]);

  useEffect(() => {
    if (!contextMenu) return undefined;
    const close = () => setContextMenu(null);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [contextMenu]);

  const copyServerId = async () => {
    if (!selectedServer?.id) return;
    try {
      await navigator.clipboard.writeText(String(selectedServer.id));
    } catch {
      // Clipboard access can be unavailable outside a secure browser context.
    }
    setIsServerMenuOpen(false);
  };

  return (
    <aside className={`tavora-navigation flex w-[272px] shrink-0 flex-col border-r ${className}`}>
      {selectedServer && !isDmMode ? (
        <>
          <button type="button" onClick={onOpenHome} className="flex items-center gap-3 border-b px-4 py-3 text-left text-sm text-white/55 transition hover:bg-white/[0.045] hover:text-white">
            <Home size={16} /> Accueil
          </button>
          {selectedServer.bannerUrl && !bannerFailed ? <img src={selectedServer.bannerUrl} alt={`Bannière de ${selectedServer.name}`} className="block h-24 w-full object-cover" onError={() => setBannerFailed(true)} /> : null}
          <div ref={serverMenuRef} className="tavora-sidebar-header relative border-b">
            <div role="button" tabIndex={0} onClick={() => setIsServerMenuOpen((open) => !open)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setIsServerMenuOpen((open) => !open); }} className="flex h-16 cursor-pointer items-center justify-between px-4 text-left transition hover:bg-white/[0.035]" aria-expanded={isServerMenuOpen}>
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#16161d] text-sm font-semibold text-white/70">
                <ServerIcon server={selectedServer} timestamp={avatarTimestamp} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{selectedServer.name}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Espace communautaire</p>
              </div>
            </div>
            <span className="flex items-center gap-2 text-white/35">
              <ChevronDown size={16} className={`transition-transform ${isServerMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </span>
            </div>
            {isServerMenuOpen ? (
              <div className="absolute left-3 right-3 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border bg-[#08080a] p-1 shadow-2xl shadow-black/60">
                <button type="button" onClick={() => { setIsServerMenuOpen(false); onOpenInvite(); }} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white">
                  <Link2 size={15} /> Inviter
                </button>
                <button type="button" onClick={copyServerId} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white">
                  <Copy size={15} /> Copier l’identifiant
                </button>
                {isServerOwner ? (
                  <>
                    <div className="my-1 border-t" />
                    <button type="button" onClick={() => { setIsServerMenuOpen(false); onOpenServerSettings(); }} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white">
                      <Settings2 size={15} /> Paramètres du serveur
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-5">
            {categories.map((category) => (
              <section key={category.id} className="mb-6" onContextMenu={(event) => { if (!canManageChannels) return; event.preventDefault(); setContextMenu({ x: event.clientX, y: event.clientY, category }); }}>
                <div className="mb-2 flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">
                  <span>{category.name}</span>
                  {canManageChannels ? <button type="button" onClick={() => onCreateChannel(category)} className="rounded p-0.5 text-white/30 transition hover:bg-white/10 hover:text-white" title="Créer un salon" aria-label={`Créer un salon dans ${category.name}`}><Plus size={13} /></button> : <Plus size={13} className="text-white/20" />}
                </div>
                <div className="space-y-1">
                  {(category.channels || []).map((channel) => {
                    const active = String(activeChannelId) === String(channel.id);
                    return (
                      <button key={channel.id} type="button" onClick={() => onOpenChannel(channel.id)} onContextMenu={(event) => { if (!canManageChannels) return; event.preventDefault(); setContextMenu({ x: event.clientX, y: event.clientY, channel }); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${active ? 'bg-white/[0.10] text-white shadow-[inset_2px_0_0_#9bdcff]' : 'text-white/45 hover:bg-white/[0.045] hover:text-white/80'}`}>
                        {channel.type === 'voice' ? <Volume2 size={16} /> : <Hash size={16} />}
                        <span className="truncate">{channel.name}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
            {canManageChannels ? <button type="button" onClick={onCreateCategory} className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-white/30 transition hover:bg-white/[0.045] hover:text-white"><Plus size={14} /> Ajouter une catégorie</button> : null}
          </div>
          {contextMenu ? <div className="fixed z-[100] min-w-44 rounded-lg border border-white/10 bg-[#0b0b10] p-1 shadow-2xl" style={{ left: contextMenu.x, top: contextMenu.y }} onMouseDown={(event) => event.stopPropagation()}>
            {contextMenu.channel ? <>
              <button type="button" onClick={() => { setContextMenu(null); onEditChannel(contextMenu.channel); }} className="block w-full rounded px-3 py-2 text-left text-xs text-white/70 hover:bg-white/10 hover:text-white">Modifier le salon</button>
              <button type="button" onClick={() => { setContextMenu(null); onDeleteChannel(contextMenu.channel); }} className="block w-full rounded px-3 py-2 text-left text-xs text-rose-300/80 hover:bg-rose-500/10">Supprimer le salon</button>
            </> : <>
              <button type="button" onClick={() => { setContextMenu(null); onCreateChannel(contextMenu.category); }} className="block w-full rounded px-3 py-2 text-left text-xs text-white/70 hover:bg-white/10 hover:text-white">Créer un salon</button>
              <button type="button" onClick={() => { setContextMenu(null); onEditCategory(contextMenu.category); }} className="block w-full rounded px-3 py-2 text-left text-xs text-white/70 hover:bg-white/10 hover:text-white">Renommer la catégorie</button>
              <button type="button" onClick={() => { setContextMenu(null); onDeleteCategory(contextMenu.category); }} className="block w-full rounded px-3 py-2 text-left text-xs text-rose-300/80 hover:bg-rose-500/10">Supprimer la catégorie</button>
            </>}
          </div> : null}
        </>
      ) : (
        <>
          <div className="border-b px-4 py-4">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input value={friendSearch} onChange={(event) => onFriendSearchChange(event.target.value)} placeholder="Rechercher" className="w-full rounded-lg border border-white/[0.07] bg-black/20 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-200/30" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-5">
            <div className="mb-5 flex items-center justify-between px-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Messages privés</p>
              <button type="button" onClick={() => onOpenProfile(user, true)} className="text-white/30 transition hover:text-white"><Settings2 size={15} /></button>
            </div>
            <button type="button" onClick={onOpenHome} className="mb-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/55 transition hover:bg-white/[0.045] hover:text-white"><MessageSquare size={16} /> Accueil</button>
            <div className="space-y-1">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="group flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-white/[0.045]">
                  <button type="button" onClick={() => onOpenDirectMessage(friend.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <AvatarWithDecoration user={friend} size="h-9 w-9" />
                    <DisplayNameWithNameplate user={friend} className="truncate text-sm text-white/60 group-hover:text-white" />
                  </button>
                  <button type="button" onClick={() => onOpenProfile(friend, false)} className="text-white/20 opacity-0 transition group-hover:opacity-100 hover:text-white"><Users size={14} /></button>
                </div>
              ))}
              {!filteredFriends.length ? <p className="px-2 py-5 text-center text-xs text-white/25">Aucune conversation</p> : null}
            </div>
          </div>
        </>
      )}
      <div className="tavora-user-dock p-3">
        {/* === PARTIE MODIFIÉE AVEC DÉCORATION ET PLAQUE === */}
<div className="tavora-user-dock border-t p-3">
  <div className="flex items-center gap-3 rounded-xl px-2 py-2">
    {/* Le conteneur entier avec la plaque en arrière-plan */}
    <div 
      className="flex items-center gap-3 w-full rounded-xl px-2 py-2 relative"
      style={{
        backgroundImage: user?.nameplate && user.nameplate !== 'none' 
          ? `url(${NAMEPLATES.find(n => n.id === user.nameplate)?.url})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '48px',
      }}
    >
      {/* Avatar */}
      <button type="button" onClick={() => onOpenProfile(user, true)} className="shrink-0">
        <AvatarWithDecoration user={user} size="h-9 w-9" />
      </button>
      
      {/* Nom + statut */}
      <button 
        type="button" 
        onClick={() => onOpenProfile(user, true)} 
        className="min-w-0 flex-1 text-left"
      >
        <span 
          className="block truncate text-sm font-medium"
          style={{
            color: user?.nameplate && user.nameplate !== 'none' 
              ? NAMEPLATES.find(n => n.id === user.nameplate)?.color || '#ffffff'
              : '#ffffff',
            textShadow: user?.nameplate && user.nameplate !== 'none' && NAMEPLATES.find(n => n.id === user.nameplate)?.glow !== 'none'
              ? NAMEPLATES.find(n => n.id === user.nameplate)?.glow
              : undefined,
          }}
        >
          {user?.displayName || user?.username || 'Utilisateur'}
        </span>
        <p className="truncate text-[11px] text-emerald-300/70">
          {user?.status || 'En ligne'}{user?.customStatus ? ` · ${user.customStatus}` : ''}
        </p>
      </button>
      
      {/* Icône paramètres */}
      <button 
        type="button" 
        onClick={onOpenSettings} 
        className="text-white/25 hover:text-white shrink-0"
      >
        <Settings2 size={16} />
      </button>
    </div>
  </div>
  
  {/* ===== BOUTONS DU BAS ===== */}
  <div className="mt-2 grid grid-cols-3 gap-1 border-t border-white/[0.06] pt-2">
    <button 
      type="button" 
      onClick={onJoinServer} 
      className="flex items-center justify-center rounded-lg p-2 text-white/45 transition hover:bg-white/[0.06] hover:text-white" 
      title="Serveurs" 
      aria-label="Serveurs"
    >
      <Plus size={15} />
    </button>
    <button 
      type="button" 
      onClick={onOpenFriendModal} 
      className="flex items-center justify-center rounded-lg p-2 text-white/45 transition hover:bg-white/[0.06] hover:text-white" 
      title="Amis" 
      aria-label="Amis"
    >
      <UserPlus size={15} />
    </button>
    <button 
      type="button" 
      onClick={() => setIsNotificationsOpen((open) => !open)} 
      className="relative flex items-center justify-center rounded-lg p-2 text-white/45 transition hover:bg-white/[0.06] hover:text-white" 
      title="Alertes" 
      aria-label="Alertes"
    >
      <Bell size={15} />
      {incomingRequests.length ? <span className="absolute right-2 top-1 h-1.5 w-1.5 rounded-full bg-cyan-200" /> : null}
    </button>
  </div>
</div>
        {/* === FIN PARTIE MODIFIÉE === */}
      
        {isNotificationsOpen ? (
          <div className="mt-2 border border-white/[0.08] bg-[#0d0d12] p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Demandes d’amis</p>
              <span className="text-[10px] text-white/25">{incomingRequests.length}</span>
            </div>
            {incomingRequests.length ? incomingRequests.map((request) => (
              <div key={request.id} className="border-t border-white/[0.06] py-2">
                <p className="truncate text-xs text-white/70">{request.displayName || request.username}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => onFriendRequestDecision?.(request.id, 'accept')} className="text-[10px] text-emerald-200/80 hover:text-emerald-100">Accepter</button>
                  <button type="button" onClick={() => onFriendRequestDecision?.(request.id, 'decline')} className="text-[10px] text-rose-200/70 hover:text-rose-100">Refuser</button>
                </div>
              </div>
            )) : <p className="py-2 text-xs text-white/30">Aucune nouvelle demande.</p>}
          </div>
        ) : null}
      </div>
    </aside>
  );
}