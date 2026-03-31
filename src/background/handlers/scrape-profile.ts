import type { LinkedInProfile } from '@/types/storage';

/**
 * Injected into a LinkedIn tab (MAIN world).
 * Uses the modern /dash/ Voyager API endpoints.
 */
async function fetchProfileViaAPI() {
  try {
    const cookieMatch = document.cookie.match(/JSESSIONID="?([^";]+)"?/);
    if (!cookieMatch) {
      return { error: 'Not logged into LinkedIn. Please log in and try again.' };
    }
    const csrfToken = cookieMatch[1];
    const headers: Record<string, string> = {
      'csrf-token': csrfToken,
      'x-restli-protocol-version': '2.0.0',
    };

    // 1. Get user info from /me
    const meRes = await fetch('/voyager/api/me', { headers });
    if (!meRes.ok) return { error: `Failed to fetch /me: ${meRes.status}` };
    const meData = await meRes.json();
    const miniProfile = meData.miniProfile;
    if (!miniProfile?.publicIdentifier) return { error: 'No publicIdentifier' };

    const publicId = miniProfile.publicIdentifier;
    const name = `${miniProfile.firstName || ''} ${miniProfile.lastName || ''}`.trim();
    const headline = String(miniProfile.occupation || '');
    const profileUrl = `https://www.linkedin.com/in/${publicId}/`;

    // Extract the profile hash from entityUrn (e.g. "urn:li:fs_miniProfile:ABC123" → "ABC123")
    const profileHash = miniProfile.entityUrn?.replace('urn:li:fs_miniProfile:', '') || '';

    // 2. Fetch dash/profiles for summary, location, and other data
    let about = '';
    let location = '';
    const dashRes = await fetch(
      `/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity=${publicId}`,
      { headers },
    );
    if (dashRes.ok) {
      const dashData = await dashRes.json();
      const el = dashData.elements?.[0];
      if (el) {
        // Summary is in multiLocaleSummary keyed by locale (e.g. "ru_RU", "en_US")
        if (el.multiLocaleSummary) {
          const locales = Object.values(el.multiLocaleSummary) as string[];
          about = locales[0] || '';
        }

        // Location: try geoLocation or geoLocationName
        if (el.geoLocationName) {
          location = String(el.geoLocationName);
        } else if (el.geoLocation) {
          location = typeof el.geoLocation === 'string' ? el.geoLocation : (el.geoLocation.city || el.geoLocation.full || '');
        }
      }
    }

    // 3. Fetch profile cards for experience, education, skills
    const experience: Array<{ title: string; company: string; duration?: string }> = [];
    const education: Array<{ school: string; degree?: string; years?: string }> = [];
    const skills: string[] = [];

    if (profileHash) {
      const cardTypes = ['EXPERIENCE', 'EDUCATION', 'SKILLS'];
      const cardUrns = cardTypes.map(
        (t) => `urn:li:fsd_profileCard:(${profileHash},${t},en_US)`,
      );
      const encodedUrns = encodeURIComponent(`List(${cardUrns.join(',')})`);

      try {
        const cardsRes = await fetch(
          `/voyager/api/identity/dash/profileCards?q=cardUrns&cardUrns=${encodedUrns}`,
          { headers },
        );
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          const cards = cardsData.elements || [];

          for (const card of cards) {
            const topComponents = card.topComponents || [];

            for (const comp of topComponents) {
              const compType = comp.componentKey || comp.type || '';

              // Experience entries
              if (compType.includes('experience') || compType.includes('position')) {
                const entity = comp.components?.entityComponent;
                if (entity) {
                  const title = entity.titleV2?.text?.text || entity.title?.text || '';
                  const company = entity.subtitle?.text || '';
                  const duration = entity.caption?.text || '';
                  if (title || company) {
                    experience.push({
                      title: String(title),
                      company: String(company),
                      duration: duration ? String(duration) : undefined,
                    });
                  }
                }
                // Nested positions (multiple roles at same company)
                const subComps = comp.components?.entityComponent?.subComponents?.components || [];
                for (const sub of subComps) {
                  const subEntity = sub.components?.entityComponent;
                  if (subEntity) {
                    const title = subEntity.titleV2?.text?.text || subEntity.title?.text || '';
                    const caption = subEntity.caption?.text || '';
                    if (title) {
                      experience.push({
                        title: String(title),
                        company: '',
                        duration: caption ? String(caption) : undefined,
                      });
                    }
                  }
                }
              }

              // Education entries
              if (compType.includes('education')) {
                const entity = comp.components?.entityComponent;
                if (entity) {
                  const school = entity.titleV2?.text?.text || entity.title?.text || '';
                  const degree = entity.subtitle?.text || '';
                  const years = entity.caption?.text || '';
                  if (school) {
                    education.push({
                      school: String(school),
                      degree: degree ? String(degree) : undefined,
                      years: years ? String(years) : undefined,
                    });
                  }
                }
              }

              // Skills entries
              if (compType.includes('skill')) {
                const entity = comp.components?.entityComponent;
                if (entity) {
                  const skillName = entity.titleV2?.text?.text || entity.title?.text || '';
                  if (skillName) skills.push(String(skillName));
                }
              }
            }
          }
        }
      } catch { /* profile cards fetch failed, non-critical */ }
    }

    return { name, headline, location, about, profileUrl, experience, education, skills };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function handleScrapeProfile(): Promise<LinkedInProfile> {
  const tabs = await chrome.tabs.query({ url: 'https://www.linkedin.com/*' });
  let tabId: number;
  let openedNewTab = false;

  if (tabs.length > 0 && tabs[0].id) {
    tabId = tabs[0].id;
  } else {
    const tab = await chrome.tabs.create({ url: 'https://www.linkedin.com/feed/', active: false });
    tabId = tab.id!;
    openedNewTab = true;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        reject(new Error('LinkedIn took too long to load.'));
      }, 30000);
      const listener = (id: number, info: chrome.tabs.TabChangeInfo) => {
        if (id === tabId && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          clearTimeout(timeout);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: fetchProfileViaAPI,
    world: 'MAIN' as chrome.scripting.ExecutionWorld,
  });

  if (openedNewTab) {
    try { await chrome.tabs.remove(tabId); } catch { /* */ }
  }

  const result = results[0]?.result;
  if (!result) throw new Error('Failed to execute profile fetch.');
  if (result.error) throw new Error(result.error);
  if (!result.name) throw new Error('Could not extract profile name.');

  const profile: LinkedInProfile = {
    name: String(result.name || ''),
    headline: String(result.headline || ''),
    location: result.location ? String(result.location) : undefined,
    about: result.about ? String(result.about) : undefined,
    profileUrl: String(result.profileUrl || ''),
    experience: result.experience || [],
    education: result.education || [],
    skills: result.skills || [],
    scrapedAt: Date.now(),
  };

  await chrome.storage.local.set({ userProfile: profile });
  return profile;
}
