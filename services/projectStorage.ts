import type { GenerationResult, RecentProject } from '../types';

const STORAGE_KEY = 'inspira-arte-recent-projects-v1';
const MAX_PROJECTS = 5;

/**
 * Compresses an image data URL to a lightweight JPEG for localStorage saving,
 * preventing QuotaExceededError while maintaining crisp visual fidelity for previews.
 */
export const compressImageForStorage = (
  dataUrl: string,
  maxDimension: number = 640
): Promise<string> => {
  if (!dataUrl) return Promise.resolve('');
  // If already under 180KB and is a valid data URL, keep it
  if (dataUrl.startsWith('data:image') && dataUrl.length < 180 * 1024) {
    return Promise.resolve(dataUrl);
  }
  // If not a data url or blob (and not an http url), return as is
  if (!dataUrl.startsWith('data:image') && !dataUrl.startsWith('blob:') && !dataUrl.startsWith('http')) {
    return Promise.resolve(dataUrl);
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // High efficiency JPEG (~50-90KB)
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressed);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
};

/**
 * Load up to 5 recent projects from localStorage.
 */
export const loadRecentProjects = (): RecentProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_PROJECTS);
  } catch (error) {
    console.error('Error loading recent projects from localStorage:', error);
    return [];
  }
};

/**
 * Save or update a project in localStorage (keeping the last 5).
 */
export const saveRecentProject = async (
  result: GenerationResult
): Promise<RecentProject[]> => {
  if (!result || !result.imageUrl || result.isLoadingQuote) {
    return loadRecentProjects();
  }

  try {
    const existing = loadRecentProjects();

    // Compress image to ensure it fits comfortably in localStorage
    const storedImageUrl = await compressImageForStorage(result.imageUrl);

    const projectToStore: GenerationResult = {
      ...result,
      imageUrl: storedImageUrl,
      isLoadingQuote: false,
    };

    // Check if a similar project already exists (same prompt or theme and similar image)
    const existingIndex = existing.findIndex(
      (p) =>
        p.result.imageUrl === storedImageUrl ||
        (p.result.imagePrompt && p.result.imagePrompt === result.imagePrompt) ||
        (p.result.theme && p.result.theme === result.theme && p.result.quote === result.quote)
    );

    let updated: RecentProject[];

    if (existingIndex >= 0) {
      // Move to top and update with new quote/data
      const found = existing[existingIndex];
      const updatedItem: RecentProject = {
        id: found.id,
        createdAt: Date.now(),
        result: projectToStore,
      };
      updated = [
        updatedItem,
        ...existing.filter((_, idx) => idx !== existingIndex),
      ].slice(0, MAX_PROJECTS);
    } else {
      // New project
      const newProject: RecentProject = {
        id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
        result: projectToStore,
      };
      updated = [newProject, ...existing].slice(0, MAX_PROJECTS);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (quotaError) {
      console.warn('LocalStorage quota reached, saving fewer items:', quotaError);
      // Attempt saving only 3 projects
      try {
        const trimmed = updated.slice(0, 3);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        return trimmed;
      } catch {
        // If still fails, try keeping only 1
        const minimal = updated.slice(0, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
        return minimal;
      }
    }

    return updated;
  } catch (err) {
    console.error('Error saving recent project:', err);
    return loadRecentProjects();
  }
};

/**
 * Delete a specific project by id.
 */
export const deleteRecentProject = (id: string): RecentProject[] => {
  try {
    const existing = loadRecentProjects();
    const filtered = existing.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Error deleting recent project:', error);
    return [];
  }
};

/**
 * Clear all recent projects.
 */
export const clearAllRecentProjects = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing recent projects:', error);
  }
};

/**
 * Human friendly date/time formatting in Portuguese.
 */
export const formatProjectDate = (timestamp: number): string => {
  if (!timestamp) return 'Recente';
  const now = Date.now();
  const diffMinutes = Math.floor((now - timestamp) / (1000 * 60));

  if (diffMinutes < 1) return 'Agora mesmo';
  if (diffMinutes < 60) return `Há ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Há ${diffHours}h`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
