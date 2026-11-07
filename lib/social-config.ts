// File: lib/social-config.ts
// Penyimpanan konfigurasi runtime Meta / Facebook & Instagram

export interface SocialCredentials {
  facebookPageId?: string;
  facebookToken?: string;
  instagramToken?: string;
  instagramUserId?: string;
  updatedAt?: string;
}

interface GlobalSocialStore {
  creds: SocialCredentials;
}

const getSocialStore = (): GlobalSocialStore => {
  const globalRef = globalThis as unknown as { __SOCIAL_CREDENTIALS_STORE__?: GlobalSocialStore };
  if (!globalRef.__SOCIAL_CREDENTIALS_STORE__) {
    globalRef.__SOCIAL_CREDENTIALS_STORE__ = {
      creds: {
        facebookPageId: process.env.FACEBOOK_PAGE_ID?.trim() || '122094750927548983',
        facebookToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim() || '',
        instagramToken: process.env.INSTAGRAM_ACCESS_TOKEN?.trim() || '',
        instagramUserId: process.env.INSTAGRAM_USER_ID?.trim() || '17841420772273253',
      },
    };
  }
  return globalRef.__SOCIAL_CREDENTIALS_STORE__;
};

export function getSocialCredentials(): SocialCredentials {
  const store = getSocialStore();
  return {
    facebookPageId: process.env.FACEBOOK_PAGE_ID?.trim() || store.creds.facebookPageId,
    facebookToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim() || store.creds.facebookToken,
    instagramToken: process.env.INSTAGRAM_ACCESS_TOKEN?.trim() || store.creds.instagramToken,
    instagramUserId: process.env.INSTAGRAM_USER_ID?.trim() || store.creds.instagramUserId,
    updatedAt: store.creds.updatedAt,
  };
}

export function saveSocialCredentials(newCreds: Partial<SocialCredentials>): SocialCredentials {
  const store = getSocialStore();
  store.creds = {
    ...store.creds,
    ...newCreds,
    updatedAt: new Date().toISOString(),
  };
  return store.creds;
}
