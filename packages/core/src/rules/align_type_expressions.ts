import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
/*
import * as Expressions from "../abap/2_statements/expressions";
import {Position} from "../position";
import {StructureNode} from "../abap/nodes";
import {INode} from "../abap/nodes/_inode";
import {Statements} from "..";
import {EditHelper, IEdit} from "../edit_helper";
*/

export class AlignTypeExpressionsConf extends BasicRuleConfig {
}

export class AlignTypeExpressions extends ABAPRule {
  private conf = new AlignTypeExpressionsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "align_type_expressions",
      title: "Align TYPE expressions",
      shortDescription: `Align TYPE expressions in statements`,
      extendedInformation: `
Currently works for METHODS + BEGIN OF

Also note that clean ABAP does not recommend aligning TYPE clauses:
https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#dont-align-type-clauses`,
      tags: [RuleTag.SingleFile, RuleTag.Whitespace, RuleTag.Styleguide, RuleTag.Quickfix],
      badExample: `
TYPES: BEGIN OF foo,
         bar TYPE i,
         foobar TYPE i,
       END OF foo.`,
      goodExample: `
TYPES: BEGIN OF foo,
         bar    TYPE i,
         foobar TYPE i,
       END OF foo.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AlignTypeExpressionsConf) {
    this.conf = conf;
  }

  public runParsed(_file: ABAPFile) {
    const issues: Issue[] = [];
    // todo
    return issues;
  }

}
