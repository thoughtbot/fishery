# Fishery

[![CircleCI](https://circleci.com/gh/thoughtbot/fishery.svg?style=svg)](https://circleci.com/gh/thoughtbot/fishery)

**This project is still in early stages. Prior to a 1.0 release, its API is subject to change without notice.**

Fishery is a library for setting up JavaScript objects for use in tests, Storybook, and anywhere else you need to set up data. It is modeled after the Ruby gem, [factory_bot][factory_bot].

Fishery is built with TypeScript in mind. Factories return typed objects, so you can be confident that the data used in your tests is valid. If you aren't using TypeScript, that's fine too – Fishery still works, just without the extra typechecking that comes with TypeScript.

## Installation

First, install fishery with:

```
npm install --save fishery
```

or

```
yarn add fishery
```

## Usage

It is recommended to define one factory per file and then combine them together to form a `factories` object which can then be used in tests, Storybook, etc.:

### Define factories

```typescript
// factories/user.ts
import { Factory } from 'fishery';
import { User } from '../my-types';

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

export const factories = register({
  user,
  post,
});
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
const postFactory = Factory.define<Post, Factories>(
  ({ factories, params }) => ({
    title: 'My Blog Post',
    author: params.author || factories.user.build(),
  }),
);
```

There are two things to note in the example above:

#### `factories` and the `Factories` type parameter

In the above example, we used `factories` which is supplied by the factory generator function. Using the factories object helps avoid circular import issues where two factories need to reference each other. The `factories` object represents the combined factories object that was supplied to `register` when setting up Fishery. To get type-checking of `factories`, a second type parameter should be passed to `Factory.define`, called `Factories`. The type should be defined like:

```typescript
export interface Factories {
  user: Factory<User>;
  post: Factory<Post>;
}
```

#### Use `params` to access passed in properties

In the above `postsfactory` example, the author property is calculated as `author: params.author || factories.user.build()`. The `params` object represents the properties bassed to the factory's `build` method. With this definition, if we create a post with `postsFactory.build({ author })`, then `factories.user.build()` is conveniently not executed. This can be handy in preventing infinite loops or expensive operations. 

It is important to note that if the user factory has a call to `factories.post.build()` (without specifying the author), an infinite loop would still occur. The user factory would need to either not automatically create a post or pass itself as the author in an `afterCreate`, like:

```typescript
const userFactory = Factory.define<User, Factories>(
  ({ factories, afterCreate }) => {
    afterCreate(user => user.posts.push(factories.post.build({ author: user })));
    return {
      name: 'Bob',
      posts: [],
    };
  },
);
```
In normal situations, you should not have to access `params` directly. The properties passed in to `build` are automatically overlaid on top of the default properties defined by the factory.

### After-create hook

You can instruct factories to execute some code after an object is created. This can be useful if a reference to the object is needed, eg. when setting up relationships:

```typescript
export default Factory.define<User, Factories>(({ factories, sequence, afterCreate }) => {
  afterCreate(user => {
    if(user.posts.length === 0) {
      user.posts.push(factories.post.build({ author: user })
    }
  });

  return {
    id: sequence,
    name: 'Bob',
    posts: []
  };
});
```

## Contributing

See the [CONTRIBUTING] document.
Thank you, [contributors]!

[CONTRIBUTING]: CONTRIBUTING.md
[contributors]: https://github.com/thoughtbot/templates/graphs/contributors

## Credits

This project name was inspired by Patrick Rothfuss' _Kingkiller Chronicles_ books. In the books, the artificery, or workshop, is called the Fishery for short.

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
