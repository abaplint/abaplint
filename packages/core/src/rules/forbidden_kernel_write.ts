import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";

export class ForbiddenKernelWriteConf extends BasicRuleConfig {
  /** Objects allowed to use WRITE '@KERNEL', array of string regex matched against the object name.
   * The default allows every object, ie. the rule reports nothing until the list is narrowed
   * @uniqueItems true
  */
  public allow: string[] = [".*"];
}

export class ForbiddenKernelWrite extends ABAPRule {

  private conf = new ForbiddenKernelWriteConf();
  private allow: RegExp[] = [/.*/i];

  public getMetadata(): IRuleMetadata {
    return {
      key: "forbidden_kernel_write",
      title: "Forbidden kernel WRITE",
      shortDescription: `Forbid WRITE '@KERNEL' outside the listed objects`,
      extendedInformation: `The transpiler emits the literal of WRITE '@KERNEL ...' as raw JavaScript,
which runs with the privileges of the host. Open-abap uses this for its kernel classes, code compiled by a host it did not write should not.

allow is a list of regex, case insensitive, matched against the object name, eg. ["^CL_", "^KERNEL_"].
An empty list forbids WRITE '@KERNEL' everywhere.`,
      tags: [RuleTag.SingleFile, RuleTag.Security],
      badExample: `WRITE '@KERNEL process.exit(1);'.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ForbiddenKernelWriteConf): void {
    this.conf = conf;
    if (this.conf.allow === undefined) {
      this.conf.allow = [".*"];
    }
    this.allow = this.conf.allow.map(a => new RegExp(a, "i"));
  }

  public runParsed(file: ABAPFile, obj: ABAPObject): Issue[] {
    if (this.allow.some(a => a.test(obj.getName()))) {
      return [];
    }

    const ret: Issue[] = [];
    for (const s of file.getStatements()) {
      if (!(s.get() instanceof Statements.Write)) {
        continue;
      }
      // same check as the transpiler, statements/write.ts
      const source = s.findDirectExpression(Expressions.Source)?.concatTokens();
      if (source?.startsWith("'@KERNEL ") === true) {
        const message = "WRITE '@KERNEL' not allowed in " + obj.getName();
        ret.push(Issue.atStatement(file, s, message, this.getMetadata().key, this.conf.severity));
      }
    }
    return ret;
  }

}
