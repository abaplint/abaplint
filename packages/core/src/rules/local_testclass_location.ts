import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Class} from "../objects";
import {IObject} from "../objects/_iobject";

export class LocalTestclassLocationConf extends BasicRuleConfig {
}

export class LocalTestclassLocation extends ABAPRule {

  private conf = new LocalTestclassLocationConf();

  public getMetadata() {
    return {
      key: "local_testclass_location",
      title: "Local testclass location",
      shortDescription: `Checks that local test classes are placed in the test include.`,
    };
  }

  private getDescription(className: string): string {
    return "Place local testclass \"" + className + "\" in the testclass include";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LocalTestclassLocationConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: IObject) {
    const issues: Issue[] = [];

    if (!(obj instanceof Class)) {
      return [];
    }

    for (const c of file.getInfo().listClassDefinitions()) {
      if (c.isLocal && c.isForTesting && !file.getFilename().includes(".testclasses.abap")) {
        const issue = Issue.atIdentifier(c.identifier, this.getDescription(c.name), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

}