// src/seeds/data/categories.ts

export const categories = [
    // Main Categories
    {
        name: 'Men',
        slug: 'men',
        description: 'Premium clothing and accessories for men',
        image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800',
        isActive: true,
        order: 1,
    },
    {
        name: 'Women',
        slug: 'women',
        description: 'Elegant fashion and accessories for women',
        image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800',
        isActive: true,
        order: 2,
    },
    {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Premium accessories to complete your look',
        image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800',
        isActive: true,
        order: 3,
    },
    {
        name: 'Footwear',
        slug: 'footwear',
        description: 'Luxury footwear collection',
        image: 'https://images.pexels.com/photos/267320/pexels-photo-267320.jpeg?auto=compress&cs=tinysrgb&w=800',
        isActive: true,
        order: 4,
    },
];

// Subcategories will be created with parent references
export const subcategories = {
    men: [
        { name: 'T-Shirts', slug: 'tshirts', description: 'Premium t-shirts for men', image: 'https://images.pexels.com/photos/991509/pexels-photo-991509.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { name: 'Shirts', slug: 'shirts', description: 'Formal and casual shirts', image: 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { name: 'Pants', slug: 'pants', description: 'Trousers and pants', image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { name: 'Jackets', slug: 'jackets', description: 'Jackets and outerwear', image: 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800' },
    ],
    women: [
        { name: 'Dresses', slug: 'dresses', description: 'Elegant dresses', image: 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { name: 'Tops', slug: 'tops', description: 'Blouses and tops', image: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { name: 'Skirts', slug: 'skirts', description: 'Skirts and bottoms', image: 'https://images.pexels.com/photos/1007018/pexels-photo-1007018.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { name: 'Coats', slug: 'coats', description: 'Jackets and coats', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800' },
    ],
    accessories: [
        { name: 'Bags', slug: 'bags', description: 'Premium bags and purses', image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { name: 'Watches', slug: 'watches', description: 'Luxury timepieces', image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { name: 'Belts', slug: 'belts', description: 'Leather belts', image: 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { name: 'Sunglasses', slug: 'sunglasses', description: 'Designer sunglasses', image: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800' },
    ],
    footwear: [
        { name: 'Sneakers', slug: 'sneakers', description: 'Premium sneakers', image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { name: 'Formal Shoes', slug: 'formal-shoes', description: 'Dress shoes', image: 'https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { name: 'Boots', slug: 'boots', description: 'Boots collection', image: 'https://images.pexels.com/photos/1308747/pexels-photo-1308747.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { name: 'Sandals', slug: 'sandals', description: 'Sandals and loafers', image: 'https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg?auto=compress&cs=tinysrgb&w=800' },
    ],
};
