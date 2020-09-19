import {expect} from "chai";
import {Config, Version, MemoryFile, Registry} from "../src";
import {Severity} from "../src/severity";

describe("severity", () => {

  function getConfig(rules: any): Config {
    const conf: any = {
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

    return new Config(JSON.stringify(conf));
  }

  it("an issue will have the severity specified in the config", () => {

    const config = getConfig({
      "space_before_dot": {
        severity: Severity.Info,
      },
    });

    const file = new MemoryFile("foo.prog.abap", "BREAK-POINT    .");
    const registry = new Registry(config).addFile(file);
    const issues = registry.findIssues();
    expect(issues.length).to.equal(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Info);

  });

  it("an issue will have severity error if unspecified in the config", () => {

    const config = getConfig({
      "space_before_dot": true,
    });

    const file = new MemoryFile("foo.prog.abap", "BREAK-POINT    .");
    const registry = new Registry(config).addFile(file);
    const issues = registry.findIssues();
    expect(issues.length).to.equal(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);

  });

});