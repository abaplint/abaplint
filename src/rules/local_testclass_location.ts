import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Class} from "../objects";
import {Registry} from "../registry";
import {IObject} from "../objects/_iobject";

/** Chceks that local test classes are placed in the test include. */
export class LocalTestclassLocationConf extends BasicRuleConfig {
}

export class LocalTestclassLocation extends ABAPRule {

  private conf = new LocalTestclassLocationConf();

  public getKey(): string {
    return "local_testclass_location";
  }

  public getDescription(): string {
    return "Place local testclasses in the testclass include";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LocalTestclassLocationConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry, obj: IObject) {
    const issues: Issue[] = [];

    if (!(obj instanceof Class)) {
      return [];
    }

    for (const c of file.getClassDefinitions()) {
      if (c.isLocal() && c.isForTesting() && !file.getFilename().includes(".testclasses.abap")) {
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: c.getStart()});
        issues.push(issue);
      }
    }

    return issues;
  }

}