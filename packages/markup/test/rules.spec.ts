import path from 'node:path'

import { RuleTester, type ValidTestCase } from '@typescript-eslint/rule-tester'

import { parser, rules } from 'eslint-plugin-markup'

const tester = new RuleTester()

const options: Pick<ValidTestCase<[]>, 'filename' | 'languageOptions'> = {
  languageOptions: { parser },
  filename: path.resolve(import.meta.dirname, 'fixtures/basic.html'),
}

tester.run<never, []>('markup', rules.markup, {
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
          // @ts-expect-error -- it's fine
          message: JSON.stringify({
            severity: 'error',
            message: 'Require doctype',
            ruleId: 'require-doctype',
          }),
          line: 1,
          column: 1,
        },
      ],
    },
    {
      // `MLEngine` skips any file whose extension is unmatched by the resolved
      // config unless `ignoreExt` is passed, which would silently disable
      // linting for virtual file names crafted by processors
      ...options,
      code: '<html><head></head><body></body></html>',
      filename: path.resolve(import.meta.dirname, 'fixtures/basic.xyz'),
      errors: [
        {
          // @ts-expect-error -- it's fine
          message: JSON.stringify({
            severity: 'error',
            message: 'Require doctype',
            ruleId: 'require-doctype',
          }),
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})

// trick
test('trick test', () => {
  expect(true).toBeTruthy()
})
