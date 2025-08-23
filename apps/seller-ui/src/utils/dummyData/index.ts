/*
  Utilities to generate dummy products and events for local development and demos.
  - Dataset: categories, subCategories, brands, tags, colors, sizes, lorem text.
  - Generators: createDummyProduct, createDummyEvent, bulk creators.
*/

type ProductStatus = 'ACTIVE' | 'PENDING' | 'DRAFT';

export type DummyImage = { fileUrl: string; fileId: string };
export type DummyProduct = {
  title: string;
  slug: string;
  description: string;
  detailed_description: string;
  warranty: string;
  custom_specifications: Record<string, string | number | boolean>;
  customProperties: Record<string, string | number | boolean>;
  tags: string[];
  cash_on_delivery: 'yes' | 'none';
  brand?: string;
  video_url?: string;
  category: string;
  subCategory: string;
  colors: string[];
  sizes: string[];
  stock: number;
  sale_price: number;
  regular_price: number;
  discountCodes?: string[];
  images: DummyImage[];
  status?: ProductStatus;
};

export type DummyEvent = DummyProduct & {
  starting_date: string; // ISO string
  ending_date: string; // ISO string
};

const dataset = {
  categories: {
    electronics: ['Phones', 'Laptops', 'Audio', 'Wearables', 'Tablets', 'Monitors', 'Cameras', 'Drones'],
    clothing: ['T-Shirts', 'Jeans', 'Jackets', 'Shoes', 'Dresses', 'Hoodies', 'Socks', 'Accessories'],
    beauty: ['Skincare', 'Makeup', 'Haircare', 'Fragrances', 'Bath & Body'],
    sports: ['Fitness', 'Outdoor', 'Cycling', 'Running', 'Yoga', 'Team Sports'],
    home: ['Kitchen', 'Decor', 'Furniture', 'Appliances', 'Bedding', 'Storage'],
    groceries: ['Snacks', 'Beverages', 'Pantry', 'Breakfast', 'Dairy'],
    kids: ['Toys', 'Baby Care', 'Clothing', 'Learning'],
    books: ['Fiction', 'Non-fiction', 'Comics', 'Self-Help', 'Tech'],
    office: ['Stationery', 'Office Chairs', 'Desks', 'Organization'],
    garden: ['Plants', 'Gardening Tools', 'Outdoor Decor'],
    tools: ['Power Tools', 'Hand Tools', 'Safety'],
    music: ['Instruments', 'Audio Gear', 'Accessories'],
    gaming: ['Consoles', 'Games', 'Accessories'],
    pets: ['Food', 'Toys', 'Care'],
    jewelry: ['Necklaces', 'Rings', 'Bracelets', 'Watches'],
    health: ['Vitamins', 'Personal Care', 'Medical Supplies'],
    automotive: ['Car Care', 'Accessories', 'Electronics'],
  },
  brands: [
    'Acme',
    'Globex',
    'Initech',
    'Umbrella',
    'Soylent',
    'WayneTech',
    'Stark Industries',
    'Wonka',
    'Aperture',
    'Cyberdyne',
    'Hooli',
    'Vehement',
    'Massive Dynamic',
    'Pied Piper',
    'Tyrell',
    'Virtucon',
    'Gringotts',
    'Monarch',
    'Oscorp',
    'Dunder Mifflin',
  ],
  tags: [
    'new',
    'bestseller',
    'limited',
    'eco',
    'premium',
    'budget',
    'gift',
    'bundle',
    'clearance',
    'trending',
    'editor-choice',
    'flash-sale',
    'exclusive',
    'limited-time',
    'online-only',
    'new-arrival',
  ],
  colors: [
    'red',
    'blue',
    'green',
    'black',
    'white',
    'yellow',
    'pink',
    'purple',
    'orange',
    'gray',
    'navy',
    'beige',
    'maroon',
    'teal',
    'olive',
    'brown',
    'silver',
    'gold',
    'rose',
    'cyan',
    'magenta',
  ],
  sizes: ['One Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  adjectives: [
    'Sleek',
    'Modern',
    'Durable',
    'Compact',
    'Ergonomic',
    'Lightweight',
    'Premium',
    'Classic',
    'Smart',
    'Portable',
    'Advanced',
    'Versatile',
    'Elegant',
    'Rugged',
    'Comfortable',
    'High-Performance',
    'Energy-Efficient',
  ],
  nouns: [
    'Phone',
    'Headphones',
    'Backpack',
    'Sneakers',
    'Jacket',
    'Mixer',
    'Watch',
    'Sofa',
    'Camera',
    'Bottle',
    'Keyboard',
    'Mouse',
    'Router',
    'Drone',
    'Grinder',
    'Lamp',
    'Mug',
    'Towel',
    'Treadmill',
    'Tent',
  ],
  lorem:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.',
};

// Helpers
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPick = <T>(arr: T[]) => arr[randomInt(0, arr.length - 1)];
const randomPicks = <T>(arr: T[], count: number) => {
  const copy = [...arr];
  const picked: T[] = [];
  for (let i = 0; i < Math.min(count, copy.length); i++) {
    const idx = randomInt(0, copy.length - 1);
    picked.push(copy.splice(idx, 1)[0]);
  }
  return picked;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

const generateTitle = () => `${randomPick(dataset.adjectives)} ${randomPick(dataset.nouns)}`;
const generateDescription = () => dataset.lorem;
const generateDetailedDescription = () =>
  Array.from({ length: 120 }, () => randomPick(dataset.lorem.split(' '))).join(' ');

const generateCategory = () => {
  const category = randomPick(Object.keys(dataset.categories));
  const sub = randomPick(dataset.categories[category as keyof typeof dataset.categories]);
  return { category, subCategory: sub };
};

const generateImages = (count: number): DummyImage[] =>
  Array.from({ length: count }, (_, i) => ({
    fileUrl: `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/800/800`,
    fileId: `dummy-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
  }));

const generateCategorySpecifics = (category: string) => {
  switch (category) {
    case 'electronics':
      return {
        specs: {
          battery_life_hours: randomInt(4, 24),
          storage_gb: randomInt(32, 1024),
          waterproof: Math.random() > 0.7,
        },
        props: { warranty_type: 'manufacturer', fast_charge: Math.random() > 0.5 },
      };
    case 'clothing':
      return {
        specs: {
          material: randomPick(['cotton', 'polyester', 'wool', 'denim', 'linen']),
          fit: randomPick(['regular', 'slim', 'oversized']),
          care: randomPick(['machine-wash', 'hand-wash']),
        },
        props: { recyclable: Math.random() > 0.5, sustainable: Math.random() > 0.6 },
      };
    case 'home':
      return {
        specs: {
          dimensions_cm: `${randomInt(10, 200)}x${randomInt(10, 200)}x${randomInt(5, 100)}`,
          material: randomPick(['wood', 'metal', 'plastic', 'glass']),
          weight_kg: Number((Math.random() * 20).toFixed(1)),
        },
        props: { assembly_required: Math.random() > 0.5 },
      };
    case 'sports':
      return {
        specs: {
          weight_kg: Number((Math.random() * 10).toFixed(1)),
          usage: randomPick(['indoor', 'outdoor', 'both']),
          warranty_months: randomInt(3, 24),
        },
        props: { shock_absorbent: Math.random() > 0.5 },
      };
    case 'beauty':
      return {
        specs: {
          skin_type: randomPick(['dry', 'oily', 'combination', 'sensitive', 'all']),
          volume_ml: randomInt(20, 500),
          fragrance_free: Math.random() > 0.6,
        },
        props: { cruelty_free: Math.random() > 0.7 },
      };
    case 'groceries':
      return {
        specs: {
          weight_g: randomInt(100, 2000),
          organic: Math.random() > 0.3,
          shelf_life_months: randomInt(3, 24),
        },
        props: { vegetarian: Math.random() > 0.5, vegan: Math.random() > 0.4 },
      };
    case 'gaming':
      return {
        specs: {
          platform: randomPick(['PC', 'PlayStation', 'Xbox', 'Nintendo Switch']),
          online_required: Math.random() > 0.5,
          pegi_rating: randomPick([3, 7, 12, 16, 18]),
        },
        props: { digital_download: Math.random() > 0.5 },
      };
    default:
      return {
        specs: { warranty_type: 'standard' },
        props: { recyclable: Math.random() > 0.5 },
      };
  }
};

export const createDummyProduct = (overrides: Partial<DummyProduct> = {}): DummyProduct => {
  const title = overrides.title ?? generateTitle();
  const { category, subCategory } =
    overrides.category && overrides.subCategory
      ? { category: overrides.category, subCategory: overrides.subCategory }
      : generateCategory();

  const regular = overrides.regular_price ?? randomInt(20, 2000);
  const sale = overrides.sale_price ?? Math.max(1, Math.floor(regular * (0.6 + Math.random() * 0.3)));
  const { specs, props } = generateCategorySpecifics(category);

  const base: DummyProduct = {
    title,
    slug: overrides.slug ?? slugify(`${title}-${Date.now()}`),
    description: overrides.description ?? generateDescription(),
    detailed_description: overrides.detailed_description ?? generateDetailedDescription(),
    warranty: overrides.warranty ?? `${randomInt(0, 3) || 1} year(s)`,
    custom_specifications: overrides.custom_specifications ?? specs,
    customProperties: overrides.customProperties ?? {
      ...props,
      featured: Math.random() > 0.8,
      freeShipping: Math.random() > 0.6,
    },
    tags: overrides.tags ?? randomPicks(dataset.tags, randomInt(1, 5)),
    cash_on_delivery: overrides.cash_on_delivery ?? (Math.random() > 0.2 ? 'yes' : 'none'),
    brand: overrides.brand ?? randomPick(dataset.brands),
    video_url: overrides.video_url,
    category,
    subCategory,
    colors: overrides.colors ?? randomPicks(dataset.colors, randomInt(1, 4)),
    sizes: overrides.sizes ?? randomPicks(dataset.sizes, randomInt(1, 3)),
    stock: overrides.stock ?? randomInt(0, 1000),
    sale_price: sale,
    regular_price: regular,
    discountCodes: overrides.discountCodes ?? [],
    images: overrides.images ?? generateImages(randomInt(1, 8)),
    status: overrides.status ?? 'ACTIVE',
  };

  return base;
};

export const createDummyEvent = (overrides: Partial<DummyEvent> = {}): DummyEvent => {
  const product = createDummyProduct(overrides);
  const start = overrides.starting_date
    ? new Date(overrides.starting_date)
    : new Date(Date.now() + randomInt(1, 10) * 24 * 60 * 60 * 1000);
  const end = overrides.ending_date
    ? new Date(overrides.ending_date)
    : new Date(start.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000);

  return {
    ...product,
    starting_date: start.toISOString(),
    ending_date: end.toISOString(),
  };
};

export const createManyDummyProducts = (count: number, overrides: Partial<DummyProduct> = {}): DummyProduct[] =>
  Array.from({ length: Math.max(0, count) }, () => createDummyProduct(overrides));

export const createManyDummyEvents = (count: number, overrides: Partial<DummyEvent> = {}): DummyEvent[] =>
  Array.from({ length: Math.max(0, count) }, () => createDummyEvent(overrides));

export const dummyDataset = dataset;
