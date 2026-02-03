import {expect} from "chai";
import {Message} from "../../../src/abap/types/message";

describe("Types, Message", () => {

  it("Count placeholders, 4 expected", () => {
    const msg = new Message("000", "& & & &", "ZFOOBAR");
    expect(msg.getPlaceholderCount()).to.equal(4);
  });

  it("Count placeholders, 2 expected", () => {
    const msg = new Message("000", "moo &1 &2 foo", "ZFOOBAR");
    expect(msg.getPlaceholderCount()).to.equal(2);
  });

  it("Count placeholders, 0 expected", () => {
    const msg = new Message("000", "hello world", "ZFOOBAR");
    expect(msg.getPlaceholderCount()).to.equal(0);
  });

  it("Count placeholders, 0 expected, escaped", () => {
    const msg = new Message("000", "hello && world", "ZFOOBAR");
    expect(msg.getPlaceholderCount()).to.equal(0);
  });

});