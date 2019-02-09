# Fishery

**This project is still in early planning stages. Its API is subject to change without notice.**

Fishery is a library for setting up JavaScript objects for use in tests, Storybook, and anywhere else you need to set up data. It is modeled after the Ruby gem, [factory_bot][factory_bot].

Fishery is built with TypeScript in mind. Factories return typed objects, so you can be confident that the data used in your tests is valid. If you aren't using TypeScript, that's fine too – Fishery still works, just without the extra typechecking that comes with TypeScript.

## Getting Started

Coming soon to NPM. In the meantime, the only way to use this is to clone this repo and link manually:

```
git clone git@github.com:thoughtbot/fishery.git
cd fishery
npm link
```

Now, from your project:

```
npm link fishery
```

## Usage

It is recommended to define one factory per file and then combine them together to form a `factories` object which can then be used in tests, Storybook, etc.:

### Define factories

```typescript
// factories/user.ts
import { Factory } from 'fishery';
import { User } from '../types';

export default Factory.define<User>(({ sequence }) => ({
  id: sequence,
  name: 'Bob',
}));
```

### Combine factories

Now combine your factories together and register them:

```typescript
// factories/index.ts
import { register } from 'fishery';
import user from './user';
import post from './post';

export const factories = {
  user,
  post,
};

register(factories);
```

### Use factories

```typescript
// my-test.test.ts
import { factories } from './factories';

const user = factories.user.build({ name: 'Susan' });
```

## Documentation

### Typechecking

Factories are typed, so using the factory from the above example, these would both cause TypeScript compile errors:

```typescript
const user = factories.user.build();
user.foo; // type error! Property 'foo' does not exist on type 'User'
```

```typescript
const user = factories.user.build({ foo: 'bar' }); // type error! Argument of type '{ foo: string; }' is not assignable to parameter of type 'Partial<User>'.
```

### Associations

If your factory references another factory, use the `factories` object provided by the generator function:

```typescript
const userFactory = Factory.define<User, Factories>(
  ({ factories, instance }) => ({
    name: 'Bob',
    posts: [factories.post.build({ user: instance })],
  }),
);
```

Using the factories object helps avoid circular dependency issues where two factories need to reference each other. In the example above, note that a second type parameter was passed to `Factory.define`, called `Factories`. This represents the type of the combined factories and should be supplied in order to get typechecking of the `factories` object. The type should be defined like:

```typescript
export interface Factories {
  user: Factory<User>;
  post: Factory<Post>;
}
```

### Considerations with expensive operations

When factories are built, they are created as defined, and then user-supplied parameters are overlaid on top. This means that if your factory performs expensive operations, they aren't necessarily short-circuited when you provide different parameters. For example, with this factory:

```typescript
const userFactory = Factory.define<User, Factories>(
  ({ factories, instance }) => ({
    name: 'Bob',
    posts: [factories.post.build({ user: instance })],
  }),
);

userFactory.build({ posts: [] })
```

the regular factory would run (creating the posts association), and then our supplied empty array of posts would be assigned. If you'd like to prevent this behavior, for example in the case of an expensive operation, you can explicitly check if a parameter was supplied and short-circuit execution:

```typescript
const userFactory = Factory.define<User, Factories>(
  ({ factories, params, instance }) => ({
    name: 'Bob',
    posts: params.posts || [factories.post.build({ user: instance })],
  }),
);
```

### After-create hook

You can instruct factories to execute some code after an object is created:

```typescript
export default Factory.define<User>(({ sequence, afterCreate }) => {
  // TypeScript knows the type of `user` here 🎉
  afterCreate(user => {
    user.name = 'Susan';
  });

  return {
    id: sequence,
    name: 'Bob',
  };
});
```

## Contributing

See the [CONTRIBUTING] document.
Thank you, [contributors]!

[CONTRIBUTING]: CONTRIBUTING.md
[contributors]: https://github.com/thoughtbot/templates/graphs/contributors

## Credits

This project name was inspired by Patrick Rothfuss' _Kingkiller Chronicles_ books. In the books, the workshop is called the Fishery, which is short for Artificery.

## License

Fishery is Copyright © 2019 Stephen Hanson and thoughtbot. It is free
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
