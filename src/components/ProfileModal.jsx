import React, { useState, useEffect, useRef } from 'react';
import { 
  X, UserPlus, MoreHorizontal, Send, Ban, Flag, UserMinus, 
  User, Camera, Pencil, Users, Server, MessageCircle, 
  Circle, Heart, Share2, Sparkles, Music, Gamepad2,
  Calendar, Clock, MapPin, Link as LinkIcon, Check, Unlock
} from 'lucide-react';
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
  const isBlocked = profileTarget?.isBlocked || false;
  
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

  const statusColors = {
    online: '#23a55a',
    idle: '#f0b232',
    dnd: '#f23f43',
    offline: '#84858d',
  };

  const userStatus = profileTarget?.status || 'offline';
  const statusColor = statusColors[userStatus] || statusColors.offline;

  // Si bloqué, afficher écran avec bouton débloquer
  if (isBlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/85" onClick={onClose} />
        <div 
          className="relative z-10 flex flex-col items-center justify-center rounded-lg p-8"
          style={{
            width: 'min(500px, calc(100vw - 96px))',
            minHeight: '300px',
            background: 'rgb(0, 0, 0)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="text-center">
            <Ban size={48} className="mx-auto text-white/30 mb-4" />
            <h2 className="text-xl font-bold text-white">Utilisateur bloqué</h2>
            <p className="mt-2 text-sm text-white/50">Vous avez bloqué cet utilisateur.</p>
            <button 
              type="button" 
              onClick={() => runAction(() => onUnblockUser?.(profileUserId), 'Utilisateur débloqué.')}
              className="mt-4 rounded-md bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
            >
              <Unlock size={16} className="inline mr-2" />
              Débloquer
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="mt-2 rounded-md px-6 py-2.5 text-sm text-white/40 transition hover:text-white/70"
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
      <div className="absolute inset-0 bg-black/85" onClick={onClose} />
      
      <div 
        className="relative z-10 flex flex-row overflow-hidden rounded-lg"
        style={{
          width: 'min(962px, calc(100vw - 96px))',
          height: 'min(800px, calc(100vh - 96px))',
          minHeight: '550px',
          background: 'rgb(0, 0, 0)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* PARTIE GAUCHE */}
        <main 
          className="flex flex-col overflow-hidden"
          style={{
            width: 'min(max(300px, calc(45.5vw - 43.68px)), 380px)',
            minWidth: '300px',
          }}
        >
          {/* Bannière */}
          <div className="relative shrink-0 border-b border-white/10" style={{ height: '140px', width: '100%' }}>
            {profileDraft.bannerUrl && !bannerFailed ? (
              <img 
                src={profileDraft.bannerUrl} 
                alt="" 
                className="h-full w-full object-cover" 
                onError={() => setBannerFailed(true)} 
              />
            ) : (
              <div className="h-full w-full" style={{ backgroundColor: 'rgb(0, 0, 0)' }} />
            )}
            
            <button 
              type="button" 
              onClick={onClose} 
              className="absolute rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              style={{ right: '16px', top: '8px' }}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Avatar */}
          <div className="relative px-4" style={{ marginTop: '-60px' }}>
            <div className="relative inline-block">
              <div 
                className="relative overflow-hidden rounded-full"
                style={{ 
                  width: '120px', 
                  height: '120px',
                  border: '6px solid rgb(0, 0, 0)',
                  backgroundColor: 'rgb(0, 0, 0)',
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
              </div>
              <div 
                className="absolute rounded-full border-2 border-black"
                style={{ 
                  bottom: '4px', 
                  right: '4px', 
                  width: '28px', 
                  height: '28px',
                  backgroundColor: statusColor,
                }}
              />
            </div>
          </div>
          
          {/* Corps du profil */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {/* Nom + bouton Plus (UNIQUEMENT si la personne est bloquée) */}
            <div className="mt-2 flex items-start justify-between">
              <div>
                <button 
                  type="button" 
                  disabled={!isOwnProfile} 
                  onClick={() => setEditingField('displayName')} 
                  className="text-left text-2xl font-bold text-white disabled:cursor-default"
                >
                  {displayName}
                </button>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-white/60">@{username}</span>
                  <ProfileBadges badges={profileTarget?.badges} compact />
                </div>
              </div>
              
              {/* UN SEUL bouton Plus - UNIQUEMENT si on a bloqué la personne */}
              {!isOwnProfile && !isOfficialProfile && isBlocked && (
                <div className="relative">
                  <button 
                    type="button" 
                    onClick={() => setIsActionMenuOpen((open) => !open)} 
                    className="rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  
                  {isActionMenuOpen && (
                    <div 
                      className="absolute right-0 z-20 mt-1 overflow-hidden rounded-lg p-1 shadow-xl"
                      style={{ 
                        top: '100%',
                        background: 'rgb(17, 18, 20)',
                        width: '200px',
                      }}
                    >
                      <button 
                        type="button" 
                        onClick={() => runAction(() => onUnblockUser?.(profileUserId), 'Utilisateur débloqué.')}
                        className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-sm text-white hover:bg-[#248046]"
                      >
                        <Unlock size={16} /> Débloquer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Boutons */}
            <div className="mt-3 flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => isOwnProfile ? onSave(null, profileDraft) : onSendMessage(profileTarget?.id || profileTarget?._id)} 
                className="flex-1 rounded-md px-4 py-2 text-sm font-medium text-white transition hover:opacity-80"
                style={{ backgroundColor: 'rgb(85, 85, 85)' }}
              >
                <MessageCircle size={16} className="inline mr-2" />
                {isOwnProfile ? 'Modifier' : 'Envoyer un message'}
              </button>
              
              {/* Bouton AJOUTER EN AMI - UNIQUEMENT si on n'est PAS ami */}
              {!isOwnProfile && !isOfficialProfile && !isFriend && !isBlocked && (
                <button 
                  type="button" 
                  onClick={() => runAction(() => onAddFriend?.(profileTarget), 'Demande envoyée.')} 
                  className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white/60 transition hover:bg-white/20 hover:text-white"
                >
                  <UserPlus size={18} />
                </button>
              )}
              
              {/* Bouton AMI - UNIQUEMENT si on est ami */}
              {!isOwnProfile && !isOfficialProfile && isFriend && !isBlocked && (
                <button 
                  type="button" 
                  onClick={() => runAction(() => onRemoveFriend?.(profileUserId), 'Ami supprimé.')} 
                  className="rounded-md bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/30"
                >
                  <Check size={16} className="inline mr-1" />
                  Ami
                </button>
              )}
            </div>
            
            {/* Bio */}
            {!isOfficialProfile && (
              <section className="mt-5">
                <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">À propos de moi</h2>
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
                  <div className="text-sm text-white/70 whitespace-pre-wrap">
                    {profileDraft.bio || 'Aucune bio pour le moment.'}
                  </div>
                )}
              </section>
            )}
            
            {/* Membre depuis */}
            <section className="mt-4">
              <h2 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">Membre depuis</h2>
              <div className="text-sm text-white/70">
                {isOfficialProfile ? 'Toujours' : formatDate(profileTarget?.createdAt) || 'Indisponible'}
              </div>
            </section>
            
            {/* Note */}
            {!isOwnProfile && !isOfficialProfile && (
              <section className="mt-4">
                <h2 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">Note (seulement visible par toi)</h2>
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
                    className="w-full text-left text-sm text-white/40 hover:text-white/70 transition"
                  >
                    {note || 'Clique pour ajouter une note'}
                  </button>
                )}
              </section>
            )}
            
            {actionMessage && (
              <p className="mt-3 text-sm text-white/60">{actionMessage}</p>
            )}
          </div>
        </main>
        
        {/* PARTIE DROITE - Plus fine (340px) */}
        {!isOwnProfile && !isOfficialProfile && !isBlocked && (
          <div 
            className="flex flex-col border-l border-white/10"
            style={{ width: '340px', minWidth: '280px' }}
          >
            {/* Tabs */}
            <div className="flex border-b border-white/10 px-4 py-3 gap-6">
              <button 
                type="button" 
                onClick={() => setActiveTab('friends')} 
                className={`text-sm font-medium transition ${
                  activeTab === 'friends' 
                    ? 'border-b-2 border-white text-white' 
                    : 'text-white/40 hover:text-white/70'
                }`}
                style={{ paddingBottom: '10px' }}
              >
                {commonData.friends.length > 0 ? `${commonData.friends.length} amis en commun` : 'Amis en commun'}
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('servers')} 
                className={`text-sm font-medium transition ${
                  activeTab === 'servers' 
                    ? 'border-b-2 border-white text-white' 
                    : 'text-white/40 hover:text-white/70'
                }`}
                style={{ paddingBottom: '10px' }}
              >
                {commonServers.length > 0 ? `${commonServers.length} serveurs en commun` : 'Serveurs en commun'}
              </button>
            </div>
            
            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'friends' ? (
                <div className="space-y-2">
                  {isCommonDataLoading ? (
                    <p className="py-4 text-sm text-white/40">Chargement...</p>
                  ) : commonData.friends.length ? (
                    commonData.friends.map((friend) => (
                      <div 
                        key={friend.id || friend._id} 
                        className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 transition"
                      >
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/10">
                          {friend.avatarUrl ? (
                            <img src={friend.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-white/40">
                              {friend.displayName?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white truncate">{friend.displayName || friend.username}</p>
                          <p className="text-xs text-white/40">@{friend.username}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-center text-sm text-white/40">Aucun ami en commun</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {isCommonDataLoading && !commonServers.length ? (
                    <p className="py-4 text-sm text-white/40">Chargement...</p>
                  ) : commonServers.length ? (
                    commonServers.map((server) => (
                      <div 
                        key={server.id || server._id} 
                        className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 transition"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10">
                          {server.avatarUrl ? (
                            <img src={server.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium text-white/40">
                              {server.name?.charAt(0) || 'S'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white truncate">{server.name}</p>
                          <p className="text-xs text-white/40">{server.memberCount} membre(s)</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-center text-sm text-white/40">Aucun serveur en commun</p>
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
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsReportOpen(false)} />
          <form 
            onSubmit={submitReport} 
            className="relative z-10 w-full max-w-md rounded-lg p-5 shadow-2xl"
            style={{ background: 'rgb(49, 51, 56)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Signaler</h2>
              <button type="button" onClick={() => setIsReportOpen(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="mt-2 text-sm text-white/60">Une raison est obligatoire.</p>
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
                <label key={value} className="flex items-center gap-3 rounded px-2 py-2 text-sm text-white hover:bg-white/5">
                  <input type="radio" name="report-reason" value={value} checked={reportReason === value} onChange={(event) => setReportReason(event.target.value)} required />
                  {label}
                </label>
              ))}
            </div>
            {reportReason === 'other' && (
              <textarea required value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} placeholder="Décrivez la raison..." rows={3} className="mt-3 w-full rounded border border-white/10 bg-black/20 p-3 text-sm text-white outline-none" />
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setIsReportOpen(false)} className="rounded px-3 py-2 text-sm text-white/60 hover:underline">Annuler</button>
              <button disabled={reportBusy || !reportReason || (reportReason === 'other' && !reportDetails.trim())} className="rounded bg-[#f23f43] px-3 py-2 text-sm font-medium text-white disabled:opacity-40">
                {reportBusy ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}