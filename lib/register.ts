let configuration: any = {};

export const register = <T>(factories: T) => {
  configuration.factories = factories;
};

console.log('Registered factories!');

export { configuration };
