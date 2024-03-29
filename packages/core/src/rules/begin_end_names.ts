import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Structures from "../abap/3_structures/structures";
import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {StructureNode} from "../abap/nodes";
import {IStructure} from "../abap/3_structures/structures/_structure";
import {IStatement, Unknown} from "../abap/2_statements/statements/_statement";
import {IRuleMetadata, RuleTag} from "./_irule";
import {EditHelper} from "../edit_helper";
import {ABAPFile} from "../abap/abap_file";

export class BeginEndNamesConf extends BasicRuleConfig {
}

export class BeginEndNames extends ABAPRule {
  private conf = new BeginEndNamesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "begin_end_names",
      title: "Check BEGIN END names",
      shortDescription: `Check BEGIN OF and END OF names match, plus there must be statements between BEGIN and END`,
      tags: [RuleTag.Syntax, RuleTag.Quickfix, RuleTag.SingleFile],
      badExample: `DATA: BEGIN OF stru,
        field TYPE i,
      END OF structure_not_the_same.`,
      goodExample: `DATA: BEGIN OF stru,
        field TYPE i,
      END OF stru.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: BeginEndNamesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const output: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    const containsUnknown = file.getStatements().some(s => s.get() instanceof Unknown);
    if (containsUnknown === true) {
      return [];
    }

    output.push(...this.test(struc, Structures.Data, Statements.DataBegin, Statements.DataEnd, file));
    output.push(...this.test(struc, Structures.ClassData, Statements.ClassDataBegin, Statements.ClassDataEnd, file));
    output.push(...this.test(struc, Structures.Constants, Statements.ConstantBegin, Statements.ConstantEnd, file));
    output.push(...this.test(struc, Structures.Statics, Statements.StaticBegin, Statements.StaticEnd, file));
    output.push(...this.test(struc, Structures.TypeEnum, Statements.TypeEnumBegin, Statements.TypeEnumEnd, file));
    output.push(...this.test(struc, Structures.Types, Statements.TypeBegin, Statements.TypeEnd, file));

    return output;
  }

  private test(stru: StructureNode, type: new() => IStructure, b: new() => IStatement, e: new() => IStatement, file: ABAPFile): Issue[] {
    const output: Issue[] = [];

    for (const sub of stru.findAllStructuresRecursive(type)) {
      let begin = sub.findDirectStatements(b)[0].findFirstExpression(Expressions.NamespaceSimpleName);
      if (begin === undefined) {
        begin = sub.findDirectStatements(b)[0].findFirstExpression(Expressions.DefinitionName);
      }
      if (begin === undefined) {
        continue;
      }
      const first = begin.getFirstToken();

      let end = sub.findDirectStatements(e)[0].findFirstExpression(Expressions.NamespaceSimpleName);
      if (end === undefined) {
        end = sub.findDirectStatements(e)[0].findFirstExpression(Expressions.DefinitionName);
      }
      if (end === undefined) {
        continue;
      }
      const last = end.getFirstToken();

      if (first.getStr().toUpperCase() !== last.getStr().toUpperCase()) {
        const fix = EditHelper.replaceRange(file, last.getStart(), last.getEnd(), first.getStr());
        const message = "BEGIN END names must match";
        const issue = Issue.atToken(file, first, message, this.getMetadata().key, this.conf.severity, fix);
        output.push(issue);
      }

      if (sub.getChildren().length === 2) {
        const message = "There must be statements between BEGIN and END";
        const issue = Issue.atToken(file, first, message, this.getMetadata().key, this.conf.severity);
        output.push(issue);
      }
    }

    return output;
  }

}