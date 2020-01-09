import {expect} from "chai";
import {IConfig, Config} from "../src/config";
import {Version} from "../src";

describe("Registry", () => {

  it("Should ignore any rules with enabled = false", function () {

    const config = getConfig({
      "avoid_use": {
        enabled: false,
      },
    });

    const conf = new Config(JSON.stringify(config));

    const ruleConfig = conf.readByRule("avoid_use");
    expect(ruleConfig.enabled).to.equal(false);

    expect(conf.getEnabledRules().length).to.equal(0);
  });

  it("It should include all mentioned rules which are not disabled explicitly", function () {
    const config: IConfig = getConfig({
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

  it("Should never auto enable unspecified rules", function () {
    const config: IConfig = getConfig({});

    const conf = new Config(JSON.stringify(config));
    const enabledRuleCount = conf.getEnabledRules().length;

    expect(enabledRuleCount).to.equal(0);
  });

  it("should support Boolean rules with true", function () {
    const config = getConfig({
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
    const config = getConfig({
      "7bit_ascii": true,
      "avoid_use": false,
      "short_case": {
        enabled: false,
      },
    });

    const conf = new Config(JSON.stringify(config));
    expect(conf.getEnabledRules().length).to.equal(1);
  });

  it("should not do anything bad if you have an old config, old behavior for false", function () {
    const config = getConfig({}) as any;
    config.global.applyUnspecifiedRules = false;

    const conf = new Config(JSON.stringify(config));
    expect(conf.getEnabledRules().length).to.equal(0);
  });

  it("should not do anything bad if you have an old config, new behavior for true", function () {
    const config = getConfig({}) as any;
    config.global.applyUnspecifiedRules = true;

    const conf = new Config(JSON.stringify(config));
    expect(conf.getEnabledRules().length).to.equal(0);
  });

  function getConfig(rules: any): IConfig {
    return {
      global: {
        files: "/src/**/*.*",
        skipGeneratedGatewayClasses: true,
        skipGeneratedPersistentClasses: true,
        skipGeneratedFunctionGroups: true,
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