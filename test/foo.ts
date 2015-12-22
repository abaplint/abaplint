/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />

/**
 * Module dependencies.
 */
import chai = require('chai');

/**
 * Globals
 */

var expect = chai.expect;

/**
 * Unit tests
 */ 
describe('User Model Unit Tests:', () => {

    describe('2 + 4', () => {
        it('should be 6', (done) => {
            expect(2+4).to.equals(6);
            done();
        });

        it('should not be 7', (done) => {
            expect(2+4).to.not.equals(7);
            done();
        });
    });
});

import Calculator from '../index';

describe('Calculator', () => {
    var subject : Calculator;

    beforeEach(function () {
        subject = new Calculator();
    });

    describe('add', () => {
        it('should add two numbers together', () => {
            var result : number = subject.add(2, 3);
            expect(result).to.equals(5);
        });
    });
});