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
  private reg: IRegistry;
  private conf = new CheckTextElementsConf();
  private graph: IncludeGraph;

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

  public initialize(reg: IRegistry) {
    this.reg = reg;
    this.graph = new IncludeGraph(this.reg);
    return this;
  }

  public run(obj: IObject): Issue[] {
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
      let mainName: string | undefined = undefined;

      const mains = this.graph.listMainForInclude(file.getFilename());
      if (mains.length === 1) {
// todo, this only checks the first main
        mainName = mains[0];
        const main1 = this.reg.findObjectForFile(this.reg.getFileByName(mains[0])!)! as ABAPObject;
        texts = main1.getTexts();
      }

      const expressions = stru.findAllExpressionsMulti([Expressions.TextElement, Expressions.TextElementString]);

      for (const e of expressions) {
        if (!(e.get() instanceof Expressions.TextElement)) {
          continue;
        }

        const token = e.findFirstExpression(Expressions.TextElementKey)!.getFirstToken();
        const key = token.getStr();
        if (this.findKey(key, texts) === undefined) {
          const message = `Text element "${key}" not found` + (mainName ? ", " + mainName : "");
          output.push(Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity));
        }
      }

      for (const e of expressions) {
        if (!(e.get() instanceof Expressions.TextElementString)) {
          continue;
        }

        const token = e.findFirstExpression(Expressions.TextElementKey)!.getFirstToken();
        const code = e.getFirstToken().getStr();
        const key = token.getStr();
        let found = this.findKey(key, texts);
        if (found && code.startsWith("'")) {
          found = found.replace(/'/g, "''");
        }
        if (found === undefined) {
          const message = `Text element "${key}" not found` + (mainName ? ", " + mainName : "");
          output.push(Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity));
        } else if (code !== "'" + found + "'"
            && code !== "`" + found + "`") {
          output.push(Issue.atToken(file, token, "Text does not match text element", this.getMetadata().key, this.conf.severity));
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