import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/2_statements/statements";

export class ChainMainlyDeclarationsConf extends BasicRuleConfig {
}

export class ChainMainlyDeclarations extends ABAPRule {

  private conf = new ChainMainlyDeclarationsConf();

  public getMetadata() {
    return {
      key: "chain_mainly_declarations",
      title: "Chain mainly declarations",
      shortDescription: `Chain mainly declarations`,
      extendedInformation: `https://docs.abapopenchecks.org/checks/23/`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ChainMainlyDeclarationsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    let previousRow: number | undefined;
    for (const n of stru.findAllStatementNodes()) {
      const colon = n.getColon();
      if (colon === undefined) {
        continue;
      }
      if (previousRow === colon.getStart().getRow()) {
        continue;
      }
      const s = n.get();
      if (s instanceof Statements.Write
          || s instanceof Statements.Type
          || s instanceof Statements.TypeBegin
          || s instanceof Statements.TypeEnd
          || s instanceof Statements.ClassData
          || s instanceof Statements.ClassDataBegin
          || s instanceof Statements.ClassDataEnd
          || s instanceof Statements.Static
          || s instanceof Statements.Move
          || s instanceof Statements.MethodDef
          || s instanceof Statements.Ranges
          || s instanceof Statements.Refresh
          || s instanceof Statements.Unassign
          || s instanceof Statements.Clear
          || s instanceof Statements.Hide
          || s instanceof Statements.Events
          || s instanceof Statements.Free
          || s instanceof Statements.Constant
          || s instanceof Statements.ConstantBegin
          || s instanceof Statements.ConstantEnd
          || s instanceof Statements.Tables
          || s instanceof Statements.Parameter
          || s instanceof Statements.InterfaceDef
          || s instanceof Statements.SelectOption
          || s instanceof Statements.SelectionScreen
          || s instanceof Statements.Aliases
          || s instanceof Statements.Include
          || s instanceof Statements.TypePools
          || s instanceof Statements.Data
          || s instanceof Statements.DataBegin
          || s instanceof Statements.DataEnd
          || s instanceof Statements.FieldSymbol) {
        continue;
      }

      const message = "Chain mainly declarations";
      issues.push(Issue.atToken(file, n.getFirstToken(), message, this.getMetadata().key));

      previousRow = n.getColon()!.getStart().getRow();
    }

    return issues;
  }

}
