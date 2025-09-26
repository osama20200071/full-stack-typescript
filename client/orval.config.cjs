/* eslint-disable no-undef */
module.exports = {
  'busy-bee': {
    output: {
      client: 'zod',
      // to make the output in one big file or "split if it's large codebase"
      mode: 'single',
      target: './src/schemas.ts',
    },
    input: {
      // we can point out an actual URL "hosted openapi  Contract"
      target: './openapi.json',
    },
  },
};
