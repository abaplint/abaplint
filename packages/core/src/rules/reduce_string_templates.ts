import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
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
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ReduceStringTemplatesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: IRegistry, _obj: IObject) {
    const issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    for (const template of structure.findAllExpressions(Expressions.StringTemplate)) {
      for (const source of template.findDirectExpressions(Expressions.Source)) {
        for (const second of source.findDirectExpressions(Expressions.StringTemplate)) {
          issues.push(Issue.atToken(file, second.getFirstToken(), "Nested string templates, reduce", this.getMetadata().key));
        }

        for (const constant of source.findDirectExpressions(Expressions.Constant)) {
          for (const constantString of constant.findDirectExpressions(Expressions.ConstantString)) {
            issues.push(Issue.atToken(file, constantString.getFirstToken(), "Constant string in text template, reduce", this.getMetadata().key));
          }
        }
      }
    }

    return issues;
  }

}