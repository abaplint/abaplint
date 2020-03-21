import {IRule} from "./_irule";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPObject, ITextElement} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {Registry} from "../registry";

/** Check text elements */
export class CheckTextElementsConf extends BasicRuleConfig {
}

export class CheckTextElements implements IRule {

  private conf = new CheckTextElementsConf();

  public getKey(): string {
    return "check_text_elements";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckTextElementsConf) {
    this.conf = conf;
  }

  public run(obj: IObject, reg: Registry): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const output: Issue[] = [];

    for (const file of obj.getABAPFiles()) {
      const stru = file.getStructure();
      if (stru === undefined) {
        continue;
      }

      let texts = obj.getTexts();

      const mains = reg.getIncludeGraph().listMainForInclude(file.getFilename());
      if (mains.length === 1) {
// todo, this only checks the first main
        const main1 = reg.findObjectForFile(reg.getFileByName(mains[0])!)! as ABAPObject;
        texts = main1.getTexts();
      }

      for (const e of stru.findAllExpressions(Expressions.TextElement)) {
        const token = e.findFirstExpression(Expressions.TextElementKey)!.getFirstToken();
        const key = token.getStr();
        if (this.findKey(key, texts) === undefined) {
          output.push(Issue.atToken(file, token, "Text element not found", this.getKey()));
        }
      }

      for (const e of stru.findAllExpressions(Expressions.TextElementString)) {
        const token = e.findFirstExpression(Expressions.TextElementKey)!.getFirstToken();
        const code = e.getFirstToken().getStr();
        const key = token.getStr();
        let found = this.findKey(key, texts);
        if (found && code.startsWith("'")) {
          found = found.replace(/'/g, "''");
        }
        if (found === undefined) {
          output.push(Issue.atToken(file, token, "Text element not found", this.getKey()));
        } else if (code !== "'" + found + "'"
            && code !== "`" + found + "`") {
          output.push(Issue.atToken(file, token, "Text does not match text element", this.getKey()));
        }
      }
    }

    return output;
  }

  private findKey(key: string, texts: readonly ITextElement[]): string | undefined {
    for (const t of texts) {
      if (key.toUpperCase() === t.key) {
        return t.text;
      }
    }
    return undefined;
  }

}