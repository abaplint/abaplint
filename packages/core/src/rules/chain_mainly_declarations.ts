import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/2_statements/statements";
import {IRuleMetadata} from "./_irule";

export class ChainMainlyDeclarationsConf extends BasicRuleConfig {
  /** Allow definition statements to be chained */
  public definitions: boolean = true;
  /** Allow WRITE statements to be chained */
  public write: boolean = true;
  /** Allow MOVE statements to be chained */
  public move: boolean = true;
  /** Allow REFRESH statements to be chained */
  public refresh: boolean = true;
  /** Allow UNASSIGN statements to be chained */
  public unassign: boolean = true;
  /** Allow CLEAR statements to be chained */
  public clear: boolean = true;
  /** Allow HIDE statements to be chained */
  public hide: boolean = true;
  /** Allow FREE statements to be chained */
  public free: boolean = true;
  /** Allow INCLUDE statements to be chained */
  public include: boolean = true;
  /** Allow CHECK statements to be chained */
  public check: boolean = true;
}

export class ChainMainlyDeclarations extends ABAPRule {

  private conf = new ChainMainlyDeclarationsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "chain_mainly_declarations",
      title: "Chain mainly declarations",
      shortDescription: `Chain mainly declarations, allows chaining for the configured statements, reports errors for other statements.`,
      extendedInformation: `
https://docs.abapopenchecks.org/checks/23/

https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-US/abenchained_statements_guidl.htm
`,
      badExample: `CALL METHOD: bar.`,
      goodExample: `CALL METHOD bar.`,
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


      if (this.conf.definitions === true
          && (s instanceof Statements.ClassData
          || s instanceof Statements.ClassDataBegin
          || s instanceof Statements.ClassDataEnd
          || s instanceof Statements.Static
          || s instanceof Statements.StaticBegin
          || s instanceof Statements.StaticEnd
          || s instanceof Statements.Local
          || s instanceof Statements.Constant
          || s instanceof Statements.ConstantBegin
          || s instanceof Statements.ConstantEnd
          || s instanceof Statements.Controls
          || s instanceof Statements.Parameter
          || s instanceof Statements.SelectOption
          || s instanceof Statements.SelectionScreen
          || s instanceof Statements.Aliases
          || s instanceof Statements.Tables
          || s instanceof Statements.MethodDef
          || s instanceof Statements.InterfaceDef
          || s instanceof Statements.Type
          || s instanceof Statements.TypeBegin
          || s instanceof Statements.TypeEnd
          || s instanceof Statements.Events
          || s instanceof Statements.Ranges
          || s instanceof Statements.TypePools
          || s instanceof Statements.FieldSymbol
          || s instanceof Statements.Data
          || s instanceof Statements.DataBegin
          || s instanceof Statements.DataEnd)) {
        continue;
      } else if (this.conf.write === true && s instanceof Statements.Write) {
        continue;
      } else if (this.conf.move === true && s instanceof Statements.Move) {
        continue;
      } else if (this.conf.refresh === true && s instanceof Statements.Refresh) {
        continue;
      } else if (this.conf.unassign === true && s instanceof Statements.Unassign) {
        continue;
      } else if (this.conf.clear === true && s instanceof Statements.Clear) {
        continue;
      } else if (this.conf.hide === true && s instanceof Statements.Hide) {
        continue;
      } else if (this.conf.free === true && s instanceof Statements.Free) {
        continue;
      } else if (this.conf.include === true && s instanceof Statements.Include) {
        continue;
      } else if (this.conf.check === true && s instanceof Statements.Check) {
        continue;
      }

      const message = "Chain mainly declarations";
      issues.push(Issue.atToken(file, n.getFirstToken(), message, this.getMetadata().key, this.conf.severity));

      previousRow = n.getColon()!.getStart().getRow();
    }

    return issues;
  }

}
