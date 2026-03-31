import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { localStorage } from '@/lib/storage';
import type { LinkedInProfile } from '@/types/storage';

/** Ensure all profile fields are primitives (guards against stale storage with object values) */
function sanitizeProfile(p: LinkedInProfile): LinkedInProfile {
  return {
    ...p,
    name: String(p.name || ''),
    headline: String(p.headline || ''),
    location: typeof p.location === 'string' ? p.location : undefined,
    about: typeof p.about === 'string' ? p.about : undefined,
    profileUrl: String(p.profileUrl || ''),
    experience: Array.isArray(p.experience) ? p.experience : [],
    education: Array.isArray(p.education) ? p.education : [],
    skills: Array.isArray(p.skills) ? p.skills : [],
  };
}

export function ProfileTab() {
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugDump, setDebugDump] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const setSafeProfile = (p: LinkedInProfile | null) => {
    setProfile(p ? sanitizeProfile(p) : null);
  };

  useEffect(() => {
    localStorage.get('userProfile').then(setSafeProfile);
  }, []);

  const handleFetch = async () => {
    setError(null);
    setDebugDump(null);
    setLoading(true);

    try {
      const response = await chrome.runtime.sendMessage({ type: 'SCRAPE_PROFILE' });

      if (response.type === 'ERROR') {
        setError(response.payload.message);
      } else if (response.type === 'PROFILE_SCRAPED') {
        setSafeProfile(response.payload.profile);
        if (response.payload.profile?.debugDump) {
          setDebugDump(response.payload.profile.debugDump);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    await chrome.storage.local.remove('userProfile');
    setProfile(null);
    setError(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: 'rgba(0,0,0,0.9)' }}>
          Your LinkedIn Profile
        </label>
        <p className="text-xs mb-3" style={{ color: 'rgba(0,0,0,0.6)' }}>
          Import your LinkedIn profile to personalize AI-generated content with your background, experience, and skills.
          You must be logged into LinkedIn in this browser.
        </p>
      </div>

      {/* Action button */}
      {!profile && (
        <button
          onClick={handleFetch}
          disabled={loading}
          className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 rounded-full hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Fetching profile...
            </>
          ) : (
            'Get My Info'
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{ color: '#cc1016', background: '#fef2f2' }}>
          {error}
        </p>
      )}

      {/* Profile Display */}
      {profile && !loading && (
        <div className="space-y-4">
          <div className="h-px" style={{ background: 'rgba(0,0,0,0.08)' }} />

          {/* Name & Headline */}
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'rgba(0,0,0,0.9)' }}>
              {profile.name}
            </h3>
            {profile.headline && (
              <p className="text-sm mt-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>{profile.headline}</p>
            )}
            {profile.location && (
              <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.4)' }}>{profile.location}</p>
            )}
          </div>

          {/* About */}
          {profile.about && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'rgba(0,0,0,0.6)' }}>
                About
              </h4>
              <p
                className="text-sm px-3 py-2 rounded-lg whitespace-pre-line"
                style={{ color: 'rgba(0,0,0,0.9)', background: 'rgba(0,0,0,0.03)' }}
              >
                {profile.about}
              </p>
            </div>
          )}

          {/* Experience */}
          {profile.experience.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'rgba(0,0,0,0.6)' }}>
                Experience
              </h4>
              <div className="space-y-2">
                {profile.experience.map((exp, i) => (
                  <div key={i} className="text-sm">
                    <span style={{ color: 'rgba(0,0,0,0.9)' }} className="font-medium">{exp.title}</span>
                    {exp.company && (
                      <span style={{ color: 'rgba(0,0,0,0.6)' }}> at {exp.company}</span>
                    )}
                    {exp.duration && (
                      <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>{exp.duration}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {profile.education.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'rgba(0,0,0,0.6)' }}>
                Education
              </h4>
              <div className="space-y-2">
                {profile.education.map((edu, i) => (
                  <div key={i} className="text-sm">
                    <span style={{ color: 'rgba(0,0,0,0.9)' }} className="font-medium">{edu.school}</span>
                    {edu.degree && (
                      <span style={{ color: 'rgba(0,0,0,0.6)' }}> — {edu.degree}</span>
                    )}
                    {edu.years && (
                      <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>{edu.years}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'rgba(0,0,0,0.6)' }}>
                Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs rounded-full"
                    style={{ background: 'rgba(10,102,194,0.08)', color: '#0a66c2' }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer: timestamp + actions */}
          <div className="h-px" style={{ background: 'rgba(0,0,0,0.08)' }} />
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>
              Last updated: {new Date(profile.scrapedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleFetch}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors hover:bg-black/[0.04]"
                style={{ color: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,0,0,0.3)' }}
              >
                <RefreshCw size={12} /> Refresh
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors hover:bg-red-50"
                style={{ color: '#cc1016', border: '1px solid rgba(204,16,22,0.3)' }}
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug: raw API responses (temporary, for development) */}
      {debugDump && (
        <div>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs underline"
            style={{ color: 'rgba(0,0,0,0.4)' }}
          >
            {showDebug ? 'Hide' : 'Show'} API debug data
          </button>
          {showDebug && (
            <pre
              className="mt-2 p-3 rounded-lg text-xs overflow-auto max-h-96"
              style={{ background: 'rgba(0,0,0,0.03)', color: 'rgba(0,0,0,0.7)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
            >
              {debugDump}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
