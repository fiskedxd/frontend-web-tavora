export const API_URL = import.meta.env.VITE_API_URL || 'https://backend-web-tavora.fly.dev';

export const uploadFile = async (file, { folder = 'uploads', getAuthHeaders } = {}) => {
  const data = new FormData();
  data.append('file', file);
  data.append('folder', folder);
  const headers = getAuthHeaders ? getAuthHeaders() : {};
  delete headers['Content-Type'];
  const response = await fetch(`${API_URL}/api/uploads`, { method: 'POST', headers, body: data });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Upload impossible.');
  return result.url;
};

export const resolveTrackUrl = (track) => {
  if (!track) return '';
  if (track.url) return track.url;
  if (track.filename?.startsWith('http')) return track.filename;
  if (track.filename) return `${API_URL}/api/files/music/${encodeURIComponent(track.filename)}`;
  return '';
};
