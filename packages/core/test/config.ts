import {expect} from "chai";
import {Config} from "../src/config";
import {IConfig} from "../src/_config";
import {Version, defaultVersion} from "../src/version";

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

describe("Config", () => {

  it("It should include all mentioned rules", () => {
    const config: IConfig = getConfig({
      "7bit_ascii": {
      },
      "avoid_use": {
        enabled: true,
      },
      "short_case": {
        enabled: false, // this is deprecated and has no effect. the rule is enabled
      },
    });

    const conf = new Config(JSON.stringify(config));
    expect(conf.getEnabledRules().length).to.equal(3);
  });

  it("Should never auto enable unspecified rules", () => {
    const config: IConfig = getConfig({});

    const conf = new Config(JSON.stringify(config));
    const enabledRuleCount = conf.getEnabledRules().length;

    expect(enabledRuleCount).to.equal(0);
  });

  it("should support Boolean rules with true/false", () => {
    const config = getConfig({
      "7bit_ascii": true,
      "avoid_use": false,
      "short_case": {
        enabled: false, // no longer supported. this rule is enabled.
      },
    });

    const conf = new Config(JSON.stringify(config));
    expect(conf.getEnabledRules().length).to.equal(2);
  });

  it("should support JSON5 (comments, trailing comma)", () => {
    const config = getConfig({
      "7bit_ascii": true,
      "check_comments": true,
      "avoid_use": true,
    });

    const confString = JSON.stringify(config, null, 2)
      .replace("\"check_comments\"", "//\"check_comments\"")
      .replace("\"avoid_use\": true", "\"avoid_use\": true,");
    const conf = new Config(confString);
    expect(conf.getEnabledRules().length).to.equal(2);
  });

  it("should not do anything bad if you have an old config, old behavior for false", () => {
    const config = getConfig({}) as any;
    config.global.applyUnspecifiedRules = false;

    const conf = new Config(JSON.stringify(config));
    expect(conf.getEnabledRules().length).to.equal(0);
  });

  it("should not do anything bad if you have an old config, new behavior for true", () => {
    const config = getConfig({}) as any;
    config.global.applyUnspecifiedRules = true;

    const conf = new Config(JSON.stringify(config));
    expect(conf.getEnabledRules().length).to.equal(0);
  });

  it("invalid version should fall back to default version", () => {
    const config: IConfig = getConfig({});
    // @ts-ignore
    config.syntax.version = "somethingsomethign";

    const conf = new Config(JSON.stringify(config));

    expect(conf.getVersion()).to.equal(defaultVersion);
  });

});