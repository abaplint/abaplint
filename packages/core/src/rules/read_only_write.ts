import {IRegistry} from "../_iregistry";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {Issue} from "../issue";
import {Severity} from "../severity";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata} from "./_irule";
import {ReadOnlyFlow} from "./_read_only_flow";

export class ReadOnlyWriteConf extends BasicRuleConfig {
}

export class ReadOnlyWrite implements IRule {
  private reg: IRegistry;
  private conf = new ReadOnlyWriteConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "read_only_write",
      title: "Write through a read-only alias",
      shortDescription: "Detects runtime write protection violations through field symbols and data references",
      extendedInformation: `Direct writes forbidden by ABAP belong to check_syntax. This rule follows field-symbol bindings,
data references, branches, loops and resolved local procedure calls to find writes through protected aliases.
The diagnostic is placed on the write, not on a legal ASSIGN. Mixed writable/protected paths are warnings.
Permissions are acquired when a reference is created: a writable reference published by its owner remains writable.
Opaque dynamic targets and unavailable procedure bodies cannot establish definite violations.
No automatic fix is offered because replacing a write with a copy changes program behavior.`,
    };
  }

  public getConfig() { return this.conf; }
  public setConfig(conf: ReadOnlyWriteConf) { this.conf = conf; }
  public initialize(reg: IRegistry) { this.reg = reg; return this; }

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }
    const syntax = new SyntaxLogic(this.reg, obj).run();
    return new ReadOnlyFlow(obj, syntax.spaghetti).run().map(f => {
      const message = `Write ${f.possible ? "may modify" : "modifies"} read-only storage through an alias (${f.origins.join(", ")})`;
      return Issue.atToken(f.file, f.token, message, this.getMetadata().key, f.possible ? Severity.Warning : this.conf.severity);
    });
  }
}
