# Prisma Schema Relationships Guide

## Overview

This guide explains the relationship patterns used in your e-commerce Prisma schema.

## 1. One-to-One Relationships

### Pattern: User ↔ Avatar Image

```prisma
model images {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  userId      String? @unique @db.ObjectId  // Foreign key with @unique
  users       users? @relation(fields: [userId], references: [id])
}

model users {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  avatar      images?  // Single relation (not array)
}
```

**Key Points:**

- `@unique` on foreign key ensures one-to-one
- `?` makes it optional (nullable)
- Single relation field (not array)

### Pattern: Seller ↔ Shop (Bidirectional One-to-One)

```prisma
model sellers {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  shop        shops?  // Relation to shop
  shopId      String? @unique @db.ObjectId  // Foreign key
}

model shops {
  id              String @id @default(auto()) @map("_id") @db.ObjectId
  sellerId        String @unique @db.ObjectId  // Foreign key
  sellers         sellers @relation(fields: [sellerId], references: [id])
}
```

**Key Points:**

- Both sides have `@unique` on foreign keys
- Bidirectional relationship
- Each seller can have only one shop, each shop belongs to only one seller

## 2. One-to-Many Relationships

### Pattern: User → Reviews (One User, Many Reviews)

```prisma
model users {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  reviews     shopReview[] @relation("UserReviews")  // Array of reviews
}

model shopReview {
  id           String @id @default(auto()) @map("_id") @db.ObjectId
  userId       String @db.ObjectId  // Foreign key (no @unique)
  user         users @relation(fields: [userId], references: [id], name: "UserReviews")
}
```

**Key Points:**

- `shopReview[]` indicates array (many reviews)
- No `@unique` on foreign key (allows multiple)
- `name: "UserReviews"` custom relation name

### Pattern: Shop → Reviews (One Shop, Many Reviews)

```prisma
model shops {
  id              String @id @default(auto()) @map("_id") @db.ObjectId
  reviews         shopReview[]  // Array of reviews
}

model shopReview {
  id           String @id @default(auto()) @map("_id") @db.ObjectId
  shopsId      String? @db.ObjectId  // Foreign key (no @unique)
  shops        shops? @relation(fields: [shopsId], references: [id])
}
```

## 3. Many-to-Many Relationships

Your schema doesn't have explicit many-to-many relationships, but here's how you would define them:

```prisma
model users {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  following   String[]  // Array of user IDs (simple many-to-many)
  // OR for complex many-to-many:
  // following   UserFollow[] @relation("UserFollowing")
}

// For complex many-to-many with additional fields:
model UserFollow {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  followerId  String @db.ObjectId
  followingId String @db.ObjectId
  createdAt   DateTime @default(now())

  follower    users @relation("UserFollowing", fields: [followerId], references: [id])
  following   users @relation("UserFollowers", fields: [followingId], references: [id])
}
```

## 4. Relationship Syntax Explained

```prisma
relation_field ModelName? @relation(
  fields: [foreign_key],      // Field in this model that references other model
  references: [primary_key],  // Field in other model being referenced
  name: "custom_name"         // Optional: custom name for the relation
)
```

### Components:

- `relation_field`: Name of the relation field in your model
- `ModelName?`: The related model (optional if nullable)
- `fields: [foreign_key]`: The foreign key field in this model
- `references: [primary_key]`: The primary key field in the referenced model
- `name: "custom_name"`: Custom name (useful when multiple relations exist between same models)

## 5. MongoDB-Specific Considerations

### ObjectId Fields

```prisma
id          String @id @default(auto()) @map("_id") @db.ObjectId
userId      String @db.ObjectId  // MongoDB ObjectId type
```

### Array Fields

```prisma
following   String[]  // Array of strings
social_links Json[]   // Array of JSON objects
```

## 6. Best Practices

1. **Naming Conventions:**

   - Use singular model names: `user`, `shop`, `seller`
   - Use descriptive relation names: `avatar`, `reviews`, `shop`

2. **Foreign Key Naming:**

   - Use `modelNameId` pattern: `userId`, `shopId`, `sellerId`
   - Be consistent across your schema

3. **Optional vs Required:**

   - Use `?` for optional relations
   - Omit `?` for required relations

4. **Unique Constraints:**
   - Use `@unique` for one-to-one relationships
   - Omit `@unique` for one-to-many relationships

## 7. Common Patterns in Your Schema

### Polymorphic Relations (Images)

```prisma
model images {
  userId      String? @unique @db.ObjectId  // Can belong to user
  shopId      String? @unique @db.ObjectId  // OR can belong to shop
  users       users? @relation(fields: [userId], references: [id])
  shops       shops? @relation(fields: [shopId], references: [id])
}
```

This allows the `images` model to be related to either a `user` or a `shop`, but not both.

### Timestamps

```prisma
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt
```

Standard pattern for tracking creation and modification times.

## 8. Querying Relationships

Once you generate the Prisma client, you can query relationships like this:

```typescript
// Get user with their avatar
const userWithAvatar = await prisma.users.findUnique({
  where: { id: userId },
  include: { avatar: true },
});

// Get shop with all reviews
const shopWithReviews = await prisma.shops.findUnique({
  where: { id: shopId },
  include: {
    reviews: true,
    sellers: true,
  },
});

// Get user with their reviews
const userWithReviews = await prisma.users.findUnique({
  where: { id: userId },
  include: { reviews: true },
});
```

This guide covers all the relationship patterns used in your schema. The key is understanding when to use `@unique`, when to use arrays `[]`, and how to properly reference fields between models.
