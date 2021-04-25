import path from 'path'

import { RuleTester } from 'eslint'

import { markup } from 'eslint-plugin-markup'

const tester = new RuleTester()

const options = {
  parser: require.resolve('eslint-plugin-markup'),
  filename: path.join(__dirname, 'fixtures/basic.html'),
}

tester.run('markup', markup, {
  valid: [
    {
      ...options,
      code: /* HTML */ `<!DOCTYPE html>
        <html>
          <head>
            <title>Any Page</title>
          </head>
          <body>
            <h1>Any Page</h1>
            <p>Anonymous</p>
          </body>
        </html>`,
    },
    {
      code: '',
    },
    {
      code: '',
      filename: path.join(__filename, '0_fake_virtual_filename.html'),
    },
    {
      code: '',
      filename: path.join(__dirname),
    },
  ],
  invalid: [
    {
      ...options,
      code: /* HTML */ `<html>
        <head>
          <title>Any Page</title>
        </head>
        <body>
          <h1>Any Page</h1>
          <p>Anonymous</p>
        </body>
      </html>`,
      errors: [
        {
          message: 'Required doctype',
          line: 1,
          column: 2,
        },
      ],
    },
  ],
})
