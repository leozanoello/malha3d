require('dotenv').config();
const { Project, Client, TaskDependency, TaskTemplate } = require('../models');

async function verify() {
  console.log("=== VERIFYING DATABASE SCHEMAS AND RELATIONS ===");
  try {
    const depCount = await TaskDependency.count();
    console.log(`✅ TaskDependency model exists and contains ${depCount} entries.`);
    
    const tempCount = await TaskTemplate.count();
    console.log(`✅ TaskTemplate model exists and contains ${tempCount} entries.`);
    
    const project = await Project.findOne({
      include: [
        { model: Client, as: 'customer' }
      ]
    });
    if (project) {
      console.log(`✅ Project table is accessible. Found project: ${project.title}`);
      console.log(`✅ Client mapping (customer) works: ${project.customer?.name || 'No customer linked'}`);
    } else {
      console.log("⚠️ No projects found in DB (empty table).");
    }
    console.log("🔥 Verification completed successfully!");
  } catch (err) {
    console.error("❌ Schema / association error:", err);
  }
}

verify();
