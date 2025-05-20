module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: [
      'features/support/setup.ts',
      'features/support/world.ts',
      'features/step_definitions/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: ['@cucumber/pretty-formatter']
  }
};
