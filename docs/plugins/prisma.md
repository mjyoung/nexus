# Prisma

[`issues`](https://github.com/graphql-nexus/nexus-future/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Aplugin%2Fprisma) – [features](https://github.com/graphql-nexus/nexus-future/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Aplugin%2Fprisma+label%3Atype%2Ffeat) ⬝ [bugs](https://github.com/graphql-nexus/nexus-future/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Aplugin%2Fprisma+label%3Atype%2Fbug)

Prisma is a next-generation developer-centric toolkit focused on making the data layer easy. This plugin gives you:

1. **Workflow Integration**  
   Nexus `build` and `dev` workflows are enhanced to run your Prisma generators.

1. **Runtime Integration**  
   Nexus schema component [GraphQL type builders](/guides/schema#graphql-type-builders) are augmented with `.model` and `.crud` methods. These make it easy for you to project your Prisma models and expose operations against them in your GraphQL API. Resolvers are dynamically created for you removing the need for traditional ORMs/query builders like TypeORM, Sequelize, or Knex. Out-of-box features include pagination, filtering, and ordering. And when you do need to drop down to custom resolvers a [`Prisma Client`](https://github.com/prisma/prisma-client-js) instance on `context` is ready to go.

1. **Testtime Integration**  
   todo

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```cli
npm install nexus-plugin-prisma
```

## Example

Given a [Prisma schema](https://github.com/prisma/prisma2/blob/master/docs/prisma-schema-file.md) like:

```prisma
// prisma/schema.prisma

generator prisma_client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  birthDate DateTime
}

model Post {
  id     String   @id @default(cuid())
  author User[]
}

```

You will be able to project these Prisma models onto your API and expose operations against them:

```ts
// api/graphql.ts

import { queryType, mutationType, objectType } from 'nexus-future'

export const Query = queryType({
  definition(t) {
    t.crud.user()
    t.crud.users({ ordering: true })
    t.crud.post()
    t.crud.posts({ filtering: true })
  },
})

export const Mutation = mutationType({
  definition(t) {
    t.crud.createOneUser()
    t.crud.createOnePost()
    t.crud.deleteOneUser()
    t.crud.deleteOnePost()
  },
})

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.birthDate()
    t.model.posts()
  },
})

export const Post = objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.author()
  },
})
```

<details>
<summary>See Resulting GraphQL Schema</summary>

```gql
scalar DateTime

input DateTimeFilter {
  equals: DateTime
  gt: DateTime
  gte: DateTime
  in: [DateTime!]
  lt: DateTime
  lte: DateTime
  not: DateTime
  notIn: [DateTime!]
}

type Mutation {
  createOnePost(data: PostCreateInput!): Post!
  createOneUser(data: UserCreateInput!): User!
  deleteOnePost(where: PostWhereUniqueInput!): Post
  deleteOneUser(where: UserWhereUniqueInput!): User
}

enum OrderByArg {
  asc
  desc
}

type Post {
  author(
    after: String
    before: String
    first: Int
    last: Int
    skip: Int
  ): [User!]!
  id: ID!
}

input PostCreateInput {
  author: UserCreateManyWithoutAuthorInput
  id: ID
}

input PostCreateManyWithoutPostsInput {
  connect: [PostWhereUniqueInput!]
  create: [PostCreateWithoutAuthorInput!]
}

input PostCreateWithoutAuthorInput {
  id: ID
}

input PostFilter {
  every: PostWhereInput
  none: PostWhereInput
  some: PostWhereInput
}

input PostWhereInput {
  AND: [PostWhereInput!]
  author: UserFilter
  id: StringFilter
  NOT: [PostWhereInput!]
  OR: [PostWhereInput!]
}

input PostWhereUniqueInput {
  id: ID
}

type Query {
  post(where: PostWhereUniqueInput!): Post
  posts(
    after: String
    before: String
    first: Int
    last: Int
    skip: Int
    where: PostWhereInput
  ): [Post!]!
  user(where: UserWhereUniqueInput!): User
  users(
    after: String
    before: String
    first: Int
    last: Int
    orderBy: UserOrderByInput
    skip: Int
  ): [User!]!
}

input StringFilter {
  contains: String
  endsWith: String
  equals: String
  gt: String
  gte: String
  in: [String!]
  lt: String
  lte: String
  not: String
  notIn: [String!]
  startsWith: String
}

type User {
  birthDate: DateTime!
  email: String!
  id: ID!
  posts(
    after: String
    before: String
    first: Int
    last: Int
    skip: Int
  ): [Post!]!
}

input UserCreateInput {
  birthDate: DateTime!
  email: String!
  id: ID
  posts: PostCreateManyWithoutPostsInput
}

input UserCreateManyWithoutAuthorInput {
  connect: [UserWhereUniqueInput!]
  create: [UserCreateWithoutPostsInput!]
}

input UserCreateWithoutPostsInput {
  birthDate: DateTime!
  email: String!
  id: ID
}

input UserFilter {
  every: UserWhereInput
  none: UserWhereInput
  some: UserWhereInput
}

input UserOrderByInput {
  birthDate: OrderByArg
  email: OrderByArg
  id: OrderByArg
}

input UserWhereInput {
  AND: [UserWhereInput!]
  birthDate: DateTimeFilter
  email: StringFilter
  id: StringFilter
  NOT: [UserWhereInput!]
  OR: [UserWhereInput!]
  posts: PostFilter
}

input UserWhereUniqueInput {
  email: String
  id: ID
}
```

</details>

## Recipes

### Projecting Prisma Model Fields {docsify-ignore}

Exposing one of your Prisma models in your GraphQL API

```ts
objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.content()
  },
})
```

### Simple Computed GraphQL Fields {docsify-ignore}

You can add computed fields to a GraphQL object using the standard GraphQL Nexus API.

```ts
objectType({
  name: "Post",
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.content()
    t.string("uppercaseTitle", {
      resolve({ title }, args, ctx) {
        return title.toUpperCase(),
      }
    })
  },
})
```

### Complex Computed GraphQL Fields {docsify-ignore}

If you need more complicated logic for your computed field (e.g. have access to some information from the database), you can use the `prisma` instance that's attached to the context and implement your resolver based on that.

```ts
objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.content()
    t.string('anotherComputedField', {
      async resolve(_parent, _args, ctx) {
        const databaseInfo = await ctx.prisma.someModel.someOperation(...)
        const result = doSomething(databaseInfo)
        return result
      }
    })
  }
})
```

### Project a Prisma Field to a Differently Named GraphQL Field {docsify-ignore}

```ts
objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.content({ alias: 'body' })
  },
})
```

### Publish Full-Featured Reads on a Prisma Model {docsify-ignore}

```ts
queryType({
  definition(t) {
    t.crud.post()
    t.crud.posts({ ordering: true, filtering: true })
  },
})
```

### Publish Writes on a Prisma Model {docsify-ignore}

```ts
mutationType({
  definition(t) {
    t.crud.createPost()
    t.crud.updatePost()
    t.crud.updateManyPost()
    t.crud.upsertPost()
    t.crud.deletePost()
    t.crud.deleteManyPost()
  },
})
```

### Publish Customized Reads on a Prisma Model {docsify-ignore}

```ts
queryType({
  definition(t) {
    t.crud.posts({
      filtering: { id: true, title: true },
      ordering: { title: true },
    })
  },
})
```

### Publish Autogenerated Mutations with Computed Input Values {docsify-ignore}

```ts
mutationType({
  definition(t) {
    /* 
    Assuming our prisma model for User has a createdByBrowser field,
    this removes it from the input type but ensures the value is
    inferred from context and passed to Prisma Client JS.
    */
    t.crud.createOneUser({
      computedInputs: {
        createdByBrowser: ({ args, ctx, info }) => ctx.session.browser,
      },
    })
  },
})
```

### Globally Remove a Field from Input Types and Infer its Value {docsify-ignore}

```ts
nexusPrismaPlugin({
  ...other config...
  /*
  Remove fields named "user" from all input types. When resolving
  a request whose data contains any of these types, the value is inferred
  from context and passed to Prisma Client JS, even if it's nested. This is great for
  creating data associated with one user's account.
  */
  computedInputs: {
    user: ({ args, ctx, info }) => ({
      connect: {
        id: ctx.userId,
      },
    }),
  },
})
```

```ts
mutationType({
  definition(t) {
    t.crud.createOnePost()
  },
})
```

Without computedInputs:

```gql
mutation createOnePost {
  createOnePost(
    data: {
      title: "Automatically generate clean APIs!"
      image: {
        url: "https://example.com/images/prancing-unicorns"
        user: { connect: { id: 1 } }
      }
      user: { connect: { id: 1 } }
    }
  )
}
```

With computedInputs:

```gql
mutation createOnePost {
  createOnePost(
    data: {
      title: "Automatically generate clean APIs!"
      image: { url: "https://example.com/images/prancing-unicorns" }
    }
  )
}
```

### Publish Model Writes Along Side Prisma Client JS-Resolved Fields {docsify-ignore}

```ts
mutationType({
  definition(t) {
    t.crud.createUser()
    t.crud.updateUser()
    t.crud.deleteUser()
    t.crud.deletePost()

    t.field('createDraft', {
      type: 'Post',
      args: {
        title: stringArg(),
        content: stringArg({ nullable: true }),
      },
      resolve: (parent, { title, content }, ctx) => {
        return ctx.prisma.posts.createPost({ title, content })
      },
    })

    t.field('publish', {
      type: 'Post',
      nullable: true,
      args: {
        id: idArg(),
      },
      resolve(parent, { id }, ctx) {
        return ctx.prisma.posts.updatePost({
          where: { id },
          data: { published: true },
        })
      },
    })
  },
})
```

## Prisma Features

### Generators

todo

### Prisma Client

todo

## Settings

todo

## Testtime Integration

todo

## Worktime Integration

### `dev`

todo

### `buid`

todo

### `db introspect`

todo

### `db migrate`

todo

### `db ui`

todo

### `db init`

todo

## Runtime Integration

### `t.model`

Only available within [`schema.objectType`](/api/modules/main/exports/schema?id=objecttype) definitions.

`t.model` contains configurable _field projectors_ that you use for projecting fields of your [Prisma models](https://github.com/prisma/prisma2/blob/master/docs/data-modeling.md#models) onto your [GraphQL Objects](https://graphql.github.io/graphql-spec/June2018/#sec-Objects). The precise behaviour of field projectors vary by the Prisma type being projected. Refer to the respective sub-sections for details.

#### Model-Object Mapping

`t.model` will either have field projectors for the Prisma model whose name matches that of the GraphQL `Object`, or if the GraphQL `Object` is of a name that does not match any of your Prisma models then `t.model` becomes a function allowing you to specify the mapping, after which the field projectors become available.

##### Example

<div class="TwoUp NexusVSDL">

```prisma
model User {
  id String @id @default(cuid())
}
```

```ts
objectType({
  name: 'User',
  definition(t) {
    t.model.id()
  },
})

objectType({
  name: 'Person',
  definition(t) {
    t.model('User').id()
  },
})
```

```gql
type User {
  id: ID!
}

type Person {
  id: ID!
}
```

</div>

#### Enum

_Auto-Projection_

When a Prisma enum field is projected, the corresponding enum type will be automatically projected too (added to the GraphQL schema).

_Member Customization_

You can customize the projected enum members by defining the enum yourself in Nexus. `nexus-prisma` will treat the name collision as an intent to override and so disable auto-projection.

_Option Notes_

Currently Prisma enums cannot be [aliased](#alias) ([issue](https://github.com/prisma-labs/nexus-prisma/issues/474)). They also cannot be [type mapped](#type) since enum types cannot be mapped yet ([issue](https://github.com/prisma-labs/nexus-prisma/issues/473)).

##### Options

n/a

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
type M {
  MEF: E # ! <-- if not ? or @default
}

# if not defined by user
enum E {
  EV
}
```

##### Example

<div class="TwoUp NexusVSDL">

```prisma
model User {
  role Role
  mood Mood
}

enum Mood {
  HAPPY
  SAD
  COMFUSED
}

enum Role {
  MEMBER
  EDITOR
  ADMIN
}
```

```ts
enumType({
  name: 'Role',
  members: ['MEMBER', 'EDITOR'],
})

objectType({
  name: 'User',
  definition(t) {
    t.model.role()
    t.model.mood()
  },
})
```

```gql
enum Mood {
  HAPPY
  SAD
  CONFUSED
}

enum Role {
  AUTHOR
  EDITOR
}

type User {
  role: Role
  mood: Mood
}
```

</div>

#### Scalar

_Scalar Mapping_

[Prisma scalars](https://github.com/prisma/prisma2/blob/master/docs/data-modeling.md#scalar-types) are mapped to [GraphQL scalars](https://graphql.org/learn/schema/#scalar-types) as follows:

```
Prisma       GraphQL
------       -------
Boolean   <>  Boolean
String    <>  String
Int       <>  Int
Float     <>  Float
cuid()    <>  ID
DateTime  <>  DateTime (custom scalar)
uuid()    <>  UUID (custom scalar)
```

_Auto-Projection_

When a Prisma scalar is encountered that does not map to the standard GraphQL scalar types, it will be automatically projected (custom scalar added to the GraphQL schema). Examples include `DateTime` and `UUID`.

_Option Notes_

It is not possible to use [`type`](#type) because there is currently no way for a Prisma scalar to map to a differently named GraphQL scalar.

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
type M {
  MSF: S # ! <-- if not ? or @default
}

# if not matching a standard GQL scalar
scalar S
```

##### Options

[`alias`](#alias)

##### Example

<div class="TwoUp NexusVSDL">

```gql
type Post {
  id: Int!
  email: String!
  scheduledPublish: DateTime
  rating: Float!
  active: Boolean!
}

scalar DateTime
```

```ts
objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.scheduledPublish()
    t.model.rating()
    t.model.active()
  },
})
```

```prisma

model User {
  id               String     @id @default(cuid())
  email            String
  scheduledPublish DateTime?
  rating           Float
  active           Boolean
}
```

</div>

#### Relation

Projecting relational fields only affects the current GraphQL object being defined. That is, the model that the field relates to is not auto-projected. This is a design choice intended to keep the `nexus-prisma` system predictable for you. If you forget to project a relation you will receive feedback at build/boot time letting you know.

##### Options

[`type`](#type) [`alias`](#alias)

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
type M {
  MRF: RM # ! <-- if not ?
}
```

##### Example

```gql
type User {
  latestPost: Post
}
```

```ts
objectType({
  name: 'User',
  definition(t) {
    t.model.latestPost()
  },
})
```

```prisma
model User {
  latestPost Post?
}

model Post {
  title String
  body String
}
```

#### List Enum

Like [enums](#enum). It is not possible to order ([issue](https://github.com/prisma-labs/nexus-prisma/issues/466)) paginate ([issue](https://github.com/prisma-labs/nexus-prisma/issues/468)) or filter ([issue](https://github.com/prisma-labs/nexus-prisma/issues/467)) enum lists.

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
type M {
  MLEF: [E!]!
}

# if not defined by user
enum E {
  EV
}
```

#### List Scalar

Like [scalars](#scalar). It is not possible to order ([issue](https://github.com/prisma-labs/nexus-prisma/issues/470)) paginate ([issue](https://github.com/prisma-labs/nexus-prisma/issues/471)) or filter ([issue](https://github.com/prisma-labs/nexus-prisma/issues/469)) scalar lists.

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
type M {
  MLSF: [S!]!
}
```

#### List Relation

Like [relations](#relation) but also supports batch related options.

##### Options

[`type`](#type) [`alias`](#alias) [`filtering`](#filtering) [`pagination`](#pagination) [`ordering`](#ordering)

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
type M {
  MLRF: [RM!]!
}
```

### `t.crud`

Only available within GraphQL `Query` and `Mutation` definitions.

`t.crud` contains configurable _operation publishers_ that you use for exposing create, read, update, and delete mutations against your projected Prisma models.

There are 8 kinds of operations (reflecting a subset of [Prisma Client JS](https://github.com/prisma/prisma-client-js)'s capabilities). An _operation publisher_ is the combination of some operation kind and a particular Prisma model. Thus the number of operation publishers on `t.crud` is `Prisma model count × operation kind count`. So for example if you defined 20 Prisma models then you would see 160 operation publishers on `t.crud`.

##### Example

```ts
queryType({
  definition(t) {
    t.crud.user()
    t.crud.users()
  },
})

mutationType({
  definition(t) {
    t.crud.createOneUser()
    t.crud.updateOneUser()
    t.crud.upsertOneUser()
    t.crud.deleteOneUser()

    t.crud.updateManyUser()
    t.crud.deleteManyUser()
  },
})
```

```prisma
model User {
  ...
}
```

#### Create

```
t.crud.createOne<M>
```

Allow clients to create one record at at time of the respective Prisma model.

Relation fields may be connected with an existing record or a sub-create may be inlined (generally referred to as _nested mutations_). If the relation is a `List` then multiple connections or sub-creates are permitted.

Inlined creates are very similar to top-level ones but have the important difference that the sub-create has excluded the field where supplying its relation to the type of parent `Object` being created would _normally be_. This is because a sub-create forces its record to relate to the parent one.

**Underlying Prisma Client JS Function**

[`create`](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#create)

##### Options

[`type`](#type) [`alias`](#alias)

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
mutation {
  createOne_M(data: M_CreateInput): M!
}

input M_CreateInput {
  MSF: S                       # ! <-- if not ? or @default
  MRF: RM_CreateManyWithout_M  # ! <-- if not ? or @default
}

input RM_CreateManyWithout_M {
  connect: [RM_WhereUniqueInput!]
  create: [RM_CreateWithout_M_Input!]
}

input RM_WhereUniqueInput {
  MRF@unique: S
}

input RM_CreateWithout_M_Input = RM_CreateInput - RMRF: M
```

##### Example

```gql
mutation simple {
  createOneUser(data: { email: "newton@prisma.io" }) {
    id
  }
}

mutation connectRelation {
  createOneUser(
    data: { email: "newton@prisma.io", posts: { connect: [1643] } }
  ) {
    id
  }
}

mutation createRelation {
  createOneUser(
    data: {
      email: "newton@prisma.io"
      posts: { create: [{ title: "On How The Prism Came To Be", body: "..." }] }
    }
  ) {
    id
    posts {
      title
    }
  }
}
```

```gql
type Mutation {
  createOneUser(data: UserCreateInput!): User!
}

type Post {
  author: User!
  id: Int!
  title: String!
  body: String!
}

input PostCreateManyWithoutPostsInput {
  connect: [PostWhereUniqueInput!]
  create: [PostCreateWithoutAuthorInput!]
}

input PostCreateWithoutAuthorInput {
  title: String!
  body: String!
}

input PostWhereUniqueInput {
  id: Int
  title: String
}

type User {
  email: String!
  id: Int!
  posts: [Post!]!
}

input UserCreateInput {
  email: String!
  posts: PostCreateManyWithoutPostsInput
}
```

```ts
mutationType({
  definition(t) {
    t.crud.createOneUser()
  },
})

objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.posts()
  },
})

objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.body()
    t.model.author()
  },
})
```

```prisma
model User {
  id    Int    @id @unique
  email String @unique
  posts Post[]
}

model Post {
  id     Int    @id
  title  String @unique
  body   String
  author User
}
```

#### Read

```
t.crud.<M>
```

Allow clients to find one particular record of the respective Prisma model. They may search by any Prisma model field that has been marked with `@unique` attribute.

The ability for list fields to be [filtered](#filtering), [ordered](#ordering), or [paginated](#pagination) depends upon if those features have been enabled for those GraphQL objects via [`t.model.<ListRelation>`](#list-relation).

**Underlying Prisma Client JS Function**

[`findOne`](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#findone)

##### Options

[`type`](#type) [`alias`](#alias)

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
mutation {
  M(where: M_WhereUniqueInput): M!
}

input M_WhereUniqueInput {
  MF: S # if @unique
}
```

##### Example

```gql
query simple {
  user(where: { email: "newton@prisma.io" }) {
    id
  }
}
```

```gql
type Query {
  user(where: UserWhereUniqueInput!): User
}

type User {
  id: Int!
  email: String!
}

input UserWhereUniqueInput {
  id: Int
  email: String
}
```

```ts
queryType({
  definition(t) {
    t.user()
  },
})
```

```prisma
model User {
  id    Int    @id @unique
  email String @unique
}
```

#### Update

```
t.crud.updateOne<M>
```

Allow clients to update one particular record at a time of the respective Prisma model.

**Underlying Prisma Client JS Function**

[`update`](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#update)

##### Options

[`type`](#type) [`alias`](#alias)

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
mutation {
  updateOne_M(data: M_UpdateInput!, where: M_WhereUniqueInput!): M
}

input M_WhereUniqueInput {
  MF: S # if @unique
}

input M_UpdateInput {
  MSF: S
  MRF: RM_UpdateManyWithout_M_Input
}

input RM_UpdateManyWithout_M_Input {
  connect: [RM_WhereUniqueInput!]
  create: [RM_CreateWithout_M_Input!]
  delete: [RM_WhereUniqueInput!]
  deleteMany: [RM_ScalarWhereInput!] # see batch filtering reference
  disconnect: [RM_WhereUniqueInput!]
  set: [RM_WhereUniqueInput!]
  update: [RM_UpdateWithWhereUniqueWithout_M_Input!]
  updateMany: [RM_UpdateManyWithWhereNestedInput!]
  upsert: [RM_UpsertWithWhereUniqueWithout_M_Input!]
}

input RM_WhereUniqueInput {} # recurse pattern like M_WhereUniqueInput

input RM_CreateWithout_M_Input {} # RM_CreateInput - RMRF: M

input RM_UpdateWithWhereUniqueWithout_M_Input {
  data: RM_UpdateWithout_M_DataInput!
  where: RM_WhereUniqueInput!
}
input RM_UpdateWithout_M_DataInput {
  RMSF: S
}

input RM_UpdateManyWithWhereNestedInput {
  data: RM_UpdateManyDataInput!
  where: RM_ScalarWhereInput! # see batch filering reference
}

input RM_UpsertWithWhereUniqueWithout_M_Input {
  create: RM_CreateWithout_M_Input!
  update: RM_UpdateWithout_M_DataInput!
  where: RM_WhereUniqueInput!
}
```

For `S_ScalarWhereInput` see [batch filtering](#batch-filtering) contributions.

##### Example

```gql
mutation simple {
  updateOneUser(data: { email: "locke@prisma.io" }, where: { id: 1643 }) {
    id
    email
  }
}
```

```gql
input IntFilter {
  equals: Int
  gt: Int
  gte: Int
  in: [Int!]
  lt: Int
  lte: Int
  not: Int
  notIn: [Int!]
}

type Mutation {
  updateOneUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
}

type Post {
  author: User!
  id: Int!
  title: String!
}

input PostCreateWithoutAuthorInput {
  body: String!
  title: String!
}

input PostScalarWhereInput {
  AND: [PostScalarWhereInput!]
  body: StringFilter
  id: IntFilter
  NOT: [PostScalarWhereInput!]
  OR: [PostScalarWhereInput!]
  title: StringFilter
}

input PostUpdateManyDataInput {
  body: String
  id: Int
  title: String
}

input PostUpdateManyWithoutAuthorInput {
  connect: [PostWhereUniqueInput!]
  create: [PostCreateWithoutAuthorInput!]
  delete: [PostWhereUniqueInput!]
  deleteMany: [PostScalarWhereInput!]
  disconnect: [PostWhereUniqueInput!]
  set: [PostWhereUniqueInput!]
  update: [PostUpdateWithWhereUniqueWithoutAuthorInput!]
  updateMany: [PostUpdateManyWithWhereNestedInput!]
  upsert: [PostUpsertWithWhereUniqueWithoutAuthorInput!]
}

input PostUpdateManyWithWhereNestedInput {
  data: PostUpdateManyDataInput!
  where: PostScalarWhereInput!
}

input PostUpdateWithoutAuthorDataInput {
  body: String
  id: Int
  title: String
}

input PostUpdateWithWhereUniqueWithoutAuthorInput {
  data: PostUpdateWithoutAuthorDataInput!
  where: PostWhereUniqueInput!
}

input PostUpsertWithWhereUniqueWithoutAuthorInput {
  create: PostCreateWithoutAuthorInput!
  update: PostUpdateWithoutAuthorDataInput!
  where: PostWhereUniqueInput!
}

input PostWhereUniqueInput {
  id: Int
  title: String
}

type Query {
  ok: Boolean!
}

input StringFilter {
  contains: String
  endsWith: String
  equals: String
  gt: String
  gte: String
  in: [String!]
  lt: String
  lte: String
  not: String
  notIn: [String!]
  startsWith: String
}

type User {
  email: String!
  id: Int!
  posts: [Post!]!
}

input UserUpdateInput {
  email: String
  id: Int
  posts: PostUpdateManyWithoutAuthorInput
}

input UserWhereUniqueInput {
  email: String
  id: Int
}
```

```ts
mutationType({
  definition(t) {
    t.crud.updateOneUser()
  },
})

objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.posts()
  },
})

objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.author()
  },
})
```

```prisma
model User {
  id    Int    @id @unique
  email String @unique
  posts Post[]
}

model Post {
  id     Int    @id
  title  String @unique
  body   String
  author User
}
```

#### Upsert

```
t.crud.upsertOne<M>
```

Allow clients to update or create (aka. insert) one particular record at a time of the respective Prisma model. This operation is a combination of [create](#create) and [update](#update). The generated GraphQL mutation matches `data` and `where` args to those of update, and `create` to that of `data` arg in create. Unlike update, upsert guarantees a return value.

**Underlying Prisma Client JS Function**

[`upsert`](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#upsert)

##### Options

[`type`](#type) [`alias`](#alias)

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
mutation {
  upsertOne_M(
    create: M_CreateInput!      # like createOne(data ...)
    data: M_UpdateInput!        # like updateOne(data ...)
    where: M_WhereUniqueInput!  # like updateOne(where ...)
  ): M!
}
```

For `M_UpdateInput` and `M_WhereUniqueInput` see [update](#update) contributions.  
For `M_CreateInput` see [create](#create) contributions.

##### Example

Refer to [update](#update) and [create](#create).

#### Delete

```
t.crud.deleteOne<M>
```

Allow clients to delete one particular record at a time of the respective Prisma model.

**Underlying Prisma Client JS Function**

[`delete`](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#delete)

##### Options

[`type`](#type) [`alias`](#alias)

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
mutation {
  deleteOne_M(where: M_WhereUniqueInput): M
}

input M_WhereUniqueInput {
  MF@unique: S
}
```

##### Example

```gql
mutation simple {
  deleteOneUser(where: { id: 1643 }) {
    id
    email
    posts {
      id
      title
    }
  }
}
```

```gql
type Mutation {
  deleteOneUser(where: UserWhereUniqueInput!): User
}

type Post {
  author: User!
  id: Int!
  title: String!
}

type User {
  email: String!
  id: Int!
  posts: [Post!]!
}

input UserWhereUniqueInput {
  email: String
  id: Int
}
```

```ts
mutationType({
  definition(t) {
    t.crud.deleteOneUser()
  },
})

objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.posts()
  },
})

objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.author()
  },
})
```

```prisma
model User {
  id    Int    @id @unique
  email String @unique
  posts Post[]
}

model Post {
  id     Int    @id
  title  String @unique
  body   String
  author User
}
```

#### Batch Read

```
t.crud.<M Pluralized>
```

Allow clients to fetch multiple records at once of the respective Prisma model.

**Underlying Prisma Client JS Function**

[`findMany`](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#findMany)

##### Options

[`type`](#type) [`alias`](#alias) [`filtering`](#filtering) [`pagiantion`](#pagination) [`ordering`](#ordering) [`computedInputs`](#computedInputs-local)([local](#computedInputs-local) and [global](#computedInputs-global))

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
type Query {
  M_s: [M!]!
}
```

##### Example

```gql
type Query {
  users: [User!]!
}

type Post {
  author: User!
  id: Int!
  title: String!
}

type User {
  email: String!
  id: ID!
  posts: [Post!]!
}
```

```ts
queryType({
  definition(t) {
    t.users()
  },
})
```

```prisma
model User {
  id    Int    @id @unique
  email String @unique
  posts Post[]
}

model Post {
  id     Int    @id
  title  String @unique
  body   String
  author User
}
```

#### Batch Update

```
t.crud.updateMany<M>
```

Allow clients to update multiple records of the respective Prisma model at once. Unlike [`update`](#update) nested relation-updating is not supported here. Clients get back a `BatchPayload` object letting them know the number of affected records, but not access to the fields of affected records.

**Underlying Prisma Client JS Function**

[`updateMany`](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#updateMany)

##### Options

[`type`](#type) [`alias`](#alias)

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
mutation {
  updateMany_M(where: M_WhereInput, data:  M_UpdateManyMutationInput): BatchPayload!
}

input M_UpdateManyMutationInput {
  MSF: S
  MEF: E
  # not possible to batch update relations
}

type BatchPayload {
  count: Int!
}
```

For `M_WhereInput` see [batch filtering contributions](#batch-filtering).

##### Example

```gql
mutation updateManyUser(where: {...}, data: { status: ACTIVE }) {
  count
}
```

See [filtering option](#filtering) example. Differences are: operation semantics (update things); return type; `data` arg.

#### Batch Delete

```
t.crud.deleteMany<M>
```

Allow clients to delete multiple records of the respective Prisma model at once. Clients get back a `BatchPayload` object letting them know the number of affected records, but not access to the fields of affected records.

**Underlying Prisma Client JS Function**

[`deleteMany`](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#deleteMany)

##### Options

[`type`](#type) [`alias`](#alias)

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
mutation {
  deleteMany_M(where: M_WhereInput): BatchPayload!
}

type BatchPayload {
  count: Int!
}
```

For `M_WhereInput` see [filtering contribution](#batch-filtering).

##### Example

```gql
mutation {
  deleteManyUser(where: {...}) {
    count
  }
}
```

See [filtering option](#filtering) example. Differences are: operation semantics (delete things); return type.

### Options

#### `alias`

```
undefined | String
```

**Applies To**

`t.crud.<*>` `t.model.<* - enum, list enum>`

**About**

- `undefined` (default) By default Prisma model fields project onto GraphQL object fields of the same name.
- `string` Change which GraphQL object field the Prisma model field projects onto.

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

n/a

##### Example

```gql
type Post {
  content: String!
}
```

```ts
objectType({
  name: 'Post',
  definition(t) {
    t.model.body({ alias: 'content' })
  },
})
```

```prisma
model Post  {
  body String
}
```

#### `type`

```
undefined | String
```

**Applies To**

`t.crud.<*>` [`t.model.<Relation>`](#relation-field) [`t.model.<ListRelation>`](#list-field)

**About**

- `undefined` (default) Point Prisma field to a GraphQL object whose name matches that of the Prisma field model type.

- `string` Point Prisma field to the given GraphQL object. This option can become necessary when you've have done [model-object mapping](#model-object-mapping) and other Prisma models in your schema have relations to the name-mapped Prisma model. We are interested in developing further the model-object mapping API to automate this better ([issue](https://github.com/prisma-labs/nexus-prisma/issues/461)).

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

n/a

##### Example

```gql
type Article {
  title: String!
}

type User {
  articles: [Article]
}
```

```ts
objectType({
  name: 'Article',
  definition(t) {
    t.model('Post').id()
  },
})

objectType({
  name: 'User',
  definition(t) {
    t.model.posts({ alias: 'articles', type: 'Article' })
  },
})
```

```prisma
model User {
  id    String @id @default(cuid())
  posts Post[]
}

model Post {
  id String @id @default(cuid())
}
```

#### `ordering`

```
undefined | true | false | ModelWhitelist
```

**Applies To**

[`t.crud.<BatchRead>`](#batch-read) [`t.model.<ListRelation>`](#list-relation)

**About**

Allow clients to order the records in a list field. Records can be ordered by their projected scalar fields in ascending or descending order. Ordering by fields on relations is not currently possible ([issue](https://github.com/prisma/prisma-client-js/issues/249)).

- `undefined` (default) Like `false`
- `false` Disable ordering
- `true` Enable ordering by all scalar fields
- `ModelWhitelist` (`Record<string, true>`) Enable ordering by just Model scalar fields appearing in the given whitelist.

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

```gql
# t.crud.<BatchRead>
M(orderBy: M_OrderByInput)

# t.model.<ListRelation>
type M {
  MF(orderBy: M_OrderByInput)
}

input M_OrderByInput {
  MSF: OrderByArg
  # It is not possible to order by relations
}

enum OrderByArg {
  asc
  desc
}
```

##### Example

```gql
query entrypointOrdering {
  users(orderBy: { name: asc }) {
    id
    name
  }
}

query relationOrdering {
  user(where: { id: 1643 }) {
    posts(orderBy: { title: dsc }) {
      title
      body
    }
  }
}
```

```gql
type Query {
  user(where: UserWhereUniqueInput!): User
  users(orderBy: UserOrderByInput): [User!]!
}

type Post {
  body: String!
  id: Int!
  title: String!
}

type User {
  id: Int!
  name: String!
  posts(orderBy: UserPostsOrderByInput): [Post!]!
}

input UserOrderByInput {
  id: OrderByArg
  name: OrderByArg
}

input UserPostsOrderByInput {
  title: OrderByArg
}

input UserWhereUniqueInput {
  id: Int
}

enum OrderByArg {
  asc
  desc
}
```

```ts
objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.body()
  },
})

objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.posts({ ordering: { title: true } })
  },
})

queryType({
  definition(t) {
    t.crud.user()
    t.crud.users({ ordering: true })
  },
})
```

```prisma
model User {
  id    Int @id
  name  String
  posts Post[]
}

model Post {
  id    Int @id
  title String
  body  String
}
```

#### `pagination`

```
undefined | true | false
```

**Applies To**

[`t.crud.<BatchRead>`](#batch-read) [`t.model.<ListRelation>`](#list-relation)

**About**

- `undefined` (default) Like `true`
- `true` Enable pagination
- `false` Disable pagination

##### GraphQL Schema Contributions

```gql
# t.crud.<BatchRead>
Ms(
  # The starting object for the list (typically ID or other unique value).
  after: M_WhereUniquInout

  # The last object for the list (typically ID or other unique value)
  before: M_WhereUniquInout

  # How many elements, forwards from `after` otherwise head
  first: Int

  # How many elements, backwards from `before` otherwise tail
  last: Int

  # The offset
  # If `first` used, then forwards from `after` (otherwise head)
  # If `last` used, then backwards from `before` (otherwise tail)
  skip: Int
)

# t.model.<ListRelation>
type M {
  MRF(after: M_WhereUniquInout, before: M_WhereUniquInout, first: Int, last: Int, skip: Int)
}

input M_WhereUniquInout {
  MSF@unique: S
}
```

##### Example

```gql
query batchReadAfter {
  users(after: { id: 1234 }, first: 50) {
    id
    name
  }
}

# or

query batchReadSkip {
  users(skip: 50, first: 50) {
    id
    name
  }
}

# or

query batchReadRelation {
  user(where: { id: 1643 }) {
    posts(last: 10) {
      title
      body
    }
  }
}
```

```gql
...
```

```ts
objectType({
  name: 'User',
  definition(t) {
    t.model.posts({ pagination: true })
  },
})

queryType({
  definition(t) {
    t.crud.users({ pagination: true })
  },
})
```

```prisma
model User {
  id    Int @id
  posts Post[]
  // ...
}

model Post {
  id    Int @id
  // ...
}
```

#### `filtering`

```
undefined | true | false | ModelWhitelist
```

**Applies To**

[`t.crud.<BatchRead>`](#batch-read) [`t.model.<ListRelation>`](#list-relation)

**About**

- `undefined` (default) Like `false`
- `true` Enable filtering for all scalar fields
- `false` Disable filtering
- `ModelWhitelist` (`Record<string, true>`) Enable ordering by just Model scalar fields appearing in the given whitelist.

##### GraphQL Schema Contributions [`?`](#graphql-schema-contributions 'How to read this')

See [batch filtering contributions](#batch-filtering)

##### Example

```gql
query batchReadFilter {
  users(where: {
    OR: [
      { age: { gt: 30 } },
      posts: {
        every: {
          rating: {
            lte: "0.5"
          }
        },
        none: {
          comments: {
            none: {
              author: {
                status: BANNED
              }
            }
          }
        }
      }
    ]
  }) {
    id
    name
  }
}

query batchReadRelationFilter {
  users {
    posts(where: { rating: { gte: 0.9 }}) {
      comments {
        content
      }
    }
  }
}
```

```gql
type Comment {
  author: User!
  post: Post!
}

input CommentFilter {
  every: CommentWhereInput
  none: CommentWhereInput
  some: CommentWhereInput
}

input CommentWhereInput {
  AND: [CommentWhereInput!]
  author: UserWhereInput
  content: StringFilter
  id: StringFilter
  NOT: [CommentWhereInput!]
  OR: [CommentWhereInput!]
  post: PostWhereInput
}

input FloatFilter {
  equals: Float
  gt: Float
  gte: Float
  in: [Float!]
  lt: Float
  lte: Float
  not: Float
  notIn: [Float!]
}

input IntFilter {
  equals: Int
  gt: Int
  gte: Int
  in: [Int!]
  lt: Int
  lte: Int
  not: Int
  notIn: [Int!]
}

type Post {
  author: User!
  comments(
    after: String
    before: String
    first: Int
    last: Int
    skip: Int
  ): [Comment!]!
  rating: Float!
}

input PostFilter {
  every: PostWhereInput
  none: PostWhereInput
  some: PostWhereInput
}

input PostWhereInput {
  AND: [PostWhereInput!]
  author: UserWhereInput
  comments: CommentFilter
  id: StringFilter
  NOT: [PostWhereInput!]
  OR: [PostWhereInput!]
  rating: FloatFilter
}

type Query {
  user(where: UserWhereUniqueInput!): User
  users(
    after: String
    before: String
    first: Int
    last: Int
    skip: Int
    where: UserWhereInput
  ): [User!]!
}

input StringFilter {
  contains: String
  endsWith: String
  equals: String
  gt: String
  gte: String
  in: [String!]
  lt: String
  lte: String
  not: String
  notIn: [String!]
  startsWith: String
}

type User {
  age: Int!
}

enum UserStatus {
  ACTIVE
  BANNED
}

input UserWhereInput {
  age: IntFilter
  AND: [UserWhereInput!]
  comments: CommentFilter
  id: StringFilter
  NOT: [UserWhereInput!]
  OR: [UserWhereInput!]
  posts: PostFilter
  status: UserStatus
}

input UserWhereUniqueInput {
  id: ID
}
```

```ts
objectType({
  name: 'User',
  definition(t) {
    t.model.age()
  },
})

objectType({
  name: 'Post',
  definition(t) {
    t.model.author()
    t.model.rating()
    t.model.comments()
  },
})

objectType({
  name: 'Comment',
  definition(t) {
    t.model.author()
    t.model.post()
  },
})

queryType({
  definition(t) {
    t.crud.users({ filtering: true })
    t.crud.user()
  },
})
```

```prisma
model User {
  id     String     @id @unique @default(cuid())
  posts  Post[]
  age    Int
  status UserStatus
}

model Post {
  id       String    @id @unique @default(cuid())
  author   User
  comments Comment[]
  rating   Float
}

model Comment {
  id      String     @id @unique @default(cuid())
  author  User
  post    Post
  content String
}

enum UserStatus {
  BANNED
  ACTIVE
}
```

#### `computedInputs` (local)

```
Record<string, ({ args, ctx, info }: MutationResolverParams) => unknown>
```

Note: This is an abbreviated version of the ComputedInputs type. The most important thing to undertand each of the object's values will be a function that takes an object with "args", "ctx", and "info" keys that represent the runtime values of the corresponding parameters that are passed to your resolver. For the full type, see [ComputedInputs Type Details](#computedinputs-type-details).

**Applies To**

[`t.crud.<mutations>`](#t.crud)

**About**

Allow clients to omit fields from one mutation's corresponding input type and infer the value of those fields from the resolver's params (args, context, info) at runtime when determining what to pass to Prisma Client JS.

- `ComputedInputs` (`Record<string, ({ args, ctx, info }: MutationResolverParams) => unknown>`) [(full type here)](#computedinputs-type-details).

  Keys in the ComputedInputs object will be omitted from the mutation's corresponding input type. When resolving the mutation at runtime, each omitted key will be passed to Prisma Client JS based on the return value of that key's corresponding function in the ComputedInputs object when passed that resolver's parameters at runtime.

##### GraphQL Schema Contributions

The mutation's input type fields with a name that is in the ComputedInputs object are omitted from the GraphQL schema. This modifies one existing input type but does not add new types or remove existing types.

##### Example

```prisma
model User {
  id  Int @id
  name String
  createdWithBrowser String
}
```

```ts
queryType({
  definition(t: any) {
    t.crud.user()
  },
})
mutationType({
  definition(t: any) {
    t.crud.createOneUser({
      computedInputs: {
        createdWithBrowser: ({ args, ctx, info }) => ctx.browser,
      },
    })
  },
})
objectType({
  name: 'User',
  definition: (t: any) => {
    t.model.id()
    t.model.name()
    t.model.createdWithBrowser()
  },
})
```

```gql
type Mutation {
  createOneUser(data: UserCreateInput!): User!
}

type Query {
  user(where: UserWhereUniqueInput!): User
}

type User {
  id: Int!
  name: String!
  createdWithBrowser: String!
}

input UserCreateInput {
  name: String!
}

input UserWhereUniqueInput {
  id: Int
}
```

```gql
mutation createOneUser {
  createOneUser({data: {name: "Benedict"}}) {
    id
    name
    createdWithBrowser
  }
}
```

#### `computedInputs` (global)

```
Record<string, ({ args, ctx, info}: MutationResolverParams) => any>
```

Note: This is an abbreviated version of the ComputedInputs type. The most important thing to undertand each of the object's values will be a function that takes an object with "args", "ctx", and "info" keys that represent the runtime values of the corresponding parameters that are passed to your resolver. For the full type, see [ComputedInputs Type Details](#computedinputs-type-details).

**Applies To**

[`nexusPrismaPlugin()`](#Example)

**About**

Allow clients to omit fields with a given name across all of their GraphQL schema's inputs and infer the value of those fields from context when determining what to pass to Prisma Client JS

- `ComputedInputs` (`Record<string, ({ args, ctx, info }: MutationResolverParams) => any>`) [(full type here)](#computedinputs-type-details).

  Keys in the ComputedInputs object will be omitted from all input types. When resolving any mutation at runtime, that mutation's input type will be recursively searched for the omitted keys. Any time one of those keys would have appeared anywhere in the mutation's input type, a value will be passed to Prisma Client JS based on the return value of that key's corresponding function in the ComputedInputs object when passed the resolver's parameters at runtime.

##### GraphQL Schema Contributions

All input type fields with a name that is in the ComputedInputs object are omitted from the GraphQL schema. This modifies existing input types but does not add new types or remove existing types.

##### Example

```prisma
model User {
  id  Int @id
  name String
  nested Nested[]
  createdWithBrowser String
}

model Nested {
  id Int @id
  name String
  createdWithBrowser String
}
```

```ts
queryType({
  definition(t: any) {
    t.crud.user()
  },
})
mutationType({
  definition(t: any) {
    t.crud.createOneUser()
    t.crud.createOneNested()
  },
})
objectType({
  name: 'User',
  definition: (t: any) => {
    t.model.id()
    t.model.name()
    t.model.nested()
    t.model.createdWithBrowser()
  },
})
objectType({
  name: 'Nested',
  definition: (t: any) => {
    t.model.id()
    t.model.createdWithBrowser()
    t.model.name()
  },
})
```

```ts
nexusPrismaPlugin({
  /*
  Remove fields named "createdWithBrowser" from all mutation input types. When resolving
  a request whose data contains any of these types, the value is inferred from the resvoler's 
  params based on the function we defined below and passed to Prisma Client JS, even if it's nested.
  This example assumes a Prisma Client JS context containing a "browser" key that maps to a string
  representing the browser from which the request was made.
  */
  computedInputs: {
    createdWithBrowser: ({ args, ctx, info }) => ctx.browser,
  },
})
```

```gql
type Mutation {
  createOneUser(data: UserCreateInput!): User!
  createOneNested(data: NestedCreateInput!): Nested!
}

type Nested {
  id: Int!
  createdWithBrowser: String!
  name: String!
}

input NestedCreateInput {
  name: String!
  user: UserCreateOneWithoutUserInput
}

input NestedCreateManyWithoutNestedInput {
  create: [NestedCreateWithoutUserInput!]
  connect: [NestedWhereUniqueInput!]
}

input NestedCreateWithoutUserInput {
  name: String!
}

input NestedWhereUniqueInput {
  id: Int
}

type Query {
  user(where: UserWhereUniqueInput!): User
}

type User {
  id: Int!
  name: String!
  nested(skip: Int, after: Int, before: Int, first: Int, last: Int): [Nested!]!
  createdWithBrowser: String!
}

input UserCreateInput {
  name: String!
  nested: NestedCreateManyWithoutNestedInput
}

input UserCreateOneWithoutUserInput {
  create: UserCreateWithoutNestedInput
  connect: UserWhereUniqueInput
}

input UserCreateWithoutNestedInput {
  name: String!
}

input UserWhereUniqueInput {
  id: Int
}
```

```gql
mutation createOneUser {
  createOneUser({data: {name: "Benedict", nested: {name: "Moony"}}) {
    id
    name
    createdWithBrowser
    nested {
      id
      name
      createdWithBrowser
    }
  }
}

mutation createOneNested {
  createOneNested({data: {name: "Moony", user: {connect: {where: {id: 1}}}}}) {
    id
    name
    createdWithBrowser
  }
}
```

If `{user: {connect: {where: {id: 1}}}}` looks familiar, global computedInputs can also be used to determine the user making a request and automatically populate mutations affecting a single user accordingly. For example, assuming Prisma Client JS' context includes a "userId" key, adding a user key to global computedInputs can simplify the "createOneNested" mutation from the previous example:

```ts
nexusPrismaPlugin({
  ...other config...
  computedInputs: {
    createdWithBrowser: ({ctx}) => ctx.browser,
    user: ({ctx}) => ({ connect: { where: { id: ctx.userId } } }),
  },
})
```

```gql
mutation createOneNested {
  createOneNested({data: {name: "Moony"}}) {
    id
    name
    createdWithBrowser
  }
}
```

#### `ComputedInputs` Type Details

```ts
/**
 *  Represents arguments required by Prisma Client JS that will
 *  be derived from a request's input (root, args, and context)
 *  and omitted from the GraphQL API. The object itself maps the
 *  names of these args to a function that takes an object representing
 *  the request's input and returns the value to pass to the Prisma Client JS
 *  arg of the same name.
 */
export type LocalComputedInputs<MethodName extends MutationMethodName> = Record<
  string,
  (params: LocalMutationResolverParams<MethodName>) => unknown
>

export type GlobalComputedInputs = Record<
  string,
  (params: GlobalMutationResolverParams) => unknown
>

type BaseMutationResolverParams = {
  info: GraphQLResolveInfo
  ctx: Context
}

export type GlobalMutationResolverParams = BaseMutationResolverParams & {
  args: Record<string, any> & { data: unknown }
}

export type LocalMutationResolverParams<
  MethodName extends MutationMethodName
> = BaseMutationResolverParams & {
  args: core.GetGen<'argTypes'>['Mutation'][MethodName]
}

export type MutationMethodName = keyof core.GetGen<'argTypes'>['Mutation']

export type Context = core.GetGen<'context'>
```

### GraphQL Schema Contributions

#### How to Read

```
M = model   F = field   L = list   S = scalar   R = relation   E = enum   V = value
```

#### Batch Filtering

**Sources**

```gql
query {
  # When filtering option is enabled
  Ms(where: M_WhereInput, ...): [M!]!
}

mutation {
  updateMany_M(where: M_WhereInput, ...) BatchPayload!
  deleteMany_M(where: M_WhereInput): BatchPayload!
}

type M {
  # When filtering option is enabled
  MRF: RM(where: RM_WhereInput): [RM!]!
}

# Nested InputObjects from t.crud.update<M>

# Nested InputObjects from t.crud.upsert<M>
```

**Where**

```gql
input M_WhereInput {
  AND: [M_WhereInput!]
  NOT: [M_WhereInput!]
  OR: [M_WhereInput!]
  MSF: S_Filter
  MRF: RM_Filter
}

input RM_Filter {
  every: RM_WhereInput # recurse -> M_WhereInput
  none: RM_WhereInput # recurse -> M_WhereInput
  some: RM_WhereInput # recurse -> M_WhereInput
}

# This type shows up in the context of t.crud.update<M> and t.crud.upsert<M>

input RM_ScalarWhereInput {
  AND: [RM_ScalarWhereInput!]
  NOT: [RM_ScalarWhereInput!]
  OR: [RM_ScalarWhereInput!]
  RMSF: S_Filter
}
```

**Scalar Filters**

`ID` scalars use `StringFilter` ([issue](https://github.com/prisma-labs/nexus-prisma/issues/485)). We are considering a tailored `DateTime` filter ([issue](https://github.com/prisma-labs/nexus-prisma/issues/484)).

```gql
input BooleanFilter {
  equals: Boolean
  not: Boolean
}

input IntFilter {
  equals: S
  gt: S
  gte: S
  in: [S!]
  lt: S
  lte: S
  not: S
  notIn: [S!]
}

input FloatFilter {} # like IntFilter

input DateTimeFilter {} # like IntFilter

input StringFilter {
  contains: String
  endsWith: String
  equals: String
  gt: String
  gte: String
  in: [String!]
  lt: String
  lte: String
  not: String
  notIn: [String!]
  startsWith: String
}

input UUIDFilter {} # like StringFilter
```

## System Behaviours

### Null-Free Lists

Projection for Prisma list types always project as a fully non-nullable GraphQL type. This is because Prisma list fields (and list member type) can themselves never be null, and because Prisma does not support `@default` on list types.

For consistency we also apply the same pattern for `t.crud.<BatchRead>`.

```gql
type Query {
  users: [User!]!
}

type User {
  posts: [Post!]!
}
```

```ts
queryType({
  definition(t) {
    t.crud.users()
  },
})
objectType({
  name: 'User',
  definition(t) {
    t.crud.posts()
  },
})
```

```Prisma
model User {
  posts Post[]
}
```