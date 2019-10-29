import {IRule} from "./_irule";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Expressions from "../abap/expressions";
import {ABAPObject, ITextElement} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {FunctionGroup} from "../objects";

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

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)
        || obj instanceof FunctionGroup) { // todo
      return [];
    }

    const output: Issue[] = [];
    const abap = obj as ABAPObject;
    const texts = abap.getTexts();

    for (const file of abap.getABAPFiles()) {
      const stru = file.getStructure();
      if (stru === undefined) {
        continue;
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
        const key = token.getStr();
        const found = this.findKey(key, texts);
        if (found === undefined) {
          output.push(Issue.atToken(file, token, "Text element not found", this.getKey()));
        } else if (e.getFirstToken().getStr() !== "'" + found + "'"
            && e.getFirstToken().getStr() !== "`" + found + "`") {
          output.push(Issue.atToken(file, token, "Text does not match text element", this.getKey()));
        }
      }
    }

    return output;
  }

  private findKey(key: string, texts: ITextElement[]): string | undefined {
    for (const t of texts) {
      if (key.toUpperCase() === t.key) {
        return t.text;
      }
    }
    return undefined;
  }

}