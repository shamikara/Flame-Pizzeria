import { PrismaClient, Role, OrderStatus, OrderType, LeaveStatus, MeasurementUnit, AlertSeverity } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const getRandomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

async function main() {
  console.log('Seeding started...');

  // 1. --- Clean up existing data ---
  console.log('Cleaning up database...');
  // ... (cleanup logic remains the same) ...
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.recipeComment.deleteMany();
  await prisma.inventoryAlert.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.order.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.rawMaterial.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  console.log('Database cleaned.');
  
  // 2. --- Seed Suppliers ---
  console.log('Seeding suppliers...');
  const supplierData = [
    { name: 'Kandy Fresh Vegetables', contact: '0812233445' },
    { name: 'Colombo Spice Traders', contact: '0112556677', email: 'sales@colombospice.lk' },
    { name: 'Galle Seafood Direct', contact: '0914556789' },
    { name: 'Nuwara Eliya Dairy Farms', contact: '0522223344' },
    { name: 'Polonnaruwa Rice Millers', contact: '0272225588' },
  ];
  await prisma.supplier.createMany({ data: supplierData });
  const suppliers = await prisma.supplier.findMany({
    where: { name: { in: supplierData.map(s => s.name) } },
  });
  console.log(`${suppliers.length} suppliers created.`);

  // 3. --- Seed Categories ---
  console.log('Seeding categories...');
  const categoryData = [
    { name: 'Rice & Curry' },
    { name: 'Kottu' },
    { name: 'Short Eats' },
    { name: 'Hoppers & String Hoppers' },
    { name: 'Desserts' },
    { name: 'Beverages' },
  ];
  await prisma.category.createMany({ data: categoryData });
  const categories = await prisma.category.findMany({
    where: { name: { in: categoryData.map(c => c.name) } },
  });
  console.log(`${categories.length} categories created.`);

  // 4. --- Seed Raw Materials ---
  console.log('Seeding raw materials...');
  const rawMaterialData = [
    { name: 'Basmati Rice', quantity: 50, unit: MeasurementUnit.KG, restockThreshold: 10, supplierId: suppliers.find(s => s.name.includes('Polonnaruwa'))?.id },
    { name: 'Red Onions', quantity: 20, unit: MeasurementUnit.KG, restockThreshold: 5, supplierId: suppliers.find(s => s.name.includes('Kandy'))?.id },
    { name: 'Garlic', quantity: 5, unit: MeasurementUnit.KG, restockThreshold: 1, supplierId: suppliers.find(s => s.name.includes('Kandy'))?.id },
    { name: 'Chilli Powder', quantity: 10, unit: MeasurementUnit.KG, restockThreshold: 2, supplierId: suppliers.find(s => s.name.includes('Colombo'))?.id },
    { name: 'Coconut Milk Powder', quantity: 15, unit: MeasurementUnit.KG, restockThreshold: 3, supplierId: suppliers.find(s => s.name.includes('Colombo'))?.id },
    { name: 'Chicken', quantity: 25, unit: MeasurementUnit.KG, restockThreshold: 5 },
    { name: 'Fish (Tuna)', quantity: 15, unit: MeasurementUnit.KG, restockThreshold: 4, supplierId: suppliers.find(s => s.name.includes('Galle'))?.id },
    { name: 'Eggs', quantity: 100, unit: MeasurementUnit.PIECE, restockThreshold: 24, supplierId: suppliers.find(s => s.name.includes('Nuwara Eliya'))?.id },
    { name: 'All-Purpose Flour', quantity: 20, unit: MeasurementUnit.KG, restockThreshold: 5 },
    { name: 'Limes', quantity: 50, unit: MeasurementUnit.PIECE, restockThreshold: 10, supplierId: suppliers.find(s => s.name.includes('Kandy'))?.id },
    { name: 'King Coconut', quantity: 30, unit: MeasurementUnit.PIECE, restockThreshold: 10, supplierId: suppliers.find(s => s.name.includes('Kandy'))?.id },
    { name: 'Jaggery', quantity: 5, unit: MeasurementUnit.KG, restockThreshold: 1, supplierId: suppliers.find(s => s.name.includes('Colombo'))?.id },
    { name: 'Yogurt', quantity: 10, unit: MeasurementUnit.L, restockThreshold: 2, supplierId: suppliers.find(s => s.name.includes('Nuwara Eliya'))?.id },
  ];
  await prisma.rawMaterial.createMany({ data: rawMaterialData });
  const rawMaterials = await prisma.rawMaterial.findMany({
    where: { name: { in: rawMaterialData.map(rm => rm.name) } },
  });
  console.log(`${rawMaterials.length} raw materials created.`);
  
  // ... (User and Employee seeding remains the same, as it uses `create`) ...
  console.log('Seeding users and employees...');
  const hashedPassword = await hash('password123', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
      address: '123, Main Street, Colombo 01',
      contact: '0771234567',
    },
  });

  // Staff (Users with Employee profiles)
  const chef = await prisma.user.create({
    data: {
      firstName: 'Kamal',
      lastName: 'Perera',
      email: 'chef.kamal@example.com',
      password: hashedPassword,
      role: Role.CHEF,
      address: '45, Galle Road, Dehiwala',
      contact: '0712345678',
      employee: { create: { salary: 80000, leaveStatus: LeaveStatus.ACTIVE } },
    },
    include: { employee: true },
  });

  const manager = await prisma.user.create({
    data: {
      firstName: 'Sunil',
      lastName: 'Fernando',
      email: 'manager.sunil@example.com',
      password: hashedPassword,
      role: Role.MANAGER,
      address: '88, High Level Road, Nugegoda',
      contact: '0765432109',
      employee: { create: { salary: 120000 } },
    },
    include: { employee: true },
  });

  const waiter = await prisma.user.create({
    data: {
      firstName: 'Nimal',
      lastName: 'Silva',
      email: 'waiter.nimal@example.com',
      password: hashedPassword,
      role: Role.WAITER,
      address: '10, Station Road, Mount Lavinia',
      contact: '0759876543',
      employee: { create: { salary: 45000 } },
    },
    include: { employee: true },
  });

  const deliveryPerson = await prisma.user.create({
    data: {
      firstName: 'Ravi',
      lastName: 'Jayakody',
      email: 'delivery.ravi@example.com',
      password: hashedPassword,
      role: Role.DELIVERY_PERSON,
      address: '22, Templers Road, Piliyandala',
      contact: '0723456789',
      employee: { create: { salary: 50000 } },
    },
    include: { employee: true },
  });
  
  const employees = [chef.employee!, manager.employee!, waiter.employee!, deliveryPerson.employee!];

  // Customers
  const customer1 = await prisma.user.create({
    data: {
      firstName: 'Anusha',
      lastName: 'Bandara',
      email: 'anusha.b@example.com',
      password: hashedPassword,
      role: Role.CUSTOMER,
      address: '34, Marine Drive, Colombo 03',
      contact: '0777890123',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      firstName: 'Dinesh',
      lastName: 'Wickramasinghe',
      email: 'dinesh.w@example.com',
      password: hashedPassword,
      role: Role.CUSTOMER,
      address: '56, Parliament Road, Rajagiriya',
      contact: '0711223344',
    },
  });

  // Create more customers
  await prisma.user.createMany({
    data: [
      { firstName: 'Priya', lastName: 'Kumari', email: 'priya.k@example.com', password: hashedPassword, role: Role.CUSTOMER, address: 'Kandy Lake Round, Kandy' },
      { firstName: 'Saman', lastName: 'De Silva', email: 'saman.ds@example.com', password: hashedPassword, role: Role.CUSTOMER, address: 'Galle Fort, Galle' },
      { firstName: 'Ishara', lastName: 'Gamage', email: 'ishara.g@example.com', password: hashedPassword, role: Role.CUSTOMER, address: 'Ja-Ela' },
      { firstName: 'Roshan', lastName: 'Gunawardena', email: 'roshan.g@example.com', password: hashedPassword, role: Role.CUSTOMER, address: 'Wattala' },
      { firstName: 'Nilmini', lastName: 'Herath', email: 'nilmini.h@example.com', password: hashedPassword, role: Role.CUSTOMER, address: 'Panadura' },
      { firstName: 'Asela', lastName: 'Madushan', email: 'asela.m@example.com', password: hashedPassword, role: Role.CUSTOMER, address: 'Moratuwa' },
      { firstName: 'Chamari', lastName: 'Atapattu', email: 'chamari.a@example.com', password: hashedPassword, role: Role.CUSTOMER, address: 'Borella' },
      { firstName: 'Lahiru', lastName: 'Thirimanne', email: 'lahiru.t@example.com', password: hashedPassword, role: Role.CUSTOMER, address: 'Malabe' },
    ]
  });
  
  const customers = await prisma.user.findMany({ where: { role: Role.CUSTOMER } });
  console.log(`${employees.length + customers.length + 1} users created.`);


  // 6. --- Seed Food Items ---
  console.log('Seeding food items...');
  const foodItemData = [
    { name: 'Chicken Rice & Curry', description: 'Aromatic basmati rice served with a rich chicken curry and three vegetable curries.', price: 850.00, categoryId: categories.find(c => c.name === 'Rice & Curry')!.id, imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Fish Rice & Curry', description: 'Aromatic basmati rice served with a spicy tuna curry and three vegetable curries.', price: 800.00, categoryId: categories.find(c => c.name === 'Rice & Curry')!.id, imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Chicken Kottu', description: 'Shredded godamba roti stir-fried with chicken, vegetables, and egg.', price: 950.00, categoryId: categories.find(c => c.name === 'Kottu')!.id, imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Cheese Kottu', description: 'The classic kottu with a generous amount of melted cheese.', price: 1100.00, categoryId: categories.find(c => c.name === 'Kottu')!.id, imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Fish Cutlet (3 pcs)', description: 'Spiced fish and potato filling, crumbed and deep-fried.', price: 240.00, categoryId: categories.find(c => c.name === 'Short Eats')!.id, imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Egg Roll (2 pcs)', description: 'Pancake filled with a savory mix and an egg, then deep-fried.', price: 200.00, categoryId: categories.find(c => c.name === 'Short Eats')!.id, imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Egg Hopper', description: 'A crispy, bowl-shaped pancake made from fermented rice flour with a soft-cooked egg in the center.', price: 150.00, categoryId: categories.find(c => c.name === 'Hoppers & String Hoppers')!.id, imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Plain Hopper (3 pcs)', description: 'Crispy, bowl-shaped pancakes served with katta sambol.', price: 250.00, categoryId: categories.find(c => c.name === 'Hoppers & String Hoppers')!.id, imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Watalappan', description: 'A rich and creamy coconut custard pudding sweetened with jaggery and spiced with cardamom.', price: 350.00, categoryId: categories.find(c => c.name === 'Desserts')!.id, imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Curd & Treacle', description: 'Thick, creamy buffalo curd served with sweet kithul treacle.', price: 400.00, categoryId: categories.find(c => c.name === 'Desserts')!.id, imageUrl: 'https://via.placeholder.com/150' },
    { name: 'King Coconut (Thambili)', description: 'Fresh, natural king coconut water.', price: 200.00, categoryId: categories.find(c => c.name === 'Beverages')!.id, imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Faluda', description: 'A sweet and refreshing drink with rose syrup, vermicelli, basil seeds, and a scoop of ice cream.', price: 450.00, categoryId: categories.find(c => c.name === 'Beverages')!.id, imageUrl: 'https://via.placeholder.com/150' },
  ];
  await prisma.foodItem.createMany({ data: foodItemData });
  const foodItems = await prisma.foodItem.findMany({
    where: { name: { in: foodItemData.map(fi => fi.name) } },
  });
  console.log(`${foodItems.length} food items created.`);

  // ... (The rest of the script for Recipes, Orders, etc. remains the same) ...
  // 7. --- Seed a Recipe ---
  console.log('Seeding a recipe for Chicken Kottu...');
  const chickenKottuItem = foodItems.find(fi => fi.name === 'Chicken Kottu')!;
  const kottuRecipe = await prisma.recipe.create({
    data: {
      name: 'Authentic Chicken Kottu Recipe',
      description: 'Step-by-step guide to making delicious street-style Chicken Kottu.',
      steps: `1. Shred godamba roti. 2. Sauté onions, garlic, and ginger. 3. Add chicken and cook. 4. Add vegetables and spices. 5. Add shredded roti and mix well. 6. Make a well, crack eggs into it, and scramble. 7. Mix everything together with a rhythmic chopping motion. 8. Serve hot.`,
      foodItemId: chickenKottuItem.id,
      authorId: chef.id,
      ingredients: {
        createMany: {
          data: [
            { rawMaterialId: rawMaterials.find(rm => rm.name === 'Chicken')!.id, quantity: 0.2, unit: MeasurementUnit.KG },
            { rawMaterialId: rawMaterials.find(rm => rm.name === 'Red Onions')!.id, quantity: 0.1, unit: MeasurementUnit.KG },
            { rawMaterialId: rawMaterials.find(rm => rm.name === 'Garlic')!.id, quantity: 0.05, unit: MeasurementUnit.KG },
            { rawMaterialId: rawMaterials.find(rm => rm.name === 'Eggs')!.id, quantity: 2, unit: MeasurementUnit.PIECE },
            { rawMaterialId: rawMaterials.find(rm => rm.name === 'Chilli Powder')!.id, quantity: 0.02, unit: MeasurementUnit.KG },
          ]
        }
      }
    }
  });
  console.log(`Recipe for ${chickenKottuItem.name} created.`);

  // 8. --- Seed Orders, OrderItems, Payments & Deliveries ---
  console.log('Seeding orders...');
  for (let i = 0; i < 15; i++) {
    const customer = getRandomItem(customers);
    const orderType = getRandomItem([OrderType.DINE_IN, OrderType.DELIVERY, OrderType.TAKEAWAY]);
    const orderStatus = getRandomItem([OrderStatus.DELIVERED, OrderStatus.CANCELLED, Order_status.CONFIRMED]);
    
    // Select 1 to 3 random food items for the order
    const itemsToOrder = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => getRandomItem(foodItems));
    const total = itemsToOrder.reduce((acc, item) => acc + item.price, 0);

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        total: total,
        status: orderStatus,
        type: orderType,
        tableNumber: orderType === OrderType.DINE_IN ? `${Math.floor(Math.random() * 10) + 1}` : null,
        deliveryAddress: orderType === OrderType.DELIVERY ? customer.address : null,
        preparedById: chef.employee!.id,
        deliveredById: orderType === OrderType.DELIVERY ? deliveryPerson.employee!.id : null,
        items: {
          createMany: {
            data: itemsToOrder.map(item => ({
              foodItemId: item.id,
              quantity: 1,
              price: item.price,
              specialNotes: Math.random() > 0.8 ? 'Extra spicy please!' : null,
            })),
          },
        },
        payments: {
          create: {
            amount: total,
            method: getRandomItem(['CASH', 'CARD', 'ONLINE']),
            status: 'COMPLETED'
          }
        },
      },
      include: {
        payments: true
      }
    });

    if (order.type === OrderType.DELIVERY) {
      await prisma.delivery.create({
        data: {
          orderId: order.id,
          employeeId: deliveryPerson.employee!.id,
          startTime: order.createdAt,
          endTime: new Date(order.createdAt.getTime() + 30 * 60 * 1000), // 30 mins later
          status: 'delivered'
        }
      })
    }
  }
  console.log('15 orders created.');

  // 9. --- Seed Ratings ---
  console.log('Seeding ratings...');
  for (const foodItem of foodItems.slice(0, 8)) {
    for (const customer of customers.slice(0, 5)) {
      if (Math.random() > 0.5) { // Not every customer rates every item
        await prisma.rating.create({
          data: {
            foodItemId: foodItem.id,
            userId: customer.id,
            stars: getRandomItem([3, 4, 4, 5, 5]),
            comment: getRandomItem(['Delicious!', 'Loved it!', 'Could be better.', 'Best in town!', null]),
          }
        });
      }
    }
  }
  console.log('Ratings created.');

  // 10. --- Seed Inventory Alert ---
  console.log('Seeding an inventory alert...');
  const lowStockItem = rawMaterials.find(rm => rm.name === 'Jaggery')!;
  await prisma.inventoryAlert.create({
    data: {
      rawMaterialId: lowStockItem.id,
      message: `${lowStockItem.name} is below the restock threshold of ${lowStockItem.restockThreshold} ${lowStockItem.unit}.`,
      severity: AlertSeverity.LOW,
    }
  });
  console.log('Inventory alert created.');
  
  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('An error occurred while seeding the database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });