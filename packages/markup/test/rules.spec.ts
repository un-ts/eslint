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
      code: /* HTML */ `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Any Page</title>
          </head>
          <body>
            <h1>Any Page</h1>
            <p>Anonymous</p>
          </body>
        </html>
      `,
    },
    {
      ...options,
      code: '<header>Header1</header>',
    },
    {
      ...options,
      code: '<header>Header2</header>',
      filename: path.join(__filename, '0_fake_virtual_filename.html'),
    },
    {
      ...options,
      code: '<header>Header3</header>',
      filename: path.join(__dirname),
    },
    {
      ...options,
      code: '<header>Header4</header>',
      filename: path.join(__dirname, 'fake.html'),
    },
    {
      ...options,
      code: '<header>Header5</header>',
      filename: path.join(__dirname, 'fixtures/textlint/test.html'),
    },
  ],
  invalid: [
    {
      ...options,
      code: /* HTML */ `
        <html>
          <head>
            <title>Any Page</title>
          </head>
          <body>
            <h1>Any Page</h1>
            <p>Anonymous</p>
          </body>
        </html>
      `,
      errors: [
        {
          message: JSON.stringify({
            severity: 'error',
            message: 'Require doctype',
            ruleId: 'doctype',
          }),
          line: 1,
          column: 1,
        },
      ],
    },
    {
      ...options,
      code: '<p>a,c,d,e,f,g</p>',
      filename: path.join(__dirname, 'fixtures/textlint/test.html'),
      errors: [
        {
          message: JSON.stringify({
            severity: 'warning',
            message:
              'Invalid text: This sentence exceeds the maximum count of comma. Maximum is 4.',
            ruleId: 'textlint',
          }),
          line: 1,
          column: 10,
        },
      ],
    },
  ],
})
