import { Factory } from 'fishery';
import { User } from '../types';
import postFactory from './post';

const userFactory = Factory.define<User>(
  ({ associations, sequence, afterBuild }) => {
    afterBuild(user => {
      if (!user.posts.length) {
        user.posts = postFactory.buildList(1, {}, { associations: { user } });
      }
    });

    return {
      id: `user-${sequence}`,
      name: 'Bob',
      posts: associations.posts || [],
    };
  },
);

export default userFactory;
