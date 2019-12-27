import {expect} from "chai";
import {IConfig, Config} from "../src/config";
import {Version} from "../src";

describe("Registry", () => {

  it("Should ignore any rules with enabled = false even if apply unspecified is true", function () {

    const config = getConfig(true, {
      "avoid_use": {
        enabled: false,
      },
    });

    const conf = new Config(JSON.stringify(config));

    const ruleConfig = conf.readByRule("avoid_use");
    expect(ruleConfig.enabled).to.equal(false);

    expect(conf.getEnabledRules().length).to.be.greaterThan(0);
  });

  it("It should include mentioned rules which are not disabled explicitly if apply unspecified is false", function () {
    const config: IConfig = getConfig(false, {
      "7bit_ascii": {
      },
      "avoid_use": {
        enabled: true,
      },
      "short_case": {
        enabled: false,
      },
    });

    const conf = new Config(JSON.stringify(config));
    expect(conf.getEnabledRules().length).to.equal(2);
  });

  it("Should auto enable rules if apply unspecified is true", function () {
    const config: IConfig = getConfig(true, {});

    const conf = new Config(JSON.stringify(config));
    const enabledRuleCount = conf.getEnabledRules().length;

    expect(enabledRuleCount).to.be.greaterThan(0);
  });

  it("should support Boolean rules with true", function () {
    const config = getConfig(false, {
      "7bit_ascii": true,
      "avoid_use": false,
      "short_case": {
        enabled: false,
      },
    });

    const conf = new Config(JSON.stringify(config));
    expect(conf.getEnabledRules().length).to.equal(1);
  });

  it("should support Boolean rules with false", function () {
    const configAll = getConfig(true, {});
    const config = getConfig(true, {
      "7bit_ascii": true,
      "avoid_use": false,
      "short_case": {
        enabled: false,
      },
    });

    const confAll = new Config(JSON.stringify(configAll));
    const conf = new Config(JSON.stringify(config));
    expect(conf.getEnabledRules().length).to.equal(confAll.getEnabledRules().length - 2);
  });

  function getConfig(applyUnspecifiedRules: boolean, rules: any): IConfig {
    return {
      global: {
        files: "/src/**/*.*",
        skipGeneratedGatewayClasses: true,
        skipGeneratedPersistentClasses: true,
        skipGeneratedFunctionGroups: true,
        applyUnspecifiedRules: applyUnspecifiedRules,
      },
      dependencies: [],
      syntax: {
        version: Version.v702,
        errorNamespace: "^(Z|Y)",
        globalConstants: [],
        globalMacros: [],
      },
      rules: rules,
    };
  }
});