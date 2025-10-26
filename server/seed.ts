import { db } from './db';
import { menuItems, users } from '@shared/schema';

async function seed() {
  console.log('Seeding database...');

  // Create sample menu items
  const sampleMenuItems = [
    {
      name: 'Classic Cheeseburger',
      description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and our special sauce',
      category: 'Lunch',
      price: '8.99',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      preparationTime: 15,
      isAvailable: true,
      isSpecial: true,
      specialPrice: '6.99',
      allergens: ['Dairy', 'Gluten', 'Soy'],
      dietaryTags: [],
      nutritionalInfo: { calories: 650, protein: 35, carbs: 45, fat: 32 },
    },
    {
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with parmesan cheese, croutons, and caesar dressing',
      category: 'Lunch',
      price: '7.99',
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1',
      preparationTime: 10,
      isAvailable: true,
      isSpecial: false,
      allergens: ['Dairy', 'Gluten', 'Eggs'],
      dietaryTags: ['Vegetarian'],
      nutritionalInfo: { calories: 350, protein: 12, carbs: 25, fat: 22 },
    },
    {
      name: 'Avocado Toast',
      description: 'Whole grain toast topped with mashed avocado, cherry tomatoes, and feta cheese',
      category: 'Breakfast',
      price: '6.99',
      imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d',
      preparationTime: 8,
      isAvailable: true,
      isSpecial: false,
      allergens: ['Gluten', 'Dairy'],
      dietaryTags: ['Vegetarian'],
      nutritionalInfo: { calories: 320, protein: 10, carbs: 35, fat: 18 },
    },
    {
      name: 'Pancake Stack',
      description: 'Fluffy buttermilk pancakes served with maple syrup and butter',
      category: 'Breakfast',
      price: '5.99',
      imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93',
      preparationTime: 12,
      isAvailable: true,
      isSpecial: false,
      allergens: ['Gluten', 'Dairy', 'Eggs'],
      dietaryTags: ['Vegetarian'],
      nutritionalInfo: { calories: 450, protein: 12, carbs: 65, fat: 15 },
    },
    {
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice',
      category: 'Beverages',
      price: '3.99',
      imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba',
      preparationTime: 3,
      isAvailable: true,
      isSpecial: false,
      allergens: [],
      dietaryTags: ['Vegan', 'Gluten-Free'],
      nutritionalInfo: { calories: 110, protein: 2, carbs: 26, fat: 0 },
    },
    {
      name: 'Iced Latte',
      description: 'Espresso with cold milk and ice',
      category: 'Beverages',
      price: '4.99',
      imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7',
      preparationTime: 5,
      isAvailable: true,
      isSpecial: false,
      allergens: ['Dairy'],
      dietaryTags: ['Vegetarian'],
      nutritionalInfo: { calories: 120, protein: 6, carbs: 12, fat: 5 },
    },
    {
      name: 'Chocolate Chip Cookie',
      description: 'Warm chocolate chip cookie',
      category: 'Snacks',
      price: '2.99',
      imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
      preparationTime: 5,
      isAvailable: true,
      isSpecial: false,
      allergens: ['Gluten', 'Dairy', 'Eggs'],
      dietaryTags: ['Vegetarian'],
      nutritionalInfo: { calories: 220, protein: 3, carbs: 28, fat: 11 },
    },
    {
      name: 'French Fries',
      description: 'Crispy golden fries with sea salt',
      category: 'Snacks',
      price: '3.99',
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
      preparationTime: 7,
      isAvailable: true,
      isSpecial: false,
      allergens: [],
      dietaryTags: ['Vegan'],
      nutritionalInfo: { calories: 365, protein: 4, carbs: 48, fat: 17 },
    },
    {
      name: 'Grilled Chicken Wrap',
      description: 'Grilled chicken with vegetables wrapped in tortilla',
      category: 'Lunch',
      price: '9.99',
      imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f',
      preparationTime: 12,
      isAvailable: true,
      isSpecial: false,
      allergens: ['Gluten', 'Dairy'],
      dietaryTags: [],
      nutritionalInfo: { calories: 420, protein: 32, carbs: 38, fat: 16 },
    },
    {
      name: 'Vegetarian Pizza',
      description: 'Thin crust pizza with fresh vegetables and mozzarella',
      category: 'Lunch',
      price: '10.99',
      imageUrl: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49',
      preparationTime: 18,
      isAvailable: true,
      isSpecial: false,
      allergens: ['Gluten', 'Dairy'],
      dietaryTags: ['Vegetarian'],
      nutritionalInfo: { calories: 580, protein: 24, carbs: 68, fat: 22 },
    },
  ];

  await db.insert(menuItems).values(sampleMenuItems);

  console.log('Database seeded successfully!');
}

seed()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
