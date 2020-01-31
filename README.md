# Fishery

[![CircleCI](https://circleci.com/gh/thoughtbot/fishery.svg?style=svg)](https://circleci.com/gh/thoughtbot/fishery)

Fishery is a library for setting up JavaScript objects for use in tests,
Storybook, and anywhere else you need to set up data. It is loosely modeled
after the Ruby gem, [factory_bot][factory_bot].

Fishery is built with TypeScript in mind. Factories accept typed parameters and
return typed objects, so you can be confident that the data used in your tests
is valid. If you aren't using TypeScript, that's fine too – Fishery still works,
just without the extra typechecking that comes with TypeScript.

## Installation

Install fishery with:

```
npm install --save fishery
```

or

```
yarn add fishery
```

## Usage

A factory is just a function that returns your object. Fishery provides
several arguments to your factory function to help with common situations.
After defining your factory, you can then call `build()` on it to build your
objects. Here's how it's done:

### Define factories

```typescript
// factories/user.ts
import { Factory } from 'fishery';
import { User } from '../my-types';

export default Factory.define<User>(({ sequence, factories }) => ({
  id: sequence,
  name: 'Bob',
  address: { city: 'Grand Rapids', state: 'MI', country: 'USA' },
  posts: factories.post.buildList(2),
}));
```

### Combine factories

Now combine your factories together and register them:

```typescript
// factories/index.ts
import { register } from 'fishery';
import user from './user';
import post from './post';

export const factories = register({
  user,
  post,
});
```

### Build objects with your factories

Pass parameters as the first argument to `build` to override your factory
defaults. These parameters are deep-merged into the default object returned by
your factory.

`build` also supports a seconds argument with the following keys:

- `transient`: data for use in your factory that doesn't get overlaid onto your
  result object. More on this in the [Transient
  Params](#params-that-dont-map-to-the-result-object-transient-params) section
- `associations`: often not required but can be useful in the case of
  bi-directional associations. More on this in the [Associations](#Associations)
  section

```typescript
// my-test.test.ts
import { factories } from './factories';

const user = factories.user.build({
  name: 'Susan',
  address: { city: 'Detroit' },
});

user.name; // Susan
user.address.city; // Detroit
user.address.state; // MI (from factory)
```

## Documentation

### Typechecking

Factories are fully typed, both when defining your factories and when using them
to build objects, so you can be confident the data you are working with is
correct.

```typescript
const user = factories.user.build();
user.foo; // type error! Property 'foo' does not exist on type 'User'
```

```typescript
const user = factories.user.build({ foo: 'bar' }); // type error! Argument of type '{ foo: string; }' is not assignable to parameter of type 'Partial<User>'.
```

```typescript
export default Factory.define<User, Factories, UserTransientParams>(
  ({ sequence, params, transientParams, associations, afterCreate }) => {
    params.firstName; // Property 'firstName' does not exist on type 'DeepPartial<User>
    transientParams.foo; // Property 'foo' does not exist on type 'Partial<UserTransientParams>'
    associations.bar; // Property 'bar' does not exist on type 'Partial<User>'

    afterCreate(user => {
      user.foo; // Property 'foo' does not exist on type 'User'
    });

    return {
      id: `user-${sequence}`,
      name: 'Bob',
      post: null,
    };
  },
);
```

### Associations

If your factory references another factory, use the `factories` object
provided to the factory:

```typescript
const postFactory = Factory.define<Post, Factories>(({ factories }) => ({
  title: 'My Blog Post',
  author: factories.user.build(),
}));
```

If you'd like to be able to pass in an association when building your object and
short-circuit the call to `factories.xxx.build()`, use the `associations`
variable provided to your factory:

```typescript
const postFactory = Factory.define<Post, Factories>(
  ({ factories, associations }) => ({
    title: 'My Blog Post',
    author: associations.author || factories.user.build(),
  }),
);
```

Then build your object like this:

```typescript
factories.post.build({}, { associations: { author: susan } });
```

#### Typing the `factories` factory argument

In the above examples, the `Factories` generic parameter is passed to
`define`. This is optional but recommended in order to get type-checking of
the `factories` object. You can define your `Factories` type like this:

```typescript
// factories/types.ts
export interface Factories {
  user: Factory<User>;
  post: Factory<Post>;
}
```

Once you've defined your `Factories` type, it can also be used when
registering your factories. This ensures that your `Factories` type is always
in sync with the actual factories that you have registered:

```typescript
// factories/index.ts
import { register } from 'fishery';
import user from './user';
import post from './post';
import { Factories } from './types';

export const factories: Factories = register({ user, post });
```

### Use `params` to access passed in properties

The parameters passed in to `build` are automatically overlaid on top of the
default properties defined by your factory, so it is often not necessary to
explicitly access the params in your factory. This can, however, be useful,
for example, if your factory uses the params to compute other properties:

```typescript
const userFactory = Factory.define<User, Factories>(({ params }) => {
  const { name = 'Bob Smith' } = params;
  const email = params.email || `${kebabCase(name)}@example.com`;

  return {
    name,
    email,
    posts: [],
  };
});
```

### Params that don't map to the result object (transient params)

Factories can accept parameters that are not part of the resulting object. We
call these transient params. When building an object, pass any transient
params in the second argument:

```typescript
const user = factories.user.build({}, { transient: { registered: true } });
```

Transient params are passed in to your factory and can then be used
however you like:

```typescript
interface User {
  name: string;
  posts: Post[];
  memberId: string | null;
  permissions: { canPost: boolean };
}

interface UserTransientParams {
  registered: boolean;
  numPosts: number;
}

const userFactory = Factory.define<User, Factories, UserTransientParams>(
  ({ transientParams, factories, sequence }) => {
    const { registered, numPosts = 1 } = transientParams;

    const user = {
      name: 'Susan Velasquez',
      posts: factories.posts.buildList(numPosts),
      memberId: registered ? `member-${sequence}` : null,
      permissions: {
        canPost: registered,
      },
    };
  },
);
```

In the example above, we also created a type called `UserTransientParams` and
passed it as the third generic type to `define`. This isn't required but
gives you type checking of transient params, both in the factory and when
calling `build`.

When constructing objects, any regular params you pass to `build` take
precedence over the transient params:

```typescript
const user = factories.user.build(
  { memberId: '1' },
  { transient: { registered: true } },
);
user.memberId; // '1'
user.permissions.canPost; // true
```

### After-create hook

You can instruct factories to execute some code after an object is created.
This can be useful if a reference to the object is needed, like when setting
up relationships:

```typescript
export default Factory.define<User, Factories>(
  ({ factories, sequence, afterCreate }) => {
    afterCreate(user => {
      const post = factories.post.build({}, { associations: { author: user } });
      user.posts.push(post);
    });

    return {
      id: sequence,
      name: 'Bob',
      posts: [],
    };
  },
);
```

### Defining one-off factories without calling `register`

Factories should usually be defined and then combined together using `register`:

```typescript
// factories/index.ts
import { register } from 'fishery';
import user from './user';
import post from './post';
import { Factories } from './types';

export const factories: Factories = register({ user, post });
```

The factories passed to register get injected into each factory so factories can
access each other. This prevents circular dependencies that could arise if your
factories try to access other factories directly by importing them and also
creates a convenient way for factories to access other factories without having
to explicitly import them.

If you are defining a factory for use in a single test file, you might not wish
to register the factory or use the `factories` object that gets injected to the
factory. In this case, you can use `defineUnregistered` instead of `define` and
then skip calling `register`, eg:

```typescript
const personFactory = Factory.defineUnregistered<Person>(() => ({
  name: 'Sasha',
}));

const person = personFactory.build();
```

## Contributing

See the [CONTRIBUTING] document.
Thank you, [contributors]!

[contributing]: CONTRIBUTING.md
[contributors]: https://github.com/thoughtbot/templates/graphs/contributors

## Credits

This project name was inspired by Patrick Rothfuss' _Kingkiller Chronicles_
books. In the books, the artificery, or workshop, is called the Fishery for
short. The Fishery is where things are built.

## License

Fishery is Copyright © 2020 Stephen Hanson and thoughtbot. It is free
software, and may be redistributed under the terms specified in the
[LICENSE](/LICENSE) file.

### About thoughtbot

![thoughtbot](https://presskit.thoughtbot.com/images/thoughtbot-logo-for-readmes.svg)

Fishery is maintained and funded by thoughtbot, inc.
The names and logos for thoughtbot are trademarks of thoughtbot, inc.

We love open source software!
See [our other projects][community] or
[hire us][hire] to design, develop, and grow your product.

[community]: https://thoughtbot.com/community?utm_source=github
[hire]: https://thoughtbot.com/hire-us?utm_source=github
[factory_bot]: https://github.com/thoughtbot/factory_bot
