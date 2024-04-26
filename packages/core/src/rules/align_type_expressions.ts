import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import * as Structures from "../abap/3_structures/structures";
import * as Statements from "../abap/2_statements/statements";
import {Position} from "../position";
import {INode} from "../abap/nodes/_inode";
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

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return issues; // parser error
    }

    const types = stru.findAllStructuresRecursive(Structures.Types);
    for (const t of types) {
      const fields: {name: INode, after: Position}[] = [];
      let column = 0;
      const st = t.findDirectStatements(Statements.Type);
      for (const s of st) {
        const name = s.getChildren()[1];
        fields.push({
          name: name,
          after: s.getChildren()[2].getFirstToken().getStart()});
        column = Math.max(column, name.getFirstToken().getEnd().getCol() + 1);
      }

      for (const f of fields) {
        if (f.after.getCol() !== column) {
//          const fix = this.buildFix(f.name, column);
          const message = `Align TYPE expressions to column ${column}`;
          const issue = Issue.atPosition(file, f.after, message, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }
    }

    return issues;
  }

}
