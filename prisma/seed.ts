import { PrismaClient, Role, OrderStatus, OrderType, MeasurementUnit, PaymentMethod, PaymentStatus, AlertSeverity, LeaveStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: "Food Supplier One",
      contact: "+94112223344",
      email: "supplier@example.com",
      isActive: true,
    },
  });

  // 2. Ingredient
  const ingredient = await prisma.ingredient.create({
    data: {
      name: "Flour",
      stock: 100,
      unit: MeasurementUnit.KG,
      restockThreshold: 10,
      supplierId: supplier.id,
    },
  });

  // 3. Categories
  const pizzaCategory = await prisma.category.create({ data: { name: "Pizza" } });
  const drinkCategory = await prisma.category.create({ data: { name: "Drinks" } });

  // 4. Food Items
  const margherita = await prisma.foodItem.create({
    data: {
      name: "Margherita Pizza",
      description: "Classic tomato sauce, fresh mozzarella, basil",
      price: 1399,
      imageUrl: "img/fooditems/1.png",
      categoryId: pizzaCategory.id,
    },
  });

  const faluda = await prisma.foodItem.create({
    data: {
      name: "Faluda",
      description: "Rose milk with ice cream, basil seeds, jelly & syrup",
      price: 450,
      imageUrl: "img/fooditems/19.png",
      categoryId: drinkCategory.id,
    },
  });

  // 5. Customizations for Margherita Pizza
  const extraCheese = await prisma.customization.create({
    data: {
      name: "Extra Cheese",
      price: 150,
      foodItemId: margherita.id,
      ingredients: {
        create: [
          {
            ingredientId: ingredient.id,
            quantity: 0.05,
            unit: MeasurementUnit.KG,
          },
        ],
      },
    },
  });

  // 6. Users
  const adminUser = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: "password",
      role: Role.ADMIN,
    },
  });

  const chefUser = await prisma.user.create({
    data: {
      firstName: "Chef",
      lastName: "User",
      email: "chef@example.com",
      password: "password",
      role: Role.CHEF,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      firstName: "Manager",
      lastName: "User",
      email: "manager@example.com",
      password: "password",
      role: Role.MANAGER,
    },
  });

  const waiterUser = await prisma.user.create({
    data: {
      firstName: "Waiter",
      lastName: "User",
      email: "waiter@example.com",
      password: "password",
      role: Role.WAITER,
    },
  });

  const deliveryUser = await prisma.user.create({
    data: {
      firstName: "Delivery",
      lastName: "User",
      email: "delivery@example.com",
      password: "password",
      role: Role.DELIVERY_PERSON,
    },
  });

  const helperUser = await prisma.user.create({
    data: {
      firstName: "Helper",
      lastName: "User",
      email: "helper@example.com",
      password: "password",
      role: Role.KITCHEN_HELPER,
    },
  });

  // 5 Customers
  const customers = [];
  for (let i = 1; i <= 5; i++) {
    const customer = await prisma.user.create({
      data: {
        firstName: `Customer${i}`,
        lastName: "User",
        email: `customer${i}@example.com`,
        password: "password",
        role: Role.CUSTOMER,
      },
    });
    customers.push(customer);
  }

  // 7. Employees linked to users
  const adminEmployee = await prisma.employee.create({ data: { userId: adminUser.id, salary: 2000, leaveStatus: LeaveStatus.ACTIVE } });
  const chefEmployee = await prisma.employee.create({ data: { userId: chefUser.id, salary: 1500, leaveStatus: LeaveStatus.ACTIVE } });
  const managerEmployee = await prisma.employee.create({ data: { userId: managerUser.id, salary: 1800, leaveStatus: LeaveStatus.ACTIVE } });
  const waiterEmployee = await prisma.employee.create({ data: { userId: waiterUser.id, salary: 1000, leaveStatus: LeaveStatus.ACTIVE } });
  const deliveryEmployee = await prisma.employee.create({ data: { userId: deliveryUser.id, salary: 1200, leaveStatus: LeaveStatus.ACTIVE } });
  const helperEmployee = await prisma.employee.create({ data: { userId: helperUser.id, salary: 800, leaveStatus: LeaveStatus.ACTIVE } });

  // 8. Sample Recipe for Margherita
  const recipe = await prisma.recipe.create({
    data: {
      name: "Margherita Pizza Recipe",
      description: "Step by step Margherita pizza recipe",
      steps: "1. Prepare dough\n2. Add sauce\n3. Add cheese\n4. Bake",
      foodItemId: margherita.id,
      authorId: customers[0].id,
      ingredients: {
        create: [
          {
            ingredientId: ingredient.id,
            quantity: 0.2,
            unit: MeasurementUnit.KG,
          },
        ],
      },
    },
  });

  // 9. Sample Order
  const order = await prisma.order.create({
    data: {
      total: 1549,
      status: OrderStatus.PENDING,
      type: OrderType.DELIVERY,
      address: "123 Main St",
      phone: "+94110000000",
      userId: customers[0].id,
      preparedById: chefEmployee.id,
      deliveredById: deliveryEmployee.id,
      items: {
        create: [
          {
            foodItemId: margherita.id,
            quantity: 1,
            price: 1399,
            customizations: JSON.stringify([{ id: extraCheese.id, name: extraCheese.name, price: extraCheese.price }]),
          },
          {
            foodItemId: faluda.id,
            quantity: 1,
            price: 450,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 1549,
            method: PaymentMethod.CARD,
            status: PaymentStatus.COMPLETED,
          },
        ],
      },
      delivery: {
        create: {
          startTime: new Date(),
          status: "pending",
          employeeId: deliveryEmployee.id,
        },
      },
    },
  });

  // 10. Sample Inventory Alert
  await prisma.inventoryAlert.create({
    data: {
      message: "Flour stock low",
      severity: AlertSeverity.LOW,
      ingredientId: ingredient.id,
    },
  });

  // 11. Rating
  await prisma.rating.create({
    data: {
      stars: 5,
      comment: "Delicious pizza!",
      userId: customers[0].id,
      foodItemId: margherita.id,
    },
  });

  // 12. Newsletter subscription
  await prisma.newsletterSubscription.create({
    data: {
      email: "subscriber@example.com",
    },
  });

  // 13. Audit Log
  await prisma.auditLog.create({
    data: {
      action: "Seed Data Created",
      entityType: "All",
      entityId: 0,
      userId: adminUser.id,
      oldData: null,
      newData: { message: "Initial seed" },
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
