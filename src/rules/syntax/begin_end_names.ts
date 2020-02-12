import {Issue} from "../../issue";
import {ABAPRule} from "./../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";
import * as Structures from "../../abap/structures";
import * as Expressions from "../../abap/expressions";
import * as Statements from "../../abap/statements";
import {StructureNode} from "../../abap/nodes";
import {IStructure} from "../../abap/structures/_structure";
import {Statement} from "../../abap/statements/_statement";

/** Check BEGIN OF and END OF names match */
export class BeginEndNamesConf extends BasicRuleConfig {
}

export class BeginEndNames extends ABAPRule {
  private conf = new BeginEndNamesConf();

  public getKey(): string {
    return "begin_end_names";
  }

  private getDescription(): string {
    return "BEGIN END names must match";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: BeginEndNamesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    let output: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    output = output.concat(this.test(struc, Structures.Data, Statements.DataBegin, Statements.DataEnd, file));
    output = output.concat(this.test(struc, Structures.ClassData, Statements.ClassDataBegin, Statements.ClassDataEnd, file));
    output = output.concat(this.test(struc, Structures.Constants, Statements.ConstantBegin, Statements.ConstantEnd, file));
    output = output.concat(this.test(struc, Structures.Statics, Statements.StaticBegin, Statements.StaticEnd, file));
    output = output.concat(this.test(struc, Structures.TypeEnum, Statements.TypeEnumBegin, Statements.TypeEnumEnd, file));
    output = output.concat(this.test(struc, Structures.Types, Statements.TypeBegin, Statements.TypeEnd, file));

    return output;
  }

  private test(stru: StructureNode, type: new() => IStructure, b: new() => Statement, e: new() => Statement, file: ABAPFile): Issue[] {
    let output: Issue[] = [];

    for (const sub of stru.findAllStructures(type)) {
      const begin = sub.findDirectStatements(b)[0].findFirstExpression(Expressions.NamespaceSimpleName)!;
      const first = begin.getFirstToken();

      const end = sub.findDirectStatements(e)[0].findFirstExpression(Expressions.NamespaceSimpleName);
      if (end === undefined) {
        continue;
      }
      const last = end.getFirstToken();

      if (first.getStr().toUpperCase() !== last.getStr().toUpperCase()) {
        const issue = Issue.atToken(file, first, this.getDescription(), this.getKey());
        output.push(issue);
      }

      // begin recursion
      for (const c of sub.findDirectStructures(type)) {
        output = output.concat(this.test(c, type, b, e, file));
      }
    }

    return output;
  }

}