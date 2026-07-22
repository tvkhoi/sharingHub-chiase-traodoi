export const DEFAULT_ASSET_IMAGE = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';

export const getImageUrl = (url?: string): string => {
  if (!url) return DEFAULT_ASSET_IMAGE;
  
  // Convert legacy localhost URLs to live Render backend
  if (url.startsWith('http://localhost:5000') || url.startsWith('http://localhost:3000')) {
    const relativePath = url.replace(/^http:\/\/localhost:\d+/, '');
    return `https://sharinghub-chiase-traodoi.onrender.com${relativePath}`;
  }

  // Convert relative upload paths
  if (url.startsWith('/uploads')) {
    return `https://sharinghub-chiase-traodoi.onrender.com${url}`;
  }

  return url;
};
