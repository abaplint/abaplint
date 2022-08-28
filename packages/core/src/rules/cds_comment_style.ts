import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {DataDefinition} from "../objects";
import {CDSLexer} from "../cds/cds_lexer";
import {Comment} from "../abap/1_lexer/tokens";

export class CDSCommentStyleConf extends BasicRuleConfig {
}

export class CDSCommentStyle implements IRule {
  private conf = new CDSCommentStyleConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "cds_comment_style",
      title: "CDS Comment Style",
      shortDescription: `Check for obsolete comment style`,
      extendedInformation: `Check for obsolete comment style

https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-us/abencds_general_syntax_rules.htm`,
      tags: [RuleTag.SingleFile],
      badExample: "-- this is a comment",
      goodExample: "// this is a comment",
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CDSCommentStyleConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry): IRule {
    return this;
  }

  public run(object: IObject): Issue[] {
    const issues: Issue[] = [];

    if (object.getType() === "DDLS" && object instanceof DataDefinition) {
      const file = object.findSourceFile();
      if (file === undefined) {
        return issues;
      }
      const tokens = CDSLexer.run(file);
      for (const t of tokens) {
        if (t instanceof Comment && t.getStr().startsWith("--")) {
          issues.push(Issue.atToken(file, t, `Use "//" for comments instead of "--"`, this.getMetadata().key, this.getConfig().severity));
        }
      }
    }

    return issues;
  }

}