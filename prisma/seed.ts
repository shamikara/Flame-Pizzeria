// prisma/seed.ts
import { PrismaClient, Role, OrderStatus, OrderType, LeaveStatus, MeasurementUnit, AlertSeverity,PaymentMethod, PaymentStatus  } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const randomFrom = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

async function cleanup() {
  //  delete in order that prevents FK conflicts
  await prisma.auditLog.deleteMany();
  await prisma.inventoryAlert.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.customization.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log('Seed: start');

  await cleanup();
  console.log('DB cleaned.');

  // 1) Suppliers
  const supplierData = [
    { name: 'Kandy Fresh Vegetables', contact: '0812233445' },
    { name: 'Colombo Spice Traders', contact: '0112556677', email: 'sales@colombospice.lk' },
    { name: 'Galle Seafood Direct', contact: '0914556789' },
    { name: 'Nuwara Eliya Dairy Farms', contact: '0522223344' },
    { name: 'Polonnaruwa Rice Millers', contact: '0272225588' },
  ];
  await prisma.supplier.createMany({ data: supplierData });
  const suppliers = await prisma.supplier.findMany();

  // 2) Categories
  const categoryNames = ['Rice & Curry','Kottu','Short Eats','Hoppers & String Hoppers','Desserts','Beverages','Pizza','Burgers & Submarines','Drinks & Desserts'];
  await prisma.category.createMany({ data: categoryNames.map(n => ({ name: n })) });
  const categories = await prisma.category.findMany();

  // helper find supplier id
  const findSupplierId = (sub: string) => suppliers.find(s => s.name.toLowerCase().includes(sub.toLowerCase()))?.id ?? null;

  // 3) Ingredients
  const ingredientSeed = [
    { name: 'Basmati Rice', stock: 50, unit: MeasurementUnit.KG, restockThreshold: 10, supplierId: findSupplierId('Polonnaruwa') },
    { name: 'Red Onions', stock: 20, unit: MeasurementUnit.KG, restockThreshold: 5, supplierId: findSupplierId('Kandy') },
    { name: 'Garlic', stock: 5, unit: MeasurementUnit.KG, restockThreshold: 1, supplierId: findSupplierId('Kandy') },
    { name: 'Chilli Powder', stock: 10, unit: MeasurementUnit.KG, restockThreshold: 2, supplierId: findSupplierId('Colombo') },
    { name: 'Coconut Milk Powder', stock: 15, unit: MeasurementUnit.KG, restockThreshold: 3, supplierId: findSupplierId('Colombo') },
    { name: 'Chicken', stock: 25, unit: MeasurementUnit.KG, restockThreshold: 5, supplierId: findSupplierId('Galle') },
    { name: 'Fish (Tuna)', stock: 15, unit: MeasurementUnit.KG, restockThreshold: 4, supplierId: findSupplierId('Galle') },
    { name: 'Eggs', stock: 100, unit: MeasurementUnit.PIECE, restockThreshold: 24, supplierId: findSupplierId('Nuwara') },
    { name: 'All-Purpose Flour', stock: 20, unit: MeasurementUnit.KG, restockThreshold: 5 },
    { name: 'Limes', stock: 50, unit: MeasurementUnit.PIECE, restockThreshold: 10, supplierId: findSupplierId('Kandy') },
    { name: 'King Coconut', stock: 30, unit: MeasurementUnit.PIECE, restockThreshold: 10, supplierId: findSupplierId('Kandy') },
    { name: 'Jaggery', stock: 5, unit: MeasurementUnit.KG, restockThreshold: 1, supplierId: findSupplierId('Colombo') },
    { name: 'Yogurt', stock: 10, unit: MeasurementUnit.L, restockThreshold: 2, supplierId: findSupplierId('Nuwara') },
    { name: 'Mozzarella Cheese', stock: 10, unit: MeasurementUnit.KG, restockThreshold: 2 },
    { name: 'Pepperoni', stock: 8, unit: MeasurementUnit.KG, restockThreshold: 2 },
  ];

  for (const ing of ingredientSeed) {
    await prisma.ingredient.create({
      data: {
        name: ing.name,
        stock: ing.stock,
        unit: ing.unit,
        restockThreshold: ing.restockThreshold ?? 0,
        ...(ing.supplierId ? { supplier: { connect: { id: ing.supplierId } } } : {}),
      } as any,
    });
  }
  const ingredients = await prisma.ingredient.findMany();

  // 4) Users & Employees
  const hashed = await hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashed,
      role: Role.ADMIN,
      address: '123 Main St, Colombo',
      contact: '0771234567',
    }
  });

  const chefUser = await prisma.user.create({
    data: {
      firstName: 'Kamal',
      lastName: 'Perera',
      email: 'chef.kamal@example.com',
      password: hashed,
      role: Role.CHEF,
      address: '45 Galle Road, Dehiwala',
      contact: '0712345678',
      employee: { create: { salary: 80000, leaveStatus: LeaveStatus.ACTIVE } }
    },
    include: { employee: true }
  });

  const managerUser = await prisma.user.create({
    data: {
      firstName: 'Sunil',
      lastName: 'Fernando',
      email: 'manager.sunil@example.com',
      password: hashed,
      role: Role.MANAGER,
      address: '88 High Level Road, Nugegoda',
      contact: '0765432109',
      employee: { create: { salary: 120000, leaveStatus: LeaveStatus.ACTIVE } }
    },
    include: { employee: true }
  });

  const waiterUser = await prisma.user.create({
    data: {
      firstName: 'Nimal',
      lastName: 'Silva',
      email: 'waiter.nimal@example.com',
      password: hashed,
      role: Role.WAITER,
      address: '10 Station Road, Mount Lavinia',
      contact: '0759876543',
      employee: { create: { salary: 45000, leaveStatus: LeaveStatus.ACTIVE } }
    },
    include: { employee: true }
  });

  const deliveryUser = await prisma.user.create({
    data: {
      firstName: 'Ravi',
      lastName: 'Jayakody',
      email: 'delivery.ravi@example.com',
      password: hashed,
      role: Role.DELIVERY_PERSON,
      address: '22 Templers Road, Piliyandala',
      contact: '0723456789',
      employee: { create: { salary: 50000, leaveStatus: LeaveStatus.ACTIVE } }
    },
    include: { employee: true }
  });

  // customers
  const customersSeed = [
    { firstName: 'Anusha', lastName: 'Bandara', email: 'anusha.b@example.com', address: '34 Marine Drive, Colombo 03', contact: '0777890123' },
    { firstName: 'Dinesh', lastName: 'Wickramasinghe', email: 'dinesh.w@example.com', address: '56 Parliament Road, Rajagiriya', contact: '0711223344' },
    { firstName: 'Priya', lastName: 'Kumari', email: 'priya.k@example.com', address: 'Kandy Lake Round, Kandy', contact: '0701112222' },
    { firstName: 'Saman', lastName: 'De Silva', email: 'saman.ds@example.com', address: 'Galle Fort, Galle', contact: '0713334444' },
    { firstName: 'Ishara', lastName: 'Gamage', email: 'ishara.g@example.com', address: 'Ja-Ela', contact: '0724445555' },
  ];

  await prisma.user.createMany({
    data: customersSeed.map(c => ({ ...c, password: hashed, role: Role.CUSTOMER })),
  });

  const employees = [chefUser.employee!, managerUser.employee!, waiterUser.employee!, deliveryUser.employee!];
  const customers = await prisma.user.findMany({ where: { role: Role.CUSTOMER } });

  // 5) FoodItems
  const cat = (name: string) => categories.find(c => c.name === name)!;

  const foodSeed = [
    { name: 'Margherita Pizza', description: 'Classic tomato sauce, fresh mozzarella, basil', price: 1399, imageUrl: '/img/fooditems/1.png', categoryId: cat('Pizza').id },
    { name: 'Black Chicken Pizza', description: 'BBQ sauce with black chicken curry topping', price: 1699, imageUrl: '/img/fooditems/2.png', categoryId: cat('Pizza').id },
    { name: 'Pepperoni Pizza', description: 'Classic pepperoni pizza with extra cheese', price: 1499, imageUrl: '/img/fooditems/3.png', categoryId: cat('Pizza').id },
    { name: 'Chicken Kottu', description: 'Shredded roti stir-fried with chicken, veg & egg', price: 950, imageUrl: '/img/fooditems/11.png', categoryId: cat('Kottu').id },
    { name: 'Fish Rice & Curry', description: 'Basmati rice with spicy tuna curry', price: 800, imageUrl: '/img/fooditems/13.png', categoryId: cat('Rice & Curry').id },
    { name: 'Egg Hopper', description: 'Crispy bowl-shaped pancake with soft-cooked egg', price: 150, imageUrl: '/img/fooditems/16.png', categoryId: cat('Hoppers & String Hoppers').id },
    { name: 'Watalappan', description: 'Jaggery coconut custard', price: 350, imageUrl: '/img/fooditems/20.png', categoryId: cat('Desserts').id },
    { name: 'Faluda', description: 'Rose milk with ice cream & basil seeds', price: 450, imageUrl: '/img/fooditems/19.png', categoryId: cat('Beverages').id },
    { name: 'Classic Cheeseburger', description: 'Beef patty, cheese, lettuce, tomato, special sauce', price: 1099, imageUrl: '/img/fooditems/7.png', categoryId: cat('Burgers & Submarines').id },
  ];

  for (const f of foodSeed) {
    await prisma.foodItem.create({
      data: {
        name: f.name,
        description: f.description,
        price: f.price,
        imageUrl: f.imageUrl,
        category: { connect: { id: f.categoryId } },
        isActive: true,
      }
    });
  }

  const foodItems = await prisma.foodItem.findMany();

  // 6) Customizations (attach some to pizzas & burgers)
  const commonCustoms = [
    { name: 'Extra Cheese', price: 150 },
    { name: 'Mushrooms', price: 100 },
    { name: 'Extra Pepperoni', price: 150 },
    { name: 'Extra Onions', price: 75 },
    { name: 'Extra Bell Peppers', price: 75 },
    { name: 'Double Patty', price: 300 },
    { name: 'Bacon', price: 150 },
    { name: 'Avocado', price: 200 },
    { name: 'Fried Egg', price: 100 },
  ];

  // Attach first 5 customs to each food (for demo)
  for (const fi of foodItems) {
    const customs = commonCustoms.slice(0, 5).map(c => ({ ...c, foodItemId: fi.id }));
    await prisma.customization.createMany({ data: customs });
  }

  const customs = await prisma.customization.findMany();

  // 7) Recipes + recipe ingredients (example for Chicken Kottu)
  const chickenKottu = await prisma.foodItem.findFirst({ where: { name: 'Chicken Kottu' } });
  if (chickenKottu) {
    await prisma.recipe.create({
      data: {
        name: 'Authentic Chicken Kottu Recipe',
        description: 'Street-style Chicken Kottu',
        steps: '1. Shred roti. 2. Sauté onions, garlic. 3. Cook chicken. 4. Mix with roti and eggs.',
        foodItem: { connect: { id: chickenKottu.id } },
        author: { connect: { id: chefUser.id } },
        ingredients: {
          create: [
            { ingredient: { connect: { name: 'Chicken' } }, quantity: 0.2, unit: MeasurementUnit.KG },
            { ingredient: { connect: { name: 'Red Onions' } }, quantity: 0.1, unit: MeasurementUnit.KG },
            { ingredient: { connect: { name: 'Garlic' } }, quantity: 0.05, unit: MeasurementUnit.KG },
            { ingredient: { connect: { name: 'Eggs' } }, quantity: 2, unit: MeasurementUnit.PIECE },
            { ingredient: { connect: { name: 'Chilli Powder' } }, quantity: 0.02, unit: MeasurementUnit.KG },
          ]
        }
      }
    });
  }

  // 8) Create demo orders (15) and deduct ingredients for CONFIRMED/PREPARING orders
  console.log('Seeding demo orders...');
  const allFood = await prisma.foodItem.findMany({ include: { recipe: { include: { ingredients: true } } } });
  for (let i = 0; i < 15; i++) {
    const customer = randomFrom(customers);
    const type = randomFrom([OrderType.DINE_IN, OrderType.DELIVERY, OrderType.TAKEAWAY]);
    const status = randomFrom([OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.DELIVERED]);

    // pick 1-3 random items
    const k = Math.floor(Math.random() * 3) + 1;
    const chosen = Array.from({ length: k }, () => randomFrom(allFood));

    const total = chosen.reduce((s, it) => s + Number(it.price), 0);

    // create order
    const order = await prisma.order.create({
      data: {
        user: { connect: { id: customer.id } },
        total,
        status,
        type,
        address: type === OrderType.DELIVERY ? (customer.address ?? 'Customer address') : 'In-house',
        phone: customer.contact ?? '000',
        tableNumber: type === OrderType.DINE_IN ? `${Math.floor(Math.random() * 12) + 1}` : null,
        items: {
          create: chosen.map(it => ({
            foodItem: { connect: { id: it.id } },
            quantity: 1,
            price: it.price,
            specialNotes: Math.random() > 0.8 ? 'Extra spicy please!' : null,
            customizations: JSON.stringify(Math.random() > 0.6 ? [{ name: 'Extra Cheese', price: 150 }] : []),
          })),
        },
        payments: {
          create: {
            amount: total,
            method: PaymentMethod.CASH,
            status: PaymentStatus.COMPLETED,
          }
        }
      },
      include: { items: true }
    });

    // If order is CONFIRMED or PREPARING we deduct ingredients (simulate kitchen consumption)
    if (order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.PREPARING) {
      for (const it of order.items) {
        const fi = allFood.find(f => f.id === it.foodItemId);
        if (fi?.recipe?.ingredients && fi?.recipe?.ingredients.length > 0) {
          for (const ri of fi.recipe.ingredients) {
            const deductAmount = Number(ri.quantity) * Number(it.quantity); // quantity per recipe * ordered qty
            // update ingredient stock (use optimistic update)
            await prisma.ingredient.update({
              where: { id: ri.ingredientId },
              data: { stock: { decrement: deductAmount } as any } as any, // decrement not typed in prisma v4 types for Mysql; we use this pattern
            }).catch(async (err) => {
              // fallback: read->update
              const current = await prisma.ingredient.findUnique({ where: { id: ri.ingredientId } });
              if (current) {
                await prisma.ingredient.update({
                  where: { id: current.id },
                  data: { stock: current.stock - deductAmount },
                });
              }
            });
            // after update, check threshold and create alert if needed
            const ing = await prisma.ingredient.findUnique({ where: { id: ri.ingredientId } });
            if (ing && ing.stock < (ing.restockThreshold ?? 0)) {
              // create inventory alert if not exists
              const existing = await prisma.inventoryAlert.findFirst({ where: { ingredientId: ing.id, resolved: false } });
              if (!existing) {
                await prisma.inventoryAlert.create({
                  data: {
                    ingredient: { connect: { id: ing.id } },
                    message: `${ing.name} is below threshold (${ing.stock} ${ing.unit}).`,
                    severity: AlertSeverity.LOW,
                  }
                });
              }
            }
          }
        }
      }
    }

    // if delivery type create delivery record
    if (order.type === OrderType.DELIVERY) {
      await prisma.delivery.create({
        data: {
          order: { connect: { id: order.id } },
          employee: { connect: { id: deliveryUser.employee!.id } },
          startTime: new Date(order.createdAt),
          endTime: new Date(Date.now() + 30 * 60 * 1000),
          status: 'pending',
        } as any
      });
    }
  }

  // 9) Ratings sample
  const sampleFood = allFood.slice(0, Math.min(allFood.length, 6));
  for (const f of sampleFood) {
    for (const c of customers.slice(0, Math.min(customers.length, 4))) {
      if (Math.random() > 0.5) {
        await prisma.rating.create({
          data: {
            foodItem: { connect: { id: f.id } },
            user: { connect: { id: c.id } },
            stars: randomFrom([3,4,5]),
            comment: randomFrom(['Delicious!', 'Could be better', null]),
          }
        });
      }
    }
  }

  // 10) small audit log
  await prisma.auditLog.create({
    data: {
      action: 'SEED',
      entityType: 'SeedScript',
      entityId: 'initial-seed',
      userId: admin.id,
      oldData: null,
      newData: { note: 'Initial seed run' } as any
    }
  });

  console.log('Seed: finished.');
}

main()
  .catch(e => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
