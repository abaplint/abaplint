import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Class} from "../objects";
import {IObject} from "../objects/_iobject";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Version} from "../version";

export class LocalTestclassConsistencyConf extends BasicRuleConfig {
}

export class LocalTestclassConsistency extends ABAPRule {

  private conf = new LocalTestclassConsistencyConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "local_testclass_consistency",
      title: "Local testclass consistency",
      shortDescription: `Checks that local test classes are placed in the test include, and class unit test flag is set`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LocalTestclassConsistencyConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: IObject) {
    const issues: Issue[] = [];

    if (this.reg.getConfig().getVersion() === Version.v700) {
      // 700 does not have testclass includes
      return [];
    }

    if (!(obj instanceof Class)) {
      return [];
    }

    for (const c of file.getInfo().listClassDefinitions()) {
      if (c.isLocal && c.isForTesting && !file.getFilename().includes(".testclasses.abap")) {
        const message = "Place local testclass \"" + c.name + "\" in the testclass include";
        const issue = Issue.atIdentifier(c.identifier, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    if (file.getFilename().includes(".testclasses.") === true
        && obj.getTestclassFile() !== undefined
        && obj.getXML()?.includes("<WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>") === false) {
      const id = obj.getIdentifier();
      if (id) {
        const message = "Has testclass, but XML does not set <WITH_UNIT_TESTS>";
        const issue = Issue.atIdentifier(id, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

}