import { PrismaClient, ProductType } from "@prisma/client";

const prisma = new PrismaClient();

const products = ([
  ["Cashew Cake", "1 kg", 950],
  ["Cashew Cake", "1/2 kg", 480],
  ["Cashew Cake", "1/4 kg", 240],
  ["Badam Halwa", "1 kg", 980],
  ["Badam Halwa", "1/2 kg", 490],
  ["Badam Halwa", "1/4 kg", 250],
  ["Ghee Mysore Bagh", "1 kg", 650],
  ["Ghee Mysore Bagh", "1/2 kg", 330],
  ["Ghee Mysore Bagh", "1/4 kg", 170],
  ["Balaji Laddu", "1 kg", 600],
  ["Balaji Laddu", "1/2 kg", 300],
  ["Balaji Laddu", "1/4 kg", 150],
  ["Jilebi", "1 kg", 400],
  ["Jilebi", "1/2 kg", 200],
  ["Jilebi", "1/4 kg", 100],
  ["Mixture", "1 kg", 380],
  ["Mixture", "1/2 kg", 190],
  ["Mixture", "1/4 kg", 95],
  ["Kara Boondhi", "1 kg", 400],
  ["Kara Boondhi", "1/2 kg", 200],
  ["Kara Boondhi", "1/4 kg", 100],
 ] as [string, string, number][]).map(([name, packLabel, price]) => ({
  name,
  packLabel,
  price,
  type: ProductType.SWEET,
}));

const combos = ([
  ["Cashew Cake, Ghee Mysore Bagh & Balaji Laddu", "1 kg", 690],
  ["Cashew Cake, Ghee Mysore Bagh & Balaji Laddu", "1/2 kg", 350],
  ["Cashew Cake & Ghee Mysore Bagh", "1 kg", 810],
  ["Cashew Cake & Ghee Mysore Bagh", "1/2 kg", 410],
  ["Cashew Cake & Balaji Laddu", "1 kg", 780],
  ["Cashew Cake & Balaji Laddu", "1/2 kg", 390],
  ["Ghee Mysore Bagh & Balaji Laddu", "1 kg", 630],
  ["Ghee Mysore Bagh & Balaji Laddu", "1/2 kg", 320],
 ] as [string, string, number][]).map(([name, packLabel, price]) => ({
  name,
  packLabel,
  price,
  type: ProductType.COMBO,
}));

const comboComponents: Record<string, { name: string; quantity: string }[]> = {
  "Cashew Cake, Ghee Mysore Bagh & Balaji Laddu|1 kg": [{ name: "Cashew Cake", quantity: "200 gm" }, { name: "Ghee Mysore Bagh", quantity: "400 gm" }, { name: "Balaji Laddu", quantity: "400 gm" }],
  "Cashew Cake, Ghee Mysore Bagh & Balaji Laddu|1/2 kg": [{ name: "Cashew Cake", quantity: "100 gm" }, { name: "Ghee Mysore Bagh", quantity: "200 gm" }, { name: "Balaji Laddu", quantity: "200 gm" }],
  "Cashew Cake & Ghee Mysore Bagh|1 kg": [{ name: "Cashew Cake", quantity: "500 gm" }, { name: "Ghee Mysore Bagh", quantity: "500 gm" }],
  "Cashew Cake & Ghee Mysore Bagh|1/2 kg": [{ name: "Cashew Cake", quantity: "250 gm" }, { name: "Ghee Mysore Bagh", quantity: "250 gm" }],
  "Cashew Cake & Balaji Laddu|1 kg": [{ name: "Cashew Cake", quantity: "500 gm" }, { name: "Balaji Laddu", quantity: "500 gm" }],
  "Cashew Cake & Balaji Laddu|1/2 kg": [{ name: "Cashew Cake", quantity: "250 gm" }, { name: "Balaji Laddu", quantity: "250 gm" }],
  "Ghee Mysore Bagh & Balaji Laddu|1 kg": [{ name: "Ghee Mysore Bagh", quantity: "500 gm" }, { name: "Balaji Laddu", quantity: "500 gm" }],
  "Ghee Mysore Bagh & Balaji Laddu|1/2 kg": [{ name: "Ghee Mysore Bagh", quantity: "250 gm" }, { name: "Balaji Laddu", quantity: "250 gm" }],
};

async function main() {
  if (!(await prisma.product.count())) await prisma.product.createMany({ data: [...products, ...combos] });
  await Promise.all(Object.entries(comboComponents).map(([key, components]) => { const [name, packLabel] = key.split("|"); return prisma.product.updateMany({ where: { name, packLabel }, data: { components } }); }));
  console.log("Initial sweets and combo component weights are ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
