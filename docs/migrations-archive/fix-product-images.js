const path = require("path");
const knex = require("knex")({
  client: "better-sqlite3",
  connection: { filename: path.join(__dirname, "../data/shop.db") },
  useNullAsDefault: true
});
const fixes = [
  { id: 3, image: "https://images.unsplash.com/photo-1601524909162-ae8725290836?w=400&h=300&fit=crop" },
  { id: 4, image: "https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=400&h=300&fit=crop" },
  { id: 5, image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=300&fit=crop" },
  { id: 9, image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=400&h=300&fit=crop" },
];
async function run() {
  for (const fix of fixes) {
    await knex("products").where({ id: fix.id }).update({ image: fix.image });
    console.log("Updated product " + fix.id);
  }
  await knex.destroy();
  console.log("Done");
}
run().catch(e => { console.error(e); process.exit(1); });
