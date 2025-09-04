import React, { createContext, useContext, useState, useEffect } from 'react';
import { FeatureFlag, User } from '@/api/entities';

const FeatureFlagContext = createContext({});

export const useFeatureFlag = (flagKey) => {
  const flags = useContext(FeatureFlagContext);
  return flags[flagKey] || false;
};

export const FeatureFlagProvider = ({ children }) => {
  const [flags, setFlags] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadFeatureFlags = async () => {
      try {
        const [currentUser, allFlags] = await Promise.all([
          User.me().catch(() => null),
          FeatureFlag.list()
        ]);
        
        setUser(currentUser);
        
        const activeFlags = {};
        
        for (const flag of allFlags) {
          let isEnabled = false;
          
          // Global enable check
          if (!flag.enabled) {
            activeFlags[flag.flag_key] = false;
            continue;
          }
          
          // User-specific targeting
          if (flag.target_user_ids?.includes(currentUser?.id)) {
            isEnabled = true;
          }
          // Plan-based targeting
          else if (flag.target_plans?.includes(currentUser?.plan)) {
            isEnabled = true;
          }
          // Rollout percentage
          else if (flag.rollout_percentage > 0) {
            // Simple hash-based rollout (in production, use a more sophisticated method)
            const hash = hashUserId(currentUser?.id || 'anonymous', flag.flag_key);
            isEnabled = hash < flag.rollout_percentage;
          }
          
          activeFlags[flag.flag_key] = isEnabled;
        }
        
        setFlags(activeFlags);
      } catch (error) {
        console.error('Failed to load feature flags:', error);
      }
    };

    loadFeatureFlags();
  }, []);

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Simple hash function for consistent rollout
const hashUserId = (userId, flagKey) => {
  const str = `${userId}-${flagKey}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 100;
};