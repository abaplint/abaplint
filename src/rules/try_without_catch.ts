import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Registry} from "../registry";
import {Try, Catch} from "../abap/structures";
import {BasicRuleConfig} from "./_basic_rule_config";

export class TryWithoutCatchConf extends BasicRuleConfig {
}

export class TryWithoutCatch extends ABAPRule {
  private conf = new TryWithoutCatchConf();

  public getKey(): string {
    return "try_without_catch";
  }

  public getDescription(): string {
    return "Inline DATA in old versions";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: TryWithoutCatchConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    const tries = stru.findAllStructures(Try);

    for (const t of tries) {
      const c = t.findFirstStructure(Catch);
      if (c === undefined) {
        issues.push(new Issue({
          file,
          message: this.getDescription(),
          key: this.getKey(),
          start: t.getFirstToken().getPos()}));
      }
    }

    return issues;
  }
}