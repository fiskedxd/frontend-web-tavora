import { useEffect, useRef, useState } from 'react';
import { Ban, Camera, Flag, MessageCircle, MoreHorizontal, User, UserMinus, UserPlus, X, Pencil } from 'lucide-react';
import ProfileBadges from './ProfileBadges';
import { API_URL } from '../utils/api';

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
  const initialDraftRef = useRef(profileDraft);

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
    if (!isOwnProfile && !isOfficialProfile && profileUserId && getAuthHeaders) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      fetch(`${API_URL}/api/social/profile/${profileUserId}/common`, { headers: getAuthHeaders(), signal: controller.signal })
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
  const currentServerHasBothUsers = Boolean(
    !isOwnProfile
      && serverContext?.id
      && serverMembers.some((member) => String(member.id || member._id) === String(currentUserId))
      && serverMembers.some((member) => String(member.id || member._id) === String(profileUserId)),
  );
  const commonServers = currentServerHasBothUsers && !commonData.servers.some((server) => String(server.id || server._id) === String(serverContext.id))
    ? [{ ...serverContext, memberCount: serverMembers.length }, ...commonData.servers]
    : commonData.servers;
  
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
  
  const memberRoles = profileTarget?.roles || [];
  const canManageRoles = Boolean(serverContext && profileTarget?.canManageRoles);
  
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      <button 
        type="button" 
        aria-label="Fermer le profil" 
        onClick={onClose} 
        className="absolute inset-0 bg-black/85" 
      />
      
      {/* Discord-style profile modal */}
      <div 
        className="relative z-10 flex flex-row overflow-hidden rounded-lg"
        style={{
          width: 'min(962px, calc(100vw - 96px))',
          height: 'min(800px, calc(100vh - 96px))',
          minHeight: '550px',
          background: 'hsl(0, 0%, 0%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Main profile content */}
        <main 
          className="flex flex-col overflow-hidden"
          style={{
            width: 'min(max(300px, calc(45.5vw - 43.68px)), 400px)',
            minWidth: '300px',
          }}
        >
          {/* Header with banner */}
          <div className="relative shrink-0" style={{ height: '140px', width: '100%' }}>
            {profileDraft.bannerUrl && !bannerFailed ? (
              <img 
                src={profileDraft.bannerUrl} 
                alt="" 
                className="h-full w-full object-cover" 
                onError={() => setBannerFailed(true)} 
              />
            ) : (
              <div className="h-full w-full" style={{ background: 'rgb(0, 0, 0)' }} />
            )}
            
            {/* Close button */}
            <button 
              type="button" 
              onClick={onClose} 
              className="absolute rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              style={{ right: '16px', top: '8px' }}
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Avatar */}
          <div className="relative px-4" style={{ marginTop: '-60px' }}>
            <div className="relative inline-block">
              <div 
                className="relative overflow-hidden rounded-full bg-black"
                style={{ 
                  width: '120px', 
                  height: '120px',
                  border: '6px solid black',
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
                    <User size={48} className="text-white/40" />
                  </div>
                )}
                
                {isOwnProfile && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition hover:opacity-100">
                      <Camera size={24} className="text-white" />
                    </div>
                    <label className="absolute inset-0 cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(event) => onImageChange(event, 'avatarUrl')} 
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
            
            {/* More actions button */}
            {!isOwnProfile && (
              <div className="absolute bottom-0 right-4">
                <button 
                  type="button" 
                  onClick={() => setIsActionMenuOpen((open) => !open)} 
                  className="rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white"
                  aria-label="Plus"
                >
                  <MoreHorizontal size={20} />
                </button>
                
                {isActionMenuOpen && (
                  <div 
                    className="absolute right-0 z-20 overflow-hidden rounded-lg p-1.5 shadow-xl"
                    style={{ 
                      bottom: '48px',
                      background: 'rgb(17, 18, 20)',
                      width: '224px',
                    }}
                  >
                    <button 
                      type="button" 
                      onClick={() => runAction(() => onAddFriend?.(profileTarget), 'Demande envoyée.')} 
                      className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-sm text-white hover:bg-[#248046]"
                    >
                      <UserPlus size={16} /> Ajouter en ami
                    </button>
                    <button 
                      type="button" 
                      onClick={() => runAction(() => onRemoveFriend?.(profileUserId), 'Ami supprimé.')} 
                      className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-sm text-white hover:bg-[#3c45a5]"
                    >
                      <UserMinus size={16} /> Supprimer des amis
                    </button>
                    <div className="my-1 border-t border-white/10" />
                    <button 
                      type="button" 
                      onClick={() => runAction(() => onBlockUser?.(profileUserId), 'Utilisateur bloqué.')} 
                      className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-sm text-[#f23f43] hover:bg-[#f23f43] hover:text-white"
                    >
                      <Ban size={16} /> Bloquer
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setIsActionMenuOpen(false); setIsReportOpen(true); }} 
                      className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-sm text-white hover:bg-[#4e5058]"
                    >
                      <Flag size={16} /> Signaler
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Profile body */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {/* Name */}
            <div className="mb-4">
              {isOwnProfile && editingField === 'displayName' ? (
                <input 
                  autoFocus 
                  value={profileDraft.displayName} 
                  onChange={(event) => setProfileDraft((current) => ({ ...current, displayName: event.target.value }))} 
                  onKeyDown={(event) => { 
                    if (event.key === 'Enter') saveField('displayName'); 
                    if (event.key === 'Escape') cancelField(); 
                  }} 
                  onBlur={() => saveField('displayName')} 
                  className="w-full bg-transparent text-2xl font-bold text-white outline-none"
                />
              ) : (
                <button 
                  type="button" 
                  disabled={!isOwnProfile} 
                  onClick={() => setEditingField('displayName')} 
                  className="text-left text-2xl font-bold text-white disabled:cursor-default"
                >
                  {displayName}
                </button>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-sm text-white/60">{username}</span>
                <ProfileBadges badges={profileTarget?.badges} compact />
                {profileTarget?.isSuspect && (
                  <span 
                    title="Ce compte fait actuellement l'objet d'une vérification suite à plusieurs signalements." 
                    className="rounded bg-[#f23f43]/20 px-2 py-0.5 text-xs font-semibold text-[#f23f43]"
                  >
                    Compte suspect
                  </span>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            {!isOfficialProfile && (
              <div className="mb-5 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => isOwnProfile ? onSave(null, profileDraft) : onSendMessage(profileTarget?.id || profileTarget?._id)} 
                  className="flex-1 rounded-full px-4 py-2 text-sm font-medium text-white transition"
                  style={{ background: 'hsl(0, 0%, 33.3%)' }}
                >
                  {isOwnProfile ? 'Enregistrer' : 'Envoyer un message'}
                </button>
                
                {!isOwnProfile && (
                  <>
                    <button 
                      type="button" 
                      onClick={() => runAction(() => onAddFriend?.(profileTarget), 'Demande envoyée.')} 
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                      aria-label="Ajouter en ami"
                    >
                      <UserPlus size={18} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsActionMenuOpen((open) => !open)} 
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                      aria-label="Plus"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </>
                )}
              </div>
            )}
            
            {/* Bio */}
            {!isOfficialProfile && (
              <section className="mb-5">
                <h2 className="mb-2 text-xs font-semibold uppercase text-white/50">À propos de moi</h2>
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
                    rows={3} 
                    className="w-full resize-none bg-transparent text-sm text-white outline-none"
                  />
                ) : (
                  <div className="text-sm text-white">
                    {profileDraft.bio || 'Aucune bio pour le moment.'}
                  </div>
                )}
              </section>
            )}
            
            {/* Member since */}
            <section className="mb-5">
              <h2 className="mb-1 text-xs font-semibold uppercase text-white/50">Membre depuis</h2>
              <div className="text-sm text-white">
                {isOfficialProfile ? 'Toujours' : formatDate(profileTarget?.createdAt) || 'Indisponible'}
              </div>
            </section>
            
            {/* Note */}
            {!isOwnProfile && !isOfficialProfile && (
              <section className="mb-5">
                <h2 className="mb-1 text-xs font-semibold uppercase text-white/50">Note (seulement visible par toi)</h2>
                {isEditingNote ? (
                  <textarea 
                    autoFocus 
                    value={note} 
                    onChange={(event) => setNote(event.target.value)} 
                    onBlur={() => setIsEditingNote(false)} 
                    rows={2} 
                    className="w-full resize-none bg-transparent text-sm text-white outline-none"
                    placeholder="Clique pour ajouter une note"
                  />
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setIsEditingNote(true)} 
                    className="w-full text-left text-sm text-white/50 hover:text-white/70"
                  >
                    {note || 'Clique pour ajouter une note'}
                  </button>
                )}
              </section>
            )}
            
            {/* Server roles */}
            {serverContext && (
              <section className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase text-white/50">
                    Rôles dans {serverContext.name}
                  </h2>
                  {canManageRoles && (
                    <button 
                      type="button" 
                      onClick={() => setIsActionMenuOpen((open) => !open)} 
                      className="rounded bg-white/10 p-1 text-white/60 hover:bg-white/20"
                      title="Gérer les rôles"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {memberRoles.map((role) => (
                    <span 
                      key={role._id} 
                      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs"
                      style={{ 
                        borderColor: `${role.color}40`, 
                        color: role.color 
                      }}
                    >
                      {role.iconUrl && (
                        <img src={role.iconUrl} alt="" className="h-4 w-4 rounded object-cover" />
                      )}
                      {role.name}
                    </span>
                  ))}
                  {!memberRoles.length && (
                    <span className="text-xs text-white/50">@everyone</span>
                  )}
                </div>
                
                {canManageRoles && isActionMenuOpen && (
                  <div className="mt-3 space-y-1 rounded-lg p-2" style={{ background: 'rgb(17, 18, 20)' }}>
                    {serverRoles.filter((role) => !role.isEveryone).map((role) => {
                      const assigned = memberRoles.some((item) => String(item._id) === String(role._id));
                      return (
                        <button 
                          key={role._id} 
                          type="button" 
                          onClick={() => runAction(() => onToggleMemberRole?.(profileUserId, role), assigned ? 'Rôle retiré.' : 'Rôle attribué.')} 
                          className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                        >
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: role.color }} />
                          {role.name}
                          <span className="ml-auto text-xs text-white/50">
                            {assigned ? 'Retirer' : 'Ajouter'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
            
            {/* Messages */}
            {(profileMessage || actionMessage) && (
              <p className="mb-4 text-sm text-white/70">
                {actionMessage || profileMessage}
              </p>
            )}
          </div>
        </main>
        
        {/* Right sidebar with tabs */}
        {!isOwnProfile && !isOfficialProfile && (
          <div 
            className="flex shrink-0 flex-col border-l border-white/10"
            style={{ width: '280px' }}
          >
            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 px-3 py-3">
              <button 
                type="button" 
                onClick={() => setActiveTab('friends')} 
                className="text-sm font-medium transition"
                style={{ color: activeTab === 'friends' ? 'white' : 'rgba(255, 255, 255, 0.5)' }}
              >
                {commonData.friends.length > 0 ? `${commonData.friends.length} amis en commun` : 'Amis en commun'}
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('servers')} 
                className="text-sm font-medium transition"
                style={{ color: activeTab === 'servers' ? 'white' : 'rgba(255, 255, 255, 0.5)' }}
              >
                {commonServers.length > 0 ? `${commonServers.length} serveurs en commun` : 'Serveurs en commun'}
              </button>
            </div>
            
            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeTab === 'friends' ? (
                <div className="space-y-1">
                  {isCommonDataLoading ? (
                    <p className="py-4 text-sm text-white/50">Chargement...</p>
                  ) : commonData.friends.length ? (
                    commonData.friends.map((friend) => (
                      <div 
                        key={friend.id || friend._id} 
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
                      >
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10">
                          {friend.avatarUrl ? (
                            <img src={friend.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <User size={16} className="text-white/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white">
                            {friend.displayName || friend.username}
                          </p>
                          <p className="truncate text-xs text-white/50">
                            @{friend.username}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-sm text-white/50">Aucun ami en commun</p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {isCommonDataLoading && !commonServers.length ? (
                    <p className="py-4 text-sm text-white/50">Chargement...</p>
                  ) : commonServers.length ? (
                    commonServers.map((server) => (
                      <div 
                        key={server.id || server._id} 
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10">
                          {server.avatarUrl ? (
                            <img src={server.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium text-white/60">
                              {server.name?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white">{server.name}</p>
                          <p className="truncate text-xs text-white/50">
                            {server.memberCount} membre(s)
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-sm text-white/50">Aucun serveur en commun</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Report modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button 
            type="button" 
            aria-label="Fermer le signalement" 
            onClick={() => setIsReportOpen(false)} 
            className="absolute inset-0 bg-black/70" 
          />
          <form 
            onSubmit={submitReport} 
            className="relative z-10 w-full max-w-md rounded-lg p-5 shadow-2xl"
            style={{ background: 'rgb(49, 51, 56)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Signaler cet utilisateur
              </h2>
              <button 
                type="button" 
                onClick={() => setIsReportOpen(false)} 
                className="text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="mt-2 text-sm text-white/60">
              Une raison est obligatoire.
            </p>
            
            <div className="mt-4 space-y-1">
              {[
                ['harassment', 'Harcèlement'],
                ['threats', 'Menaces'],
                ['impersonation', "Usurpation d'identité"],
                ['spam', 'Spam'],
                ['scam', 'Arnaque'],
                ['dangerous', 'Contenu dangereux ou inapproprié'],
                ['hate', 'Discours haineux'],
                ['abuse', 'Comportement abusif'],
                ['other', 'Autre']
              ].map(([value, label]) => (
                <label 
                  key={value} 
                  className="flex items-center gap-3 rounded px-2 py-2 text-sm text-white hover:bg-white/5"
                >
                  <input 
                    type="radio" 
                    name="report-reason" 
                    value={value} 
                    checked={reportReason === value} 
                    onChange={(event) => setReportReason(event.target.value)} 
                    required 
                  />
                  {label}
                </label>
              ))}
            </div>
            
            {reportReason === 'other' && (
              <textarea 
                required 
                value={reportDetails} 
                onChange={(event) => setReportDetails(event.target.value)} 
                placeholder="Décrivez la raison..." 
                rows={3} 
                className="mt-3 w-full rounded border border-white/10 bg-black/20 p-3 text-sm text-white outline-none"
              />
            )}
            
            <div className="mt-5 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsReportOpen(false)} 
                className="rounded px-3 py-2 text-sm text-white/60 hover:underline"
              >
                Annuler
              </button>
              <button 
                disabled={reportBusy || !reportReason || (reportReason === 'other' && !reportDetails.trim())} 
                className="rounded bg-[#f23f43] px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
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