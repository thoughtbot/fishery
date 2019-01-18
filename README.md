# Fishery

Fishery is a library for setting up JavaScript objects for use in tests, Storybook, and anywhere else you need to set up data. It is modeled after the Ruby gem, [factory_bot][factory_bot].

Fishery is built with TypeScript in mind. Factories return typed objects, so you can be confident that the data used in your tests is valid. If you aren't using TypeScript, that's fine too – Fishery still works, just without the extra typechecking that comes with TypeScript.

## Getting Started

Coming soon to NPM. In the meantime:

```
npm install --save git+ssh://git@github.com/thoughtbot/fishery
```

or, if using Yarn:

```
yarn add git+ssh://git@github.com/thoughtbot/fishery
```

## Usage

It is generally recommended to define one factory per file and then combine them together to form a `factories` object which can then be used in tests, Storybook, etc.:

```typescript
// factories/user.ts
import { Factory } from 'fishery';
import { User } from '../types';

export default Factory.define<User>(({ sequence }) => ({
  id: `user-${sequence}`,
  name: 'Bob',
}));
```

```typescript
// factories/index.ts
import user from './user';

export const factories = {
  user,
};
```

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
user.email; // type error! Property 'email' does not exist on type 'User'
```

```typescript
const user = factories.user.build({ age: 18 }); // type error! Argument of type '{ age: number; }' is not assignable to parameter of type 'Partial<User>'.
```

### Associations

TODO

## Contributing

TODO

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
