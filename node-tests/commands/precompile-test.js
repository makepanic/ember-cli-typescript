'use strict';

const fs = require('fs-extra');

const ember = require('ember-cli-blueprint-test-helpers/lib/helpers/ember');
const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;

const chai = require('ember-cli-blueprint-test-helpers/chai');
const expect = chai.expect;
const file = chai.file;

describe('Acceptance: ts:precompile command', function() {
  setupTestHooks(this);

  beforeEach(function() {
    return emberNew({ target: 'addon' }).then(() => ember(['generate', 'ember-cli-typescript']));
  });

  it('generates .js and .d.ts files from the addon tree', function() {
    fs.ensureDirSync('addon');
    fs.writeFileSync('addon/test-file.ts', `export const testString: string = 'hello';\n`);

    return ember(['ts:precompile'])
      .then(() => {
        let declaration = file('test-file.d.ts');
        expect(declaration).to.exist;
        expect(declaration.content).to.equal(`export declare const testString: string;\n`);

        let transpiled = file('addon/test-file.js');
        expect(transpiled).to.exist;
        expect(transpiled.content).to.equal(`export const testString = 'hello';\n`);
      });
  });

  it('generates .js files only from the app tree', function() {
    fs.ensureDirSync('app');
    fs.writeFileSync('app/test-file.ts', `export const testString: string = 'hello';\n`);

    return ember(['ts:precompile']).then(() => {
      let declaration = file('test-file.d.ts');
      expect(declaration).not.to.exist;

      let transpiled = file('app/test-file.js');
      expect(transpiled).to.exist;
      expect(transpiled.content.split('\n')[0]).to.equal(`export const testString = 'hello';`);
    });
  });
});
