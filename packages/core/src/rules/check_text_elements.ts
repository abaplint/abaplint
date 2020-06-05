import {IRule} from "./_irule";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPObject, ITextElement} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {IncludeGraph} from "../utils/include_graph";

export class CheckTextElementsConf extends BasicRuleConfig {
}

export class CheckTextElements implements IRule {

  private conf = new CheckTextElementsConf();

  public getMetadata() {
    return {
      key: "check_text_elements",
      title: "Check text elements",
      shortDescription: `Check text elements exists or matches code`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckTextElementsConf) {
    this.conf = conf;
  }

  public run(obj: IObject, reg: IRegistry): Issue[] {
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

      const mains = new IncludeGraph(reg).listMainForInclude(file.getFilename());
      if (mains.length === 1) {
// todo, this only checks the first main
        const main1 = reg.findObjectForFile(reg.getFileByName(mains[0])!)! as ABAPObject;
        texts = main1.getTexts();
      }

      for (const e of stru.findAllExpressions(Expressions.TextElement)) {
        const token = e.findFirstExpression(Expressions.TextElementKey)!.getFirstToken();
        const key = token.getStr();
        if (this.findKey(key, texts) === undefined) {
          const message = `Text element "${key}" not found`;
          output.push(Issue.atToken(file, token, message, this.getMetadata().key));
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
          output.push(Issue.atToken(file, token, `Text element "${key}" not found`, this.getMetadata().key));
        } else if (code !== "'" + found + "'"
            && code !== "`" + found + "`") {
          output.push(Issue.atToken(file, token, "Text does not match text element", this.getMetadata().key));
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