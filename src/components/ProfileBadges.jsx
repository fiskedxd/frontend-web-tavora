import { BadgeCheck, Crown, Monitor, Music, Sparkles } from 'lucide-react';

const fallbackBadges = {
  'first-hour': { id: 'first-hour', name: 'Depuis la première heure', description: 'Membre de Tavora depuis juillet 2026', icon: Sparkles },
  official: { id: 'official', name: 'Compte officiel Tavora', description: 'Compte officiel de la plateforme', icon: BadgeCheck },
  admin: { id: 'admin', name: 'Administrateur', description: 'Administrateur de Tavora', icon: BadgeCheck },
  developer: { id: 'developer', name: 'Développeur', description: 'Développeur de Tavora', icon: BadgeCheck },
  creator: { id: 'creator', name: 'Créateur du site', description: 'Créateur de Tavora', icon: Crown },
  spotify: { id: 'spotify', name: 'Spotify connecté', description: 'Compte Spotify connecté à Tavora', icon: Music },
};

export default function ProfileBadges({ badges = [], compact = false }) {
  return <span className="inline-flex flex-wrap items-center gap-1" aria-label="Badges du profil">{badges.map((badge) => {
    const data = typeof badge === 'string' ? fallbackBadges[badge] : badge;
    if (!data) return null;
    const Icon = data.id === 'creator' ? Crown : data.id === 'developer' ? Monitor : data.id === 'official' || data.id === 'admin' ? BadgeCheck : data.id === 'spotify' ? Music : Sparkles;
    return <span key={data.id || data.name} title={`${data.name} - ${data.description || ''}`} className={`profile-badge inline-flex items-center justify-center text-cyan-100 ${compact ? 'h-5 w-5' : 'h-7 w-7'}`}>{Icon ? <Icon size={compact ? 14 : 18} strokeWidth={1.8} /> : null}<span className="sr-only">{data.name}</span></span>;
  })}</span>;
}
