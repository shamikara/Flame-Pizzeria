// prisma/seed.ts
// --- SRI LANKAN CONTEXT VERSION ---
import { PrismaClient, Role, MeasurementUnit, OrderStatus, OrderType, LeaveStatus, Supplier, RawMaterial, Category } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started for a Sri Lankan Restaurant...');

  // --- 1. Clean up existing data to avoid conflicts ---
  await prisma.rating.deleteMany();
  await prisma.recipeComment.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.inventoryAlert.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.rawMaterial.deleteMany();
  await prisma.supplier.deleteMany();

  console.log('Cleared existing data.');

  // --- 2. Create Sri Lankan Suppliers ---
  const supplierData = [
    { name: 'Colombo Fresh Produce', contact: '0112345678' },
    { name: 'Kandy Spice Mart', contact: '0812223334' },
    { name: 'Negombo Seafood Direct', contact: '0312277889' },
  ];
  await prisma.supplier.createMany({ data: supplierData });
  const suppliers = await prisma.supplier.findMany();
  console.log(`Created ${suppliers.length} suppliers.`);


  // --- 3. Create Raw Materials (relevant to Sri Lankan cooking) ---
  const rawMaterialData = [
    { name: 'Flour', quantity: 50, unit: MeasurementUnit.KG, supplierId: suppliers[0].id },
    { name: 'Canned Mackerel', quantity: 100, unit: MeasurementUnit.PIECE, supplierId: suppliers[2].id },
    { name: 'Big Onions (B-Onions)', quantity: 20, unit: MeasurementUnit.KG, supplierId: suppliers[0].id },
    { name: 'Potatoes', quantity: 25, unit: MeasurementUnit.KG, supplierId: suppliers[0].id },
    { name: 'Green Chili', quantity: 5, unit: MeasurementUnit.KG, supplierId: suppliers[0].id },
    { name: 'Curry Powder', quantity: 10, unit: MeasurementUnit.KG, supplierId: suppliers[1].id },
    { name: 'Chili Powder', quantity: 10, unit: MeasurementUnit.KG, supplierId: suppliers[1].id },
    { name: 'Turmeric Powder', quantity: 5, unit: MeasurementUnit.KG, supplierId: suppliers[1].id },
    { name: 'Chicken', quantity: 30, unit: MeasurementUnit.KG, supplierId: suppliers[2].id },
    { name: 'Godamba Roti', quantity: 200, unit: MeasurementUnit.PIECE, supplierId: suppliers[0].id },
    { name: 'Leeks', quantity: 10, unit: MeasurementUnit.KG, supplierId: suppliers[0].id },
    { name: 'Carrots', quantity: 10, unit: MeasurementUnit.KG, supplierId: suppliers[0].id },
    { name: 'Sugar', quantity: 50, unit: MeasurementUnit.KG, supplierId: suppliers[0].id },
    { name: 'Milk Powder', quantity: 20, unit: MeasurementUnit.KG, supplierId: suppliers[0].id },
    { name: 'Rose Syrup', quantity: 10, unit: MeasurementUnit.L, supplierId: suppliers[1].id },
    { name: 'Jelly Crystals', quantity: 50, unit: MeasurementUnit.PIECE, supplierId: suppliers[1].id },
  ];
  await prisma.rawMaterial.createMany({ data: rawMaterialData });
  const rawMaterials = await prisma.rawMaterial.findMany();
  console.log(`Created ${rawMaterials.length} raw materials.`);


  // --- 4. Create Users (Admin, Employees, Customers with Sri Lankan names) ---
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({ data: { firstName: 'Nimal', lastName: 'Perera', email: 'admin@slbakery.com', password: adminPassword, role: Role.ADMIN, employee: { create: { salary: 150000, leaveStatus: LeaveStatus.ACTIVE } } } });
  const chef = await prisma.user.create({ data: { firstName: 'Sunil', lastName: 'Fernando', email: 'chef@slbakery.com', password: userPassword, role: Role.CHEF, employee: { create: { salary: 80000, leaveStatus: LeaveStatus.ACTIVE } } } });
  const waiter = await prisma.user.create({ data: { firstName: 'Kasun', lastName: 'Silva', email: 'waiter@slbakery.com', password: userPassword, role: Role.WAITER, employee: { create: { salary: 50000, leaveStatus: LeaveStatus.ACTIVE } } } });
  const customer1 = await prisma.user.create({ data: { firstName: 'Anusha', lastName: 'De Silva', email: 'anusha@email.com', password: userPassword, role: Role.CUSTOMER, address: '12, Galle Road, Colombo' } });
  const customer2 = await prisma.user.create({ data: { firstName: 'Ravi', lastName: 'Jayawardena', email: 'ravi@email.com', password: userPassword, role: Role.CUSTOMER, address: '34, Kandy Road, Kadawatha' } });
  console.log("================== DEBUGGING ==================");
console.log("Looking for employee record for chef user ID:", chef.id);

const chefEmployee = await prisma.employee.findUnique({ where: { userId: chef.id } });

console.log("Found chef employee record:", chefEmployee);
console.log("==============================================");
  // --- 5. Create Categories relevant to a Sri Lankan Bakery ---
  const categoryData = [
    { name: 'Short Eats' },
    { name: 'Kottu & Rice' },
    { name: 'Beverages' },
  ];
  await prisma.category.createMany({ data: categoryData });
  const categories = await prisma.category.findMany();
  console.log(`Created ${categories.length} categories.`);
  
  const shortEatsCategory = categories.find((c: Category) => c.name === 'Short Eats')!;
  const mainsCategory = categories.find((c: Category) => c.name === 'Kottu & Rice')!;
  const beverageCategory = categories.find((c: Category) => c.name === 'Beverages')!;
  
  // --- 6. Create Food Items (Popular Sri Lankan Items) ---
  const maaluPaan = await prisma.foodItem.create({
    data: { name: 'Fish Bun (Maalu Paan)', description: 'A classic Sri Lankan bakery item. A soft bun filled with a savory and spicy fish mixture.', price: 120.00, imageUrl: '/img/fooditems/maalu-paan.png', categoryId: shortEatsCategory.id },
  });
  
  const chickenKottu = await prisma.foodItem.create({
    data: { name: 'Chicken Kottu', description: 'Chopped Godamba roti stir-fried with chicken, vegetables, and aromatic spices. A local favorite!', price: 950.00, imageUrl: '/img/fooditems/kottu.png', categoryId: mainsCategory.id },
  });

  const faluda = await prisma.foodItem.create({
    data: { name: "Faluda", description: "A sweet and refreshing beverage made with rose syrup, milk, jelly, and basil seeds.", price: 450.00, imageUrl: '/img/fooditems/faluda.png', categoryId: beverageCategory.id },
  });
  console.log('Created authentic Sri Lankan food items.');

  // --- 7. Create Recipes for the Food Items ---
  await prisma.recipe.create({
    data: {
      name: `Recipe for ${maaluPaan.name}`,
      description: `How to make the classic Maalu Paan filling and bun.`,
      steps: "1. Prepare dough. 2. Sauté onions, chilies. 3. Add canned fish and spices. 4. Fill dough and bake.",
      foodItemId: maaluPaan.id,
      authorId: chef.id,
      ingredients: { create: [
        { rawMaterialId: rawMaterials.find((rm: RawMaterial) => rm.name === 'Flour')!.id, quantity: 100, unit: MeasurementUnit.G },
        { rawMaterialId: rawMaterials.find((rm: RawMaterial) => rm.name === 'Canned Mackerel')!.id, quantity: 50, unit: MeasurementUnit.G },
        { rawMaterialId: rawMaterials.find((rm: RawMaterial) => rm.name === 'Big Onions (B-Onions)')!.id, quantity: 20, unit: MeasurementUnit.G },
        { rawMaterialId: rawMaterials.find((rm: RawMaterial) => rm.name === 'Curry Powder')!.id, quantity: 5, unit: MeasurementUnit.G },
      ]},
    },
  });

  await prisma.recipe.create({
    data: {
      name: `Recipe for ${chickenKottu.name}`,
      description: `The secret to a perfect, noisy Chicken Kottu.`,
      steps: "1. Chop Roti. 2. Sauté vegetables and chicken. 3. Mix everything on a flat-top grill with two metal blades.",
      foodItemId: chickenKottu.id,
      authorId: chef.id,
      ingredients: { create: [
        { rawMaterialId: rawMaterials.find((rm: RawMaterial) => rm.name === 'Godamba Roti')!.id, quantity: 2, unit: MeasurementUnit.PIECE },
        { rawMaterialId: rawMaterials.find((rm: RawMaterial) => rm.name === 'Chicken')!.id, quantity: 150, unit: MeasurementUnit.G },
        { rawMaterialId: rawMaterials.find((rm: RawMaterial) => rm.name === 'Carrots')!.id, quantity: 50, unit: MeasurementUnit.G },
        { rawMaterialId: rawMaterials.find((rm: RawMaterial) => rm.name === 'Leeks')!.id, quantity: 50, unit: MeasurementUnit.G },
      ]},
    },
  });
  console.log('Created authentic recipes.');

  // --- 8. Create Orders with Sri Lankan context ---
  await prisma.order.create({
    data: {
      userId: customer1.id,
      total: chickenKottu.price + faluda.price,
      status: OrderStatus.DELIVERED,
      type: OrderType.DELIVERY,
      deliveryAddress: customer1.address,
      preparedById: chefEmployee!.id,
      items: { create: [
        { foodItemId: chickenKottu.id, quantity: 1, price: chickenKottu.price },
        { foodItemId: faluda.id, quantity: 1, price: faluda.price },
      ]},
      payments: { create: { amount: chickenKottu.price + faluda.price, method: 'CARD', status: 'COMPLETED' } },
    },
  });
  
  await prisma.order.create({
    data: {
      userId: customer2.id,
      total: (maaluPaan.price * 2),
      status: OrderStatus.PREPARING,
      type: OrderType.DINE_IN,
      tableNumber: '5',
      preparedById: chefEmployee!.id,
      items: { create: [{ foodItemId: maaluPaan.id, quantity: 2, price: maaluPaan.price }] },
      payments: { create: { amount: (maaluPaan.price * 2), method: 'CASH', status: 'PENDING' } },
    },
  });
  console.log('Created sample orders.');

  // --- 9. Create an authentic Rating ---
  await prisma.rating.create({
    data: {
      userId: customer1.id,
      foodItemId: chickenKottu.id,
      stars: 5,
      comment: "The best Kottu I've had in Colombo! Perfectly spiced and not too oily. Highly recommended.",
    }
  });
  console.log('Created a sample rating.');
  
  console.log('Seeding finished successfully!');
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });