// check-models.js - Run this to find which model is causing the issue
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const files = fs.readdirSync(modelsDir).filter(file => 
  file !== 'index.js' && file.endsWith('.js')
);

console.log('Checking models...\n');

files.forEach(file => {
  const filePath = path.join(modelsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if it's a class
  if (content.includes('class ') && content.includes('extends Model')) {
    console.log(`❌ ${file} - Uses CLASS SYNTAX (needs fixing)`);
    console.log(`   Found: class ... extends Model`);
  }
  // Check if it exports a function
  else if (content.includes('module.exports = (sequelize, DataTypes)') || 
           content.includes('module.exports = function')) {
    console.log(`✅ ${file} - Uses FUNCTION SYNTAX (correct)`);
  }
  else {
    console.log(`⚠️  ${file} - Unknown format (check manually)`);
  }
  console.log('');
});

console.log('\nTo fix CLASS SYNTAX models, convert them to:');
console.log(`
module.exports = (sequelize, DataTypes) => {
  const ModelName = sequelize.define('ModelName', {
    // your columns here
  });
  
  ModelName.associate = (models) => {
    // your associations here
  };
  
  return ModelName;
};
`);