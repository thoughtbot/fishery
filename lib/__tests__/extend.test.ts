import { createFactory } from 'fishery';
import { User } from './helpers/test-types';

describe('factory.extend', () => {
  it('returns a new factory with extended type', () => {
    type Post = { id: number };
    const factory = createFactory({
      build: () => ({ id: 1, name: 'Bob' } as User),
    });

    const userWithPostsFactory = factory.extend({
      posts: [{ id: 2 } as Post],
    });

    const user = userWithPostsFactory.build();
    expect(user.posts[0].id).toBe(2);
    expect(user.id).toBe(1);
  });

  it('can specify the new type as type param', () => {
    type SuperHero = User & { power: string };

    const factory = createFactory({
      build: () => ({ name: 'Clark', id: 1 } as User),
    });

    const heroFactory = factory.extend<SuperHero>({ power: 'Laservision' });
    expect(heroFactory.build().power).toEqual('Laservision');
    expect(heroFactory.build().id).toBe(1);
    expect(heroFactory.build({ power: 'Flight' }).power).toEqual('Flight');
  });

  it('can override params from base object', () => {
    type SuperHero = User & { power: string };
    const factory = createFactory({
      build: () => ({ name: 'Clark', id: 1 } as User),
    });

    const heroFactory = factory.extend<SuperHero>({
      name: 'Batman',
      power: 'None',
    });

    expect(heroFactory.build().name).toEqual('Batman');
  });

  it('traits work after extending', () => {
    const factory = createFactory({
      build: () => ({ name: 'Jett', id: 1 } as User),
      traits: {
        jen: () => ({ name: 'Jen' as const }),
      },
    });

    const newFactory = factory.extend({ age: 10 });
    expect(newFactory.build().age).toBe(10);
    expect(newFactory.build().id).toBe(1);

    const jen = newFactory.jen().build();

    // @ts-expect-error will always return false, typed correctly as 'Jen' const
    jen.name === 'John';
    expect(jen.name).toEqual('Jen');
    expect(jen.age).toBe(10);

    expect(newFactory.jen().build({ age: 12 }).age).toEqual(12);
  });

  it('traits still applied if extended after', () => {
    const factory = createFactory({
      build: () => ({ name: 'Jett', id: 1 } as User),
      traits: {
        jen: () => ({ name: 'Jen' as const }),
      },
    });

    const jenFactory = factory.jen();
    const newFactory = jenFactory.extend({ age: 10 });
    const jen = newFactory.build();

    // @ts-expect-error will always return false, typed correctly as 'Jen' const
    jen.name === 'John';

    expect(jen.name).toEqual('Jen');
    expect(jen.age).toBe(10);
    expect(newFactory.build({ age: 12 }).age).toEqual(12);
  });

  it('can extend extended factory', () => {
    const factory = createFactory({
      build: () => ({ name: 'Jett', id: 1 } as User),
    });

    const newFactory = factory.extend({ age: 10 }).extend({ title: 'Ms.' });
    const user = newFactory.build();

    expect(user).toMatchObject({ age: 10, title: 'Ms.' });

    expect(newFactory.build({ age: 12, title: 'Dr.' })).toMatchObject({
      age: 12,
      title: 'Dr.',
    });
  });
});
