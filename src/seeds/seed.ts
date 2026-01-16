// src/seeds/seed.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import {
    User,
    Category,
    Collection,
    Product,
    Coupon,
} from '../models';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxe_ecommerce';

// Sample data
const categories = [
    {
        name: 'Men',
        slug: 'men',
        description: 'Premium clothing for men',
        image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800',
        isActive: true,
    },
    {
        name: 'Women',
        slug: 'women',
        description: 'Elegant fashion for women',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
        isActive: true,
    },
    {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Premium accessories',
        image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
        isActive: true,
    },
    {
        name: 'Footwear',
        slug: 'footwear',
        description: 'Luxury footwear collection',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        isActive: true,
    },
];

const collections = [
    {
        name: 'Summer Collection 2024',
        slug: 'summer-2024',
        description: 'Fresh and vibrant styles for the summer season',
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',
        isActive: true,
    },
    {
        name: 'Winter Essentials',
        slug: 'winter-essentials',
        description: 'Cozy and warm pieces for the cold season',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
        isActive: true,
    },
    {
        name: 'Limited Edition',
        slug: 'limited-edition',
        description: 'Exclusive pieces in limited quantities',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        isActive: true,
    },
];

const generateProducts = (categoryId: string, collectionId: string | null) => {
    const products = [
        {
            name: 'Premium Cotton T-Shirt',
            slug: 'premium-cotton-t-shirt',
            description: 'Crafted from the finest Egyptian cotton, this premium t-shirt offers unparalleled comfort and style. The breathable fabric ensures all-day comfort while maintaining its shape wash after wash. Perfect for both casual outings and relaxed work environments.',
            shortDescription: 'Luxurious Egyptian cotton t-shirt for ultimate comfort',
            price: 2499,
            compareAtPrice: 3499,
            sku: 'TSH-001',
            stock: 100,
            isActive: true,
            isNew: true,
            isFeatured: true,
            isBestseller: false,
            tags: ['cotton', 'casual', 'premium', 't-shirt'],
            category: categoryId,
            collection: collectionId,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
                    alt: 'Premium Cotton T-Shirt Front',
                    position: 0,
                },
                {
                    url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
                    alt: 'Premium Cotton T-Shirt Back',
                    position: 1,
                },
            ],
            variants: [
                { name: 'White / S', sku: 'TSH-001-WH-S', price: 2499, stock: 20, size: 'S', color: 'White', colorHex: '#FFFFFF' },
                { name: 'White / M', sku: 'TSH-001-WH-M', price: 2499, stock: 25, size: 'M', color: 'White', colorHex: '#FFFFFF' },
                { name: 'White / L', sku: 'TSH-001-WH-L', price: 2499, stock: 20, size: 'L', color: 'White', colorHex: '#FFFFFF' },
                { name: 'White / XL', sku: 'TSH-001-WH-XL', price: 2499, stock: 15, size: 'XL', color: 'White', colorHex: '#FFFFFF' },
                { name: 'Black / S', sku: 'TSH-001-BK-S', price: 2499, stock: 20, size: 'S', color: 'Black', colorHex: '#000000' },
                { name: 'Black / M', sku: 'TSH-001-BK-M', price: 2499, stock: 25, size: 'M', color: 'Black', colorHex: '#000000' },
                { name: 'Black / L', sku: 'TSH-001-BK-L', price: 2499, stock: 20, size: 'L', color: 'Black', colorHex: '#000000' },
                { name: 'Black / XL', sku: 'TSH-001-BK-XL', price: 2499, stock: 15, size: 'XL', color: 'Black', colorHex: '#000000' },
            ],
        },
        {
            name: 'Silk Blend Formal Shirt',
            slug: 'silk-blend-formal-shirt',
            description: 'Elevate your formal wardrobe with this exquisite silk blend shirt. The lustrous fabric drapes beautifully, offering a sophisticated look for business meetings and special occasions. Features mother-of-pearl buttons and French cuffs for added elegance.',
            shortDescription: 'Elegant silk blend shirt for formal occasions',
            price: 5999,
            compareAtPrice: 7999,
            sku: 'SHT-002',
            stock: 50,
            isActive: true,
            isNew: false,
            isFeatured: true,
            isBestseller: true,
            tags: ['silk', 'formal', 'premium', 'shirt'],
            category: categoryId,
            collection: collectionId,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
                    alt: 'Silk Blend Formal Shirt',
                    position: 0,
                },
                {
                    url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800',
                    alt: 'Silk Blend Formal Shirt Detail',
                    position: 1,
                },
            ],
            variants: [
                { name: 'Light Blue / 38', sku: 'SHT-002-LB-38', price: 5999, stock: 10, size: '38', color: 'Light Blue', colorHex: '#ADD8E6' },
                { name: 'Light Blue / 40', sku: 'SHT-002-LB-40', price: 5999, stock: 15, size: '40', color: 'Light Blue', colorHex: '#ADD8E6' },
                { name: 'Light Blue / 42', sku: 'SHT-002-LB-42', price: 5999, stock: 15, size: '42', color: 'Light Blue', colorHex: '#ADD8E6' },
                { name: 'White / 38', sku: 'SHT-002-WH-38', price: 5999, stock: 10, size: '38', color: 'White', colorHex: '#FFFFFF' },
                { name: 'White / 40', sku: 'SHT-002-WH-40', price: 5999, stock: 15, size: '40', color: 'White', colorHex: '#FFFFFF' },
                { name: 'White / 42', sku: 'SHT-002-WH-42', price: 5999, stock: 10, size: '42', color: 'White', colorHex: '#FFFFFF' },
            ],
        },
        {
            name: 'Cashmere Wool Sweater',
            slug: 'cashmere-wool-sweater',
            description: 'Indulge in the ultimate luxury with our cashmere wool sweater. Made from 100% Grade-A Mongolian cashmere, this sweater offers exceptional warmth without the bulk. The timeless design features ribbed cuffs and hem for a classic look.',
            shortDescription: 'Pure Mongolian cashmere sweater for ultimate warmth',
            price: 12999,
            compareAtPrice: 15999,
            sku: 'SWT-003',
            stock: 30,
            isActive: true,
            isNew: true,
            isFeatured: false,
            isBestseller: true,
            tags: ['cashmere', 'wool', 'sweater', 'winter', 'premium'],
            category: categoryId,
            collection: collectionId,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
                    alt: 'Cashmere Wool Sweater',
                    position: 0,
                },
                {
                    url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
                    alt: 'Cashmere Wool Sweater Side',
                    position: 1,
                },
            ],
            variants: [
                { name: 'Camel / S', sku: 'SWT-003-CM-S', price: 12999, stock: 5, size: 'S', color: 'Camel', colorHex: '#C19A6B' },
                { name: 'Camel / M', sku: 'SWT-003-CM-M', price: 12999, stock: 8, size: 'M', color: 'Camel', colorHex: '#C19A6B' },
                { name: 'Camel / L', sku: 'SWT-003-CM-L', price: 12999, stock: 7, size: 'L', color: 'Camel', colorHex: '#C19A6B' },
                { name: 'Navy / S', sku: 'SWT-003-NV-S', price: 12999, stock: 5, size: 'S', color: 'Navy', colorHex: '#000080' },
                { name: 'Navy / M', sku: 'SWT-003-NV-M', price: 12999, stock: 8, size: 'M', color: 'Navy', colorHex: '#000080' },
                { name: 'Navy / L', sku: 'SWT-003-NV-L', price: 12999, stock: 7, size: 'L', color: 'Navy', colorHex: '#000080' },
            ],
        },
        {
            name: 'Italian Leather Belt',
            slug: 'italian-leather-belt',
            description: 'Handcrafted in Florence, Italy, this premium leather belt showcases traditional craftsmanship. Made from full-grain vegetable-tanned leather with a solid brass buckle, it develops a beautiful patina over time.',
            shortDescription: 'Handcrafted Italian leather belt with brass buckle',
            price: 4499,
            compareAtPrice: 5499,
            sku: 'BLT-004',
            stock: 40,
            isActive: true,
            isNew: false,
            isFeatured: true,
            isBestseller: false,
            tags: ['leather', 'belt', 'italian', 'accessory'],
            category: categoryId,
            collection: null,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
                    alt: 'Italian Leather Belt',
                    position: 0,
                },
            ],
            variants: [
                { name: 'Brown / 32', sku: 'BLT-004-BR-32', price: 4499, stock: 10, size: '32', color: 'Brown', colorHex: '#8B4513' },
                { name: 'Brown / 34', sku: 'BLT-004-BR-34', price: 4499, stock: 10, size: '34', color: 'Brown', colorHex: '#8B4513' },
                { name: 'Brown / 36', sku: 'BLT-004-BR-36', price: 4499, stock: 10, size: '36', color: 'Brown', colorHex: '#8B4513' },
                { name: 'Black / 32', sku: 'BLT-004-BK-32', price: 4499, stock: 10, size: '32', color: 'Black', colorHex: '#000000' },
                { name: 'Black / 34', sku: 'BLT-004-BK-34', price: 4499, stock: 10, size: '34', color: 'Black', colorHex: '#000000' },
                { name: 'Black / 36', sku: 'BLT-004-BK-36', price: 4499, stock: 10, size: '36', color: 'Black', colorHex: '#000000' },
            ],
        },
        {
            name: 'Slim Fit Chinos',
            slug: 'slim-fit-chinos',
            description: 'These versatile slim-fit chinos are crafted from premium stretch cotton twill. The modern cut offers a tailored look while the added stretch ensures comfort throughout the day. Perfect for both office and weekend wear.',
            shortDescription: 'Premium stretch cotton chinos with modern slim fit',
            price: 3999,
            compareAtPrice: 4999,
            sku: 'CHN-005',
            stock: 80,
            isActive: true,
            isNew: true,
            isFeatured: false,
            isBestseller: true,
            tags: ['chinos', 'pants', 'casual', 'slim-fit'],
            category: categoryId,
            collection: collectionId,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
                    alt: 'Slim Fit Chinos',
                    position: 0,
                },
                {
                    url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
                    alt: 'Slim Fit Chinos Detail',
                    position: 1,
                },
            ],
            variants: [
                { name: 'Khaki / 30', sku: 'CHN-005-KH-30', price: 3999, stock: 10, size: '30', color: 'Khaki', colorHex: '#C3B091' },
                { name: 'Khaki / 32', sku: 'CHN-005-KH-32', price: 3999, stock: 15, size: '32', color: 'Khaki', colorHex: '#C3B091' },
                { name: 'Khaki / 34', sku: 'CHN-005-KH-34', price: 3999, stock: 15, size: '34', color: 'Khaki', colorHex: '#C3B091' },
                { name: 'Khaki / 36', sku: 'CHN-005-KH-36', price: 3999, stock: 10, size: '36', color: 'Khaki', colorHex: '#C3B091' },
                { name: 'Navy / 30', sku: 'CHN-005-NV-30', price: 3999, stock: 10, size: '30', color: 'Navy', colorHex: '#000080' },
                { name: 'Navy / 32', sku: 'CHN-005-NV-32', price: 3999, stock: 15, size: '32', color: 'Navy', colorHex: '#000080' },
                { name: 'Navy / 34', sku: 'CHN-005-NV-34', price: 3999, stock: 15, size: '34', color: 'Navy', colorHex: '#000080' },
                { name: 'Navy / 36', sku: 'CHN-005-NV-36', price: 3999, stock: 10, size: '36', color: 'Navy', colorHex: '#000080' },
            ],
        },
        {
            name: 'Linen Summer Blazer',
            slug: 'linen-summer-blazer',
            description: 'Stay cool and stylish with our unlined linen blazer. Perfect for summer events and smart casual occasions, this breathable blazer features patch pockets and natural horn buttons. The relaxed fit offers effortless elegance.',
            shortDescription: 'Unlined linen blazer for warm weather elegance',
            price: 8999,
            compareAtPrice: 11999,
            sku: 'BLZ-006',
            stock: 25,
            isActive: true,
            isNew: true,
            isFeatured: true,
            isBestseller: false,
            tags: ['blazer', 'linen', 'summer', 'formal'],
            category: categoryId,
            collection: collectionId,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
                    alt: 'Linen Summer Blazer',
                    position: 0,
                },
                {
                    url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800',
                    alt: 'Linen Summer Blazer Back',
                    position: 1,
                },
            ],
            variants: [
                { name: 'Beige / S', sku: 'BLZ-006-BG-S', price: 8999, stock: 5, size: 'S', color: 'Beige', colorHex: '#F5F5DC' },
                { name: 'Beige / M', sku: 'BLZ-006-BG-M', price: 8999, stock: 8, size: 'M', color: 'Beige', colorHex: '#F5F5DC' },
                { name: 'Beige / L', sku: 'BLZ-006-BG-L', price: 8999, stock: 7, size: 'L', color: 'Beige', colorHex: '#F5F5DC' },
                { name: 'Light Blue / S', sku: 'BLZ-006-LB-S', price: 8999, stock: 5, size: 'S', color: 'Light Blue', colorHex: '#ADD8E6' },
                { name: 'Light Blue / M', sku: 'BLZ-006-LB-M', price: 8999, stock: 8, size: 'M', color: 'Light Blue', colorHex: '#ADD8E6' },
                { name: 'Light Blue / L', sku: 'BLZ-006-LB-L', price: 8999, stock: 5, size: 'L', color: 'Light Blue', colorHex: '#ADD8E6' },
            ],
        },
    ];

    return products;
};

const coupons = [
    {
        code: 'WELCOME10',
        description: 'Welcome discount - 10% off your first order',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 1000,
        maxDiscount: 500,
        usageLimit: 1000,
        usedCount: 0,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
    {
        code: 'SUMMER20',
        description: 'Summer sale - 20% off',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderValue: 2000,
        maxDiscount: 1000,
        usageLimit: 500,
        usedCount: 0,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
    {
        code: 'FLAT500',
        description: 'Flat ₹500 off on orders above ₹3000',
        discountType: 'FIXED',
        discountValue: 500,
        minOrderValue: 3000,
        usageLimit: 200,
        usedCount: 0,
        isActive: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    },
    {
        code: 'VIP25',
        description: 'VIP members - 25% off',
        discountType: 'PERCENTAGE',
        discountValue: 25,
        minOrderValue: 5000,
        maxDiscount: 2000,
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
    },
];

async function seed() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('📦 Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            Collection.deleteMany({}),
            Product.deleteMany({}),
            Coupon.deleteMany({}),
        ]);

        // Create admin user
        console.log('👤 Creating admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        const adminUser = await User.create({
            email: 'admin@luxe.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            emailVerified: new Date(),
        });
        console.log(`   Admin created: ${adminUser.email}`);

        // Create test user
        const testUserPassword = await bcrypt.hash('user123', 12);
        const testUser = await User.create({
            email: 'user@luxe.com',
            password: testUserPassword,
            firstName: 'Test',
            lastName: 'User',
            role: 'USER',
            phone: '+91 9876543210',
            emailVerified: new Date(),
        });
        console.log(`   Test user created: ${testUser.email}`);

        // Create categories
        console.log('📁 Creating categories...');
        const createdCategories = await Category.insertMany(categories);
        console.log(`   Created ${createdCategories.length} categories`);

        // Create collections
        console.log('🏷️  Creating collections...');
        const createdCollections = await Collection.insertMany(collections);
        console.log(`   Created ${createdCollections.length} collections`);

        // Create products
        console.log('📦 Creating products...');
        let totalProducts = 0;

        for (let i = 0; i < createdCategories.length; i++) {
            const category = createdCategories[i];
            const collection = createdCollections[i % createdCollections.length];

            const productData = generateProducts(
                category._id.toString(),
                collection._id.toString()
            );

            // Make SKUs unique by adding category index
            const uniqueProducts = productData.map((product, idx) => ({
                ...product,
                sku: `${product.sku}-${i}`,
                slug: `${product.slug}-${i}`,
                variants: product.variants.map((variant) => ({
                    ...variant,
                    sku: `${variant.sku}-${i}`,
                })),
            }));

            await Product.insertMany(uniqueProducts);
            totalProducts += uniqueProducts.length;
        }
        console.log(`   Created ${totalProducts} products`);

        // Create coupons
        console.log('🎟️  Creating coupons...');
        await Coupon.insertMany(coupons);
        console.log(`   Created ${coupons.length} coupons`);

        console.log('\n✅ Seed completed successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin: admin@luxe.com / admin123');
        console.log('   User:  user@luxe.com / user123');
        console.log('\n🎟️  Available Coupons:');
        coupons.forEach((coupon) => {
            console.log(`   ${coupon.code} - ${coupon.description}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();// src/seeds/productData.ts
export const additionalProducts = [
    {
        name: 'Merino Wool Polo',
        slug: 'merino-wool-polo',
        description: 'Luxurious merino wool polo shirt that combines casual style with premium comfort. The fine merino fibers regulate temperature naturally, keeping you cool in summer and warm in winter.',
        shortDescription: 'Premium merino wool polo for year-round comfort',
        price: 4999,
        compareAtPrice: 6499,
        sku: 'PLO-007',
        stock: 60,
        isActive: true,
        isNew: true,
        isFeatured: true,
        isBestseller: false,
        tags: ['merino', 'wool', 'polo', 'premium'],
    },
    {
        name: 'Organic Cotton Hoodie',
        slug: 'organic-cotton-hoodie',
        description: 'Eco-conscious hoodie made from 100% GOTS certified organic cotton. Features a relaxed fit, kangaroo pocket, and adjustable drawstring hood.',
        shortDescription: 'Sustainable organic cotton hoodie',
        price: 3499,
        compareAtPrice: 4499,
        sku: 'HOD-008',
        stock: 75,
        isActive: true,
        isNew: false,
        isFeatured: false,
        isBestseller: true,
        tags: ['organic', 'cotton', 'hoodie', 'sustainable'],
    },
    {
        name: 'Japanese Denim Jacket',
        slug: 'japanese-denim-jacket',
        description: 'Crafted from premium Japanese selvedge denim, this jacket features authentic details including copper rivets, chain-stitched hems, and a classic trucker silhouette.',
        shortDescription: 'Premium Japanese selvedge denim jacket',
        price: 9999,
        compareAtPrice: 12999,
        sku: 'DNM-009',
        stock: 20,
        isActive: true,
        isNew: true,
        isFeatured: true,
        isBestseller: false,
        tags: ['denim', 'japanese', 'jacket', 'selvedge'],
    },
    {
        name: 'Suede Chelsea Boots',
        slug: 'suede-chelsea-boots',
        description: 'Classic Chelsea boots crafted from premium Italian suede with a leather sole. The sleek silhouette and elastic side panels make these boots both stylish and easy to wear.',
        shortDescription: 'Italian suede Chelsea boots',
        price: 11999,
        compareAtPrice: 14999,
        sku: 'BOT-010',
        stock: 30,
        isActive: true,
        isNew: false,
        isFeatured: true,
        isBestseller: true,
        tags: ['suede', 'boots', 'chelsea', 'italian', 'footwear'],
    },
    {
        name: 'Silk Pocket Square Set',
        slug: 'silk-pocket-square-set',
        description: 'Set of 4 hand-rolled silk pocket squares in complementary colors. Each piece is crafted from premium mulberry silk with hand-stitched edges.',
        shortDescription: 'Premium silk pocket square collection',
        price: 2999,
        compareAtPrice: 3999,
        sku: 'PSQ-011',
        stock: 50,
        isActive: true,
        isNew: true,
        isFeatured: false,
        isBestseller: false,
        tags: ['silk', 'pocket-square', 'accessory', 'formal'],
    },
    {
        name: 'Leather Weekend Bag',
        slug: 'leather-weekend-bag',
        description: 'Spacious weekend bag crafted from full-grain vegetable-tanned leather. Features brass hardware, cotton lining, and multiple interior pockets.',
        shortDescription: 'Full-grain leather weekend travel bag',
        price: 15999,
        compareAtPrice: 19999,
        sku: 'BAG-012',
        stock: 15,
        isActive: true,
        isNew: false,
        isFeatured: true,
        isBestseller: false,
        tags: ['leather', 'bag', 'travel', 'weekend'],
    },
];

export const womenProducts = [
    {
        name: 'Silk Wrap Dress',
        slug: 'silk-wrap-dress',
        description: 'Elegant wrap dress crafted from pure mulberry silk. The flattering silhouette and adjustable waist tie make this dress perfect for any occasion.',
        shortDescription: 'Pure silk wrap dress with adjustable fit',
        price: 12999,
        compareAtPrice: 16999,
        sku: 'DRS-W001',
        stock: 25,
        isActive: true,
        isNew: true,
        isFeatured: true,
        isBestseller: false,
        tags: ['silk', 'dress', 'wrap', 'formal', 'women'],
    },
    {
        name: 'Cashmere Cardigan',
        slug: 'cashmere-cardigan',
        description: 'Luxurious cashmere cardigan with mother-of-pearl buttons. Perfect for layering, this piece offers timeless elegance and supreme comfort.',
        shortDescription: 'Pure cashmere cardigan with pearl buttons',
        price: 14999,
        compareAtPrice: 18999,
        sku: 'CRD-W002',
        stock: 20,
        isActive: true,
        isNew: false,
        isFeatured: true,
        isBestseller: true,
        tags: ['cashmere', 'cardigan', 'women', 'knitwear'],
    },
    {
        name: 'High-Waisted Tailored Trousers',
        slug: 'high-waisted-tailored-trousers',
        description: 'Sophisticated high-waisted trousers with a wide leg silhouette. Crafted from premium wool blend fabric with a comfortable stretch.',
        shortDescription: 'Elegant high-waisted wide leg trousers',
        price: 6999,
        compareAtPrice: 8999,
        sku: 'TRS-W003',
        stock: 40,
        isActive: true,
        isNew: true,
        isFeatured: false,
        isBestseller: true,
        tags: ['trousers', 'tailored', 'women', 'formal'],
    },
    {
        name: 'Leather Tote Bag',
        slug: 'leather-tote-bag',
        description: 'Spacious leather tote with interior organization pockets. Handcrafted from smooth Italian calfskin with gold-tone hardware.',
        shortDescription: 'Italian leather tote with organization',
        price: 13999,
        compareAtPrice: 17999,
        sku: 'BAG-W004',
        stock: 18,
        isActive: true,
        isNew: false,
        isFeatured: true,
        isBestseller: false,
        tags: ['leather', 'tote', 'bag', 'women', 'italian'],
    },
];