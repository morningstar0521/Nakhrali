const axios = require('axios');
const cheerio = require('cheerio');

// @desc    Extract product data from URL
// @route   POST /api/products/extract
// @access  Private/Admin
exports.extractProductFromUrl = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a URL'
            });
        }

        // Fetch the webpage
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const html = response.data;
        const $ = cheerio.load(html);

        let productData = {
            name: '',
            description: '',
            price: '',
            images: []
        };

        // Try to extract from common e-commerce patterns
        // Amazon
        if (url.includes('amazon.')) {
            productData.name = $('#productTitle').text().trim() ||
                $('h1.a-size-large').text().trim();

            productData.description = $('#feature-bullets ul li').map((i, el) => $(el).text().trim()).get().join(' ') ||
                $('#productDescription p').text().trim();

            const priceWhole = $('.a-price-whole').first().text().trim();
            const priceFraction = $('.a-price-fraction').first().text().trim();
            if (priceWhole) {
                productData.price = priceWhole.replace(/,/g, '') + (priceFraction || '');
            }

            // Get all product images from Amazon
            // Main image
            const mainImage = $('#landingImage').attr('src') ||
                $('#imgBlkFront').attr('src') ||
                $('.a-dynamic-image').first().attr('src');
            if (mainImage) productData.images.push(mainImage);

            // Thumbnail images from image gallery
            $('#altImages img, .imageThumbnail img').each((i, el) => {
                const src = $(el).attr('src');
                if (src) {
                    // Convert thumbnail to full size by replacing size parameters
                    const fullSizeSrc = src.replace(/\._.*?_\./, '.');
                    productData.images.push(fullSizeSrc);
                }
            });

            // Additional images from data attributes
            $('.a-dynamic-image').each((i, el) => {
                const dataSrc = $(el).attr('data-old-hires') || $(el).attr('data-a-dynamic-image');
                if (dataSrc) {
                    try {
                        // data-a-dynamic-image contains JSON with image URLs
                        const imageData = JSON.parse(dataSrc);
                        Object.keys(imageData).forEach(url => {
                            if (url.startsWith('http')) {
                                productData.images.push(url);
                            }
                        });
                    } catch (e) {
                        // If it's not JSON, just use the string
                        if (dataSrc.startsWith('http')) {
                            productData.images.push(dataSrc);
                        }
                    }
                }
            });
        }
        // Flipkart
        else if (url.includes('flipkart.')) {
            productData.name = $('h1.yhB1nd').text().trim() ||
                $('.B_NuCI').text().trim();

            productData.description = $('._1mXcCf').text().trim() ||
                $('._2418kt').text().trim();

            productData.price = $('._30jeq3').text().trim().replace(/[₹,]/g, '') ||
                $('._1_WHN1').text().trim().replace(/[₹,]/g, '');

            // Get images
            $('._396cs4 img').each((i, el) => {
                const src = $(el).attr('src');
                if (src && !src.includes('placeholder')) {
                    productData.images.push(src);
                }
            });
        }
        // Generic extraction
        else {
            // Try common meta tags
            productData.name = $('meta[property="og:title"]').attr('content') ||
                $('meta[name="title"]').attr('content') ||
                $('h1').first().text().trim();

            productData.description = $('meta[property="og:description"]').attr('content') ||
                $('meta[name="description"]').attr('content') ||
                $('p').first().text().trim();

            // Try to find price
            const priceText = $('[class*="price"]').first().text() ||
                $('[id*="price"]').first().text() ||
                $('span:contains("₹")').first().text() ||
                $('span:contains("$")').first().text();

            if (priceText) {
                const priceMatch = priceText.match(/[\d,]+\.?\d*/);
                if (priceMatch) {
                    productData.price = priceMatch[0].replace(/,/g, '');
                }
            }

            // Get images
            const ogImage = $('meta[property="og:image"]').attr('content');
            if (ogImage) productData.images.push(ogImage);

            $('img[class*="product"], img[id*="product"]').each((i, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src');
                if (src && !src.includes('placeholder') && !src.includes('logo')) {
                    productData.images.push(src);
                }
            });
        }

        // Clean up the data
        productData.name = productData.name.substring(0, 200); // Limit length
        productData.description = productData.description.substring(0, 500);
        productData.images = [...new Set(productData.images)].slice(0, 10); // Remove duplicates, max 10 images

        // Validate that we got at least a name
        if (!productData.name) {
            return res.status(400).json({
                success: false,
                message: 'Could not extract product data from this URL. The site may not be supported or may be blocking automated access.'
            });
        }

        res.status(200).json({
            success: true,
            data: productData
        });

    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to extract product data. The URL may be invalid or the site may be blocking access.'
        });
    }
};
