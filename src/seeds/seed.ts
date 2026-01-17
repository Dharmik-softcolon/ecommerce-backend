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
    Review,
    Newsletter,
    ContactMessage,
} from '../models';
import {
    categories,
    subcategories,
    collections,
    users,
    coupons,
    reviewTemplates,
    menProducts,
    womenProducts,
    accessoriesProducts,
    footwearProducts,
} from './data';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxe_ecommerce';

// Map of products to their categories
const productMap: { [key: string]: any[] } = {
    'men': menProducts,
    'women': womenProducts,
    'accessories': accessoriesProducts,
    'footwear': footwearProducts,
};

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
            Review.deleteMany({}),
            Newsletter.deleteMany({}),
            ContactMessage.deleteMany({}),
        ]);

        // ====== CREATE USERS ======
        console.log('👤 Creating users...');
        const createdUsers: any[] = [];
        for (const userData of users) {
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            const user = await User.create({
                ...userData,
                password: hashedPassword,
                emailVerified: new Date(),
            });
            createdUsers.push(user);
            console.log(`   Created user: ${user.email} (${user.role})`);
        }

        // ====== CREATE CATEGORIES ======
        console.log('📁 Creating categories...');
        const createdCategories: any[] = [];
        const categoryMap: { [key: string]: any } = {};

        for (const category of categories) {
            const created = await Category.create(category);
            createdCategories.push(created);
            categoryMap[category.slug] = created;
            console.log(`   Created category: ${created.name}`);
        }

        // Create subcategories
        console.log('📂 Creating subcategories...');
        for (const [parentSlug, subs] of Object.entries(subcategories)) {
            const parentCategory = categoryMap[parentSlug];
            if (parentCategory) {
                for (const sub of subs) {
                    const created = await Category.create({
                        ...sub,
                        parent: parentCategory._id,
                        isActive: true,
                    });
                    categoryMap[sub.slug] = created;
                    console.log(`   Created subcategory: ${created.name} (under ${parentCategory.name})`);
                }
            }
        }

        // ====== CREATE COLLECTIONS ======
        console.log('🏷️  Creating collections...');
        const createdCollections: any[] = [];
        for (const collection of collections) {
            const created = await Collection.create(collection);
            createdCollections.push(created);
            console.log(`   Created collection: ${created.name}`);
        }

        // ====== CREATE PRODUCTS ======
        console.log('📦 Creating products...');
        let totalProducts = 0;
        const createdProducts: any[] = [];

        for (const [categorySlug, products] of Object.entries(productMap)) {
            const category = categoryMap[categorySlug];
            if (!category) {
                console.log(`   ⚠️  Category not found: ${categorySlug}`);
                continue;
            }

            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                // Assign collections: rotate through available collections
                const collection = createdCollections[i % createdCollections.length];
                
                const created = await Product.create({
                    ...product,
                    category: category._id,
                    collection: collection._id,
                });
                createdProducts.push(created);
                totalProducts++;
            }
            console.log(`   Created ${products.length} products for ${category.name}`);
        }

        console.log(`   ✅ Total products created: ${totalProducts}`);

        // ====== CREATE REVIEWS ======
        console.log('⭐ Creating reviews...');
        let totalReviews = 0;
        const regularUsers = createdUsers.filter(u => u.role === 'USER');

        for (const product of createdProducts) {
            // Create 2-4 reviews per product
            const numReviews = Math.floor(Math.random() * 3) + 2;
            
            for (let i = 0; i < numReviews && i < regularUsers.length; i++) {
                const user = regularUsers[i];
                const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
                
                try {
                    await Review.create({
                        product: product._id,
                        user: user._id,
                        rating: template.rating,
                        title: template.title,
                        content: template.content,
                        isVerified: Math.random() > 0.3, // 70% verified
                    });
                    totalReviews++;
                } catch (err) {
                    // Skip duplicate reviews (user can only review a product once)
                }
            }
        }
        console.log(`   Created ${totalReviews} reviews`);

        // ====== CREATE COUPONS ======
        console.log('🎟️  Creating coupons...');
        await Coupon.insertMany(coupons);
        console.log(`   Created ${coupons.length} coupons`);

        // ====== CREATE NEWSLETTER SUBSCRIBERS ======
        console.log('📧 Creating newsletter subscribers...');
        const newsletters = [
            { email: 'subscriber1@example.com', isActive: true },
            { email: 'subscriber2@example.com', isActive: true },
            { email: 'subscriber3@example.com', isActive: true },
            { email: 'fashion.lover@example.com', isActive: true },
            { email: 'style.enthusiast@example.com', isActive: true },
        ];
        await Newsletter.insertMany(newsletters);
        console.log(`   Created ${newsletters.length} newsletter subscribers`);

        // ====== CREATE CONTACT MESSAGES ======
        console.log('💬 Creating contact messages...');
        const contactMessages = [
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+91 9876543210',
                subject: 'Order Inquiry',
                message: 'I would like to inquire about my recent order. Could you please provide an update on the shipping status?',
                isRead: false,
            },
            {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                subject: 'Size Exchange',
                message: 'I received my order but the size is not quite right. How can I exchange it for a different size?',
                isRead: true,
            },
            {
                name: 'Rahul Verma',
                email: 'rahul.verma@example.com',
                phone: '+91 9876543211',
                subject: 'Product Quality',
                message: 'I am very impressed with the quality of your products. Would love to know if you have any upcoming sales.',
                isRead: false,
            },
        ];
        await ContactMessage.insertMany(contactMessages);
        console.log(`   Created ${contactMessages.length} contact messages`);

        // ====== SUMMARY ======
        console.log('\n' + '='.repeat(50));
        console.log('✅ SEED COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(50));
        
        console.log('\n📊 Summary:');
        console.log(`   👤 Users: ${createdUsers.length}`);
        console.log(`   📁 Categories: ${Object.keys(categoryMap).length}`);
        console.log(`   🏷️  Collections: ${createdCollections.length}`);
        console.log(`   📦 Products: ${totalProducts}`);
        console.log(`   ⭐ Reviews: ${totalReviews}`);
        console.log(`   🎟️  Coupons: ${coupons.length}`);
        console.log(`   📧 Newsletter Subscribers: ${newsletters.length}`);
        console.log(`   💬 Contact Messages: ${contactMessages.length}`);

        console.log('\n📋 Login Credentials:');
        console.log('   Admin: admin@luxe.com / admin123');
        console.log('   User:  user@luxe.com / user123');

        console.log('\n🎟️  Available Coupons:');
        coupons.forEach((coupon) => {
            console.log(`   ${coupon.code} - ${coupon.description}`);
        });

        console.log('\n📁 Categories with Products:');
        for (const [slug, products] of Object.entries(productMap)) {
            const category = categoryMap[slug];
            if (category) {
                console.log(`   ${category.name}: ${products.length} products`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();
