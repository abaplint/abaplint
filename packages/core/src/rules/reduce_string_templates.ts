import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {IRuleMetadata} from "./_irule";

export class ReduceStringTemplatesConf extends BasicRuleConfig {
}

export class ReduceStringTemplates extends ABAPRule {

  private conf = new ReduceStringTemplatesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "reduce_string_templates",
      title: "Reduce string templates",
      shortDescription: `Checks for string templates`,
      tags: [],
      badExample: `WRITE |{ |sdf| }|.\nWRITE |{ 'sdf' }|.`,
      goodExample: `WRITE |sdf|.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ReduceStringTemplatesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _obj: IObject) {
    const issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    for (const template of structure.findAllExpressions(Expressions.StringTemplate)) {
      for (const source of template.findDirectExpressions(Expressions.Source)) {
        for (const second of source.findDirectExpressions(Expressions.StringTemplate)) {
          issues.push(Issue.atToken(file, second.getFirstToken(), "Nested string templates, reduce", this.getMetadata().key, this.conf.severity));
        }

        for (const constant of source.findDirectExpressions(Expressions.Constant)) {
          for (const constantString of constant.findDirectExpressions(Expressions.ConstantString)) {
            issues.push(Issue.atToken(file, constantString.getFirstToken(), "Constant string in text template, reduce", this.getMetadata().key, this.conf.severity));
          }
        }
      }
    }

    for (const source of structure.findAllExpressions(Expressions.Source)) {
      const children = source.getChildren();
      if (children.length !== 3) {
        continue;
      } else if (!(children[0].get() instanceof Expressions.StringTemplate)) {
        continue;
      } else if (children[1].getFirstToken().getStr() !== "&&") {
        continue;
      } else if (!(children[2].get() instanceof Expressions.Source)) {
        continue;
      }

      const sub = children[2].getChildren();
      if (sub.length !== 1) {
        continue;
      }

      const start = children[0].getFirstToken().getStart();
      const end = sub[0].getLastToken().getEnd();
      if (start.getRow() === end.getRow()) {
        const message = "Reduce template, remove \"&&\"";
        issues.push(Issue.atToken(file, children[1].getFirstToken(), message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

}