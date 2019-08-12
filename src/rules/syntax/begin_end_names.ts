import {Issue} from "../../issue";
import {ABAPRule} from "./../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";
import * as Structures from "../../abap/structures";
import * as Expressions from "../../abap/expressions";
import * as Statements from "../../abap/statements";
import {StructureNode} from "../../abap/nodes";
import {Structure} from "../../abap/structures/_structure";
import {Statement} from "../../abap/statements/_statement";

export class BeginEndNamesConf extends BasicRuleConfig {
}

export class BeginEndNames extends ABAPRule {
  private conf = new BeginEndNamesConf();

  public getKey(): string {
    return "begin_end_names";
  }

  public getDescription(): string {
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

  private test(stru: StructureNode, type: new() => Structure, b: new() => Statement, e: new() => Statement, file: ABAPFile): Issue[] {
    const output: Issue[] = [];

    for (const sub of stru.findAllStructures(type)) {
      const begin = sub.findDirectStatements(b)[0].findFirstExpression(Expressions.NamespaceSimpleName)!;
      const first = begin.getFirstToken();

      const end = sub.findDirectStatements(e)[0].findFirstExpression(Expressions.NamespaceSimpleName)!;
      const last = end.getFirstToken();

      if (first.getStr().toUpperCase() !== last.getStr().toUpperCase()) {
        const issue = new Issue({
          file,
          message: this.getDescription(),
          key: this.getKey(),
          start: first.getStart(),
          end: first.getEnd(),
        });
        output.push(issue);
      }
    }

    return output;
  }

}