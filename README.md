# Fishery

[![CircleCI](https://circleci.com/gh/thoughtbot/fishery.svg?style=svg)](https://circleci.com/gh/thoughtbot/fishery)

Fishery is a library for setting up JavaScript objects for use in tests and
anywhere else you need to set up data. It is loosely modeled after the Ruby
gem, [factory_bot][factory_bot].

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
import postFactory from './post';

export default Factory.define<User>(({ sequence }) => ({
  id: sequence,
  name: 'Rosa',
  address: { city: 'Austin', state: 'TX', country: 'USA' },
  posts: postFactory.buildList(2),
}));
```

### Build objects with your factories

```typescript
const user = userFactory.build({ name: 'Sandra' });
```

Pass parameters as the first argument to `build` to override your factory
defaults. These parameters are deep-merged into the default object returned by
your factory.

`build` also supports a seconds argument with the following keys:

- `transient`: data for use in your factory that doesn't get overlaid onto your
  result object. More on this in the [Transient
  Params](#params-that-dont-map-to-the-result-object-transient-params) section
- `associations`: often not required but can be useful in order to short-circuit creating associations. More on this in the [Associations](#Associations)
  section

```typescript
// my-test.test.ts
import { factories } from './factories';

const user = factories.user.build({
  name: 'Susan',
  address: { city: 'El Paso' },
});

user.name; // Susan
user.address.city; // El Paso
user.address.state; // TX (from factory)
```

### Asynchronously create objects with your factories

In some cases, you might want to perform an asynchronous operation when building objects, such as saving an object to the database. This can be done by calling `create` instead of `build`:

```typescript
const user = await userFactory.create({ name: 'Maria' });
user.name; // Maria
```

`create` returns a promise instead of the object itself but otherwise has the same API as `build`. The action that occurs when calling `create` can be specified in your factory's `onCreate` method as [described below](#on-create-hook).

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
export default Factory.define<User, UserTransientParams>(
  ({
    sequence,
    params,
    transientParams,
    associations,
    afterBuild,
    onCreate,
  }) => {
    params.firstName; // Property 'firstName' does not exist on type 'DeepPartial<User>
    transientParams.foo; // Property 'foo' does not exist on type 'Partial<UserTransientParams>'
    associations.bar; // Property 'bar' does not exist on type 'Partial<User>'

    afterBuild(user => {
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

Factories can import and reference other factories for associations:

```typescript
import userFactory from './user';

const postFactory = Factory.define<Post>(() => ({
  title: 'My Blog Post',
  author: userFactory.build(),
}));
```

If you'd like to be able to pass in an association when building your object and
short-circuit the call to `yourFactory.build()`, use the `associations`
variable provided to your factory:

```typescript
const postFactory = Factory.define<Post>(({ associations }) => ({
  title: 'My Blog Post',
  author: associations.author || userFactory.build(),
}));
```

Then build your object like this:

```typescript
const jordan = userFactory.build({ name: 'Jordan' });
factories.post.build({}, { associations: { author: jordan } });
```

If two factories reference each other, they can usually import each other
without issues, but TypeScript might require you to explicitly type your
factory before exporting so it can determine the type before the circular
references resolve:

```typescript
// the extra Factory<Post> typing can be necessary with circular imports
const postFactory: Factory<Post> = Factory.define<Post>(() => ({ ...}));
export default postFactory;
```

### Use `params` to access passed in properties

The parameters passed in to `build` are automatically overlaid on top of the
default properties defined by your factory, so it is often not necessary to
explicitly access the params in your factory. This can, however, be useful,
for example, if your factory uses the params to compute other properties:

```typescript
const userFactory = Factory.define<User>(({ params }) => {
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

const userFactory = Factory.define<User, UserTransientParams>(
  ({ transientParams, sequence }) => {
    const { registered, numPosts = 1 } = transientParams;

    const user = {
      name: 'Susan Velasquez',
      posts: postFactory.buildList(numPosts),
      memberId: registered ? `member-${sequence}` : null,
      permissions: {
        canPost: registered,
      },
    };

    return user;
  },
);
```

In the example above, we also created a type called `UserTransientParams` and
passed it as the second generic type to `define`. This gives you type
checking of transient params, both in the factory and when calling `build`.

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

Passing transient params to `build` can be a bit verbose. It is often a good
idea to consider creating a [reusable builder method](#adding-reusable-builders-traits-to-factories) instead of or in
addition to your transient params to make building objects simpler.

### After-build hook

You can instruct factories to execute some code after an object is built.
This can be useful if a reference to the object is needed, like when setting
up relationships:

```typescript
export default Factory.define<User>(({ sequence, afterBuild }) => {
  afterBuild(user => {
    const post = factories.post.build({}, { associations: { author: user } });
    user.posts.push(post);
  });

  return {
    id: sequence,
    name: 'Bob',
    posts: [],
  };
});
```

### On-create hook

You can instruct factories to chain promises together when creating an object.
This allows you to perform asynchronous actions when building models such as
creating the model on a server.

```typescript
export default Factory.define<User>(({ sequence, onCreate }) => {
  onCreate(user => {
    return apiService.create(user);
  });

  return {
    id: sequence,
    name: 'Bob',
    posts: [],
  };
});
```

### Extending factories

Factories can easily be extended using the extension methods: `params`,
`transient`, `associations`, `afterBuild`, and `onCreate`. These set default attributes that get passed to the factory on `build`:

```typescript
const userFactory = Factory.define<User>(() => ({
  name: 'Kassandra',
  admin: false,
}));

const adminFactory = userFactory.params({ admin: true });
const admin = adminFactory.build();
admin.admin; // true
```

The extension methods return a new factory with the specified `params`,
`transientParams`, `associations`, or `afterBuild` added to it and do not
modify the factory they are called on. When `build` is called on the factory,
the `params`, `transientParams`, and `associations` are passed in along with
the values supplied to `build`. Values supplied to `build` override these
defaults.

`afterBuild` just adds a function that is called when the object is built.
The `afterBuild` defined in `Factory.define` is always called first if
specified, and then any `afterBuild` functions defined with the extension
method are called sequentially in the order they were added. The `onCreate`
methods use the same order precedence.

These extension methods can be called multiple times to continue extending
factories, and they do not modify the original factory:

```typescript
const eliFactory = userFactory
  .params({ admin: true })
  .params({ name: 'Eli' })
  .afterBuild(user => console.log('hello'))
  .afterBuild(user => console.log('there'));

const user = eliFactory.build();
// log: hello
// log: there
user.name; // Eli
user.admin; // true

const user2 = eliFactory.build({ admin: false });
user.name; // Eli
user2.admin; // false
```

### Adding reusable builders (traits) to factories

If you find yourself frequently building objects with a certain set of
properties, it might be time to either extend the factory or create a
reusable builder method.

Factories are just classes, so adding reusable builder methods is as simple
as subclassing `Factory` and defining any desired methods:

```typescript
class UserFactory extends Factory<User, UserTransientParams> {
  admin(adminId?: string) {
    return this.params({
      admin: true,
      adminId: adminId || `admin-${this.sequence()}`,
    });
  }

  registered() {
    return this
      .params({ memberId: this.sequence() })
      .transient({ registered: true })
      .associations({ profile: profileFactory.build() })
      .afterBuild(user => console.log(user))
  }
}

// instead of Factory.define<User>
const userFactory = UserFactory.define(() => ({ ... }))

const user = userFactory.admin().registered().build()
```

To learn more about the factory builder methods `params`, `transient`,
`associations`, and `afterBuild`, see [Extending factories](#extending-factories), above.

### Rewind Sequence

A factory's sequence can be rewound with `rewindSequence()`.
This sets the sequence back to its original starting value.

Given the following factory

```typescript
export default Factory.define<User>(({ sequence }) => ({
  email: `person${sequence}@example.com`,
}));
```

You can rewind a factory's sequence at your discretion

```typescript
import { factories } from './factories';

factories.user.build(); // { email: 'person1@example.com' }
factories.user.build(); // { email: 'person2@example.com' }

factories.user.rewindSequence();

factories.user.build(); // { email: 'person1@example.com' }
```

## Contributing

See the [CONTRIBUTING] document.
Thank you, [contributors]!

[contributing]: CONTRIBUTING.md
[contributors]: https://github.com/thoughtbot/fishery/graphs/contributors

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
