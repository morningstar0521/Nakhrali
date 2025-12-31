# Instagram API Integration Guide

## Overview
The `InstagramFeed` component is ready to fetch real data from your Instagram account. Currently, it uses placeholder images, but you can easily integrate with Instagram's API.

## Integration Options

### Option 1: Instagram Graph API (Official - Recommended for Production)

**Requirements:**
- Facebook Developer Account
- Instagram Business or Creator Account
- Access Token

**Steps:**

1. **Create a Facebook App**
   - Go to https://developers.facebook.com/
   - Create a new app
   - Add Instagram Graph API product

2. **Get Access Token**
   - Generate a User Access Token
   - Exchange for Long-Lived Token (60 days)

3. **Update InstagramFeed.jsx**

```javascript
useEffect(() => {
  const fetchInstagramData = async () => {
    try {
      // Fetch user profile
      const profileResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${YOUR_ACCESS_TOKEN}`
      );
      const profileData = await profileResponse.json();

      // Fetch recent media
      const mediaResponse = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=6&access_token=${YOUR_ACCESS_TOKEN}`
      );
      const mediaData = await mediaResponse.json();

      setInstagramData({
        username: profileData.username,
        bio: 'Get inspired by our latest designs', // You can fetch bio from Instagram Basic Display API
        posts: mediaData.data.map(post => ({
          id: post.id,
          image: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
          link: post.permalink
        }))
      });
    } catch (error) {
      console.error('Error fetching Instagram data:', error);
    }
  };

  fetchInstagramData();
}, []);
```

4. **Store Access Token Securely**
   - Create `.env` file in project root:
   ```
   VITE_INSTAGRAM_ACCESS_TOKEN=your_access_token_here
   ```
   - Use in code: `import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN`

---

### Option 2: Third-Party Services (Easier Setup)

#### A. Juicer.io
- **Pros**: Easy setup, no coding required
- **Cons**: Paid service
- **URL**: https://www.juicer.io/

#### B. SnapWidget
- **Pros**: Free tier available
- **Cons**: Limited customization
- **URL**: https://snapwidget.com/

#### C. Instafeed.js
- **Pros**: Free, open-source
- **Cons**: Requires Instagram Access Token
- **URL**: https://instafeedjs.com/

**Implementation with Instafeed.js:**

```bash
npm install instafeed.js
```

```javascript
import Instafeed from 'instafeed.js';

useEffect(() => {
  const feed = new Instafeed({
    accessToken: 'YOUR_ACCESS_TOKEN',
    limit: 6,
    template: '<a href="{{link}}" target="_blank"><img src="{{image}}" /></a>',
    target: 'instagram-feed-container'
  });
  feed.run();
}, []);
```

---

### Option 3: Backend Proxy (Most Secure)

Create a backend endpoint that fetches Instagram data and caches it:

**Backend (Node.js/Express):**
```javascript
app.get('/api/instagram-feed', async (req, res) => {
  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_url,permalink&access_token=${process.env.INSTAGRAM_TOKEN}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Instagram data' });
  }
});
```

**Frontend:**
```javascript
useEffect(() => {
  const fetchInstagramData = async () => {
    try {
      const response = await fetch('/api/instagram-feed');
      const data = await response.json();
      setInstagramData(prev => ({
        ...prev,
        posts: data.data
      }));
    } catch (error) {
      console.error('Error:', error);
    }
  };
  fetchInstagramData();
}, []);
```

---

## Current Implementation

The current `InstagramFeed` component uses:
- **Username**: `nakhrali.fashion` (hardcoded)
- **Bio**: Static text (can be updated in component)
- **Posts**: 6 placeholder images from Unsplash

All links point to: `https://www.instagram.com/nakhrali.fashion/`

---

## Next Steps

1. Choose an integration method above
2. Obtain Instagram Access Token
3. Update `InstagramFeed.jsx` with your chosen method
4. Test the integration
5. Set up token refresh mechanism (tokens expire)

---

## Security Best Practices

- ✅ Never commit access tokens to Git
- ✅ Use environment variables
- ✅ Implement token refresh logic
- ✅ Cache API responses to reduce requests
- ✅ Handle API errors gracefully
- ✅ Use backend proxy for sensitive tokens

---

## Troubleshooting

**Error: "Invalid access token"**
- Token may have expired (60 days for long-lived tokens)
- Regenerate token from Facebook Developer Console

**Error: "Rate limit exceeded"**
- Instagram API has rate limits
- Implement caching (store data for 1-24 hours)
- Use backend proxy to control request frequency

**Images not loading**
- Check CORS settings
- Verify media URLs are accessible
- Ensure media_type is handled correctly (IMAGE vs VIDEO)
