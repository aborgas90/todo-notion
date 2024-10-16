const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("Successful to connect the databases")
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports =  connectDatabase();
