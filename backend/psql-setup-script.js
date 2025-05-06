// backend/psql-setup-script.js

// Import sequelize instance from your models
const { sequelize } = require('./db/models');

// Define the setup function for PostgreSQL schema creation
async function setupPostgreSQL() {
  try {
    // Show all existing schemas in the database
    const schemas = await sequelize.showAllSchemas({ logging: false });
    
    // Only create schema if in production environment and schema doesn't exist
    if (process.env.NODE_ENV === 'production') {
      const schemaName = process.env.SCHEMA;
      
      // Validate schema name exists in environment variables
      if (!schemaName) {
        console.error('Error: SCHEMA environment variable not set in production');
        return;
      }
      
      // Create schema if it doesn't already exist
      if (!schemas.includes(schemaName)) {
        console.log(`Creating schema: ${schemaName}...`);
        await sequelize.createSchema(schemaName);
        console.log('Schema created successfully');
      } else {
        console.log(`Schema "${schemaName}" already exists`);
      }
    } else {
      console.log('Not in production environment, skipping schema creation');
    }
  } catch (error) {
    console.error('Error setting up PostgreSQL schema:', error);
  }
}

// Execute the setup function
setupPostgreSQL();