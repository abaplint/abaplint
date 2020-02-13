import {NameValidator} from "../../src/utils/name_validator";
import {expect} from "chai";

describe("Name validator", () => {

  it("violates a rule if the pattern is required and the name does not match", () => {
    const ruleViolated = NameValidator.violatesRule("abc", new RegExp("^lv_.*$", "i"), {patternKind: "required"});
    expect(ruleViolated).to.equal(true);
  });

  it("does not violate a rule if the pattern is required and the name matches", () => {
    const ruleViolated = NameValidator.violatesRule("lv_abc", new RegExp("^lv_.*$", "i"), {patternKind: "required"});
    expect(ruleViolated).to.equal(false);
  });

  it("violates a rule if the pattern is forbidden and the name matches", () => {
    const ruleViolated = NameValidator.violatesRule("abc", new RegExp("^abc$", "i"), {patternKind: "forbidden"});
    expect(ruleViolated).to.equal(true);
  });

  it("does not violate a rule if the pattern is forbidden and the name does not match", () => {
    const ruleViolated = NameValidator.violatesRule("abc", new RegExp("^lv_.*$", "i"), {patternKind: "forbidden"});
    expect(ruleViolated).to.equal(false);
  });

  it("does not violate a rule if the pattern is ignored", () => {
    const ruleViolated = NameValidator.violatesRule(
      "on_something_changed",
      new RegExp("^[a-z]{2}_.*$", "i"),
      {patternKind: "forbidden", ignorePatterns: ["^on_.*$"]});

    expect(ruleViolated).to.equal(false);
  });

  it("does not violate a rule if the name is ignored", () => {
    const ruleViolated = NameValidator.violatesRule(
      "is_okay",
      new RegExp("^[a-z]{2}_.*$", "i"),
      {patternKind: "forbidden", ignorePatterns: ["^is_.*$"]});

    expect(ruleViolated).to.equal(false);
  });

  it("behaves as if patternKind = required if it is omitted", () => {
    const ruleViolated = NameValidator.violatesRule(
      "is_okay",
      new RegExp("^[a-z]{2}_.*$", "i"),
      {patternKind: undefined});

    expect(ruleViolated).to.equal(false);
  });

});