import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {EditHelper} from "../edit_helper";
import {ABAPFile} from "../abap/abap_file";

const FORBIDDEN_TYPES = new Set(["XFELD", "SAP_BOOL", "BOOLE_D", "FLAG"]);

export class PreferAbapBoolConf extends BasicRuleConfig {
}

export class PreferAbapBool extends ABAPRule {
  private conf = new PreferAbapBoolConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_abap_bool",
      title: "Prefer abap_bool",
      shortDescription: `Use abap_bool instead of XFELD, SAP_BOOL, BOOLE_D, FLAG for boolean variables`,
      extendedInformation:
        `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#use-abap_bool-for-booleans`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `DATA foo TYPE xfeld.`,
      goodExample: `DATA foo TYPE abap_bool.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferAbapBoolConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    const statements = [
      ...structure.findAllStatements(Statements.Data),
      ...structure.findAllStatements(Statements.ClassData),
      ...structure.findAllStatements(Statements.Constant),
      ...structure.findAllStatements(Statements.Type),
      ...structure.findAllStatements(Statements.FieldSymbol),
    ];

    for (const stat of statements) {
      const typeNameExpr = stat.findFirstExpression(Expressions.TypeName);
      if (typeNameExpr === undefined) {
        continue;
      }

      const typeName = typeNameExpr.concatTokens().toUpperCase();
      if (FORBIDDEN_TYPES.has(typeName) === false) {
        continue;
      }

      const token = typeNameExpr.getFirstToken();
      const fix = EditHelper.replaceToken(file, token, "abap_bool");
      issues.push(Issue.atToken(
        file, token,
        `Use abap_bool instead of ${typeName}`,
        this.getMetadata().key, this.conf.severity, fix));
    }

    return issues;
  }
}
