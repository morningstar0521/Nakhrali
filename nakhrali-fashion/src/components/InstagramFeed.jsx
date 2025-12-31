import React, { useState, useEffect } from 'react';
import { Instagram } from 'lucide-react';

const InstagramFeed = () => {
    const [instagramData, setInstagramData] = useState({
        username: 'nakhrali.fashion',
        bio: 'Get inspired by our latest designs and customer stories',
        posts: []
    });

    // Simulated Instagram posts - In production, you would fetch from Instagram API
    // Note: Instagram's official API requires authentication and app approval
    const samplePosts = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300',
            link: 'https://www.instagram.com/nakhrali.fashion/'
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300',
            link: 'https://www.instagram.com/nakhrali.fashion/'
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300',
            link: 'https://www.instagram.com/nakhrali.fashion/'
        },
        {
            id: 4,
            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300',
            link: 'https://www.instagram.com/nakhrali.fashion/'
        },
        {
            id: 5,
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300',
            link: 'https://www.instagram.com/nakhrali.fashion/'
        },
        {
            id: 6,
            image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=300',
            link: 'https://www.instagram.com/nakhrali.fashion/'
        }
    ];

    useEffect(() => {
        // In production, implement Instagram Graph API or use a third-party service
        // For now, using sample data
        setInstagramData(prev => ({
            ...prev,
            posts: samplePosts
        }));

        // Example of how you would fetch from Instagram (requires access token):
        // const fetchInstagramData = async () => {
        //   try {
        //     const response = await fetch(
        //       `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink&access_token=${YOUR_ACCESS_TOKEN}`
        //     );
        //     const data = await response.json();
        //     setInstagramData(prev => ({
        //       ...prev,
        //       posts: data.data.slice(0, 6)
        //     }));
        //   } catch (error) {
        //     console.error('Error fetching Instagram data:', error);
        //   }
        // };
        // fetchInstagramData();
    }, []);

    return (
        <div className="bg-gradient-purple-gold py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold mb-3">
                        Follow Us on Instagram
                    </h3>
                    <a
                        href={`https://www.instagram.com/${instagramData.username}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-lg font-semibold hover:text-gold-200 transition-colors"
                    >
                        <Instagram className="w-6 h-6" />
                        @{instagramData.username}
                    </a>
                    <p className="text-purple-100 mt-2">
                        {instagramData.bio}
                    </p>
                </div>

                {/* Instagram Feed Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {instagramData.posts.map((post) => (
                        <a
                            key={post.id}
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
                        >
                            <img
                                src={post.image}
                                alt={`Instagram post ${post.id}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-purple-900/0 group-hover:bg-purple-900/60 transition-all duration-300 flex items-center justify-center">
                                <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </a>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <a
                        href={`https://www.instagram.com/${instagramData.username}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gold-500 hover:text-gray-900 transition-colors"
                    >
                        View More on Instagram
                    </a>
                </div>
            </div>
        </div>
    );
};

export default InstagramFeed;
