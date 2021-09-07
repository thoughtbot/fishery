import { Factory } from 'fishery';

describe('DeepPartial', () => {
  type Request = {
    queryParams: {
      [name: string]: string[] | undefined | null;
    };
  };

  it('transpiles with nullable array in params props', () => {
    const requestFactory = Factory.define<Request>(({ params }) => {
      const { queryParams = {} } = params;

      return {
        queryParams,
      };
    });

    expect(
      requestFactory.build({
        queryParams: { param1: ['value1'], param2: null },
      }),
    ).toEqual({
      queryParams: { param1: ['value1'], param2: null },
    });
  });
});
