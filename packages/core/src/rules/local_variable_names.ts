import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Structures from "../abap/3_structures/structures";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {StructureNode} from "../abap/nodes";
import {Token} from "../abap/1_lexer/tokens/_token";
import {NamingRuleConfig} from "./_naming_rule_config";
import {NameValidator} from "../utils/name_validator";
import {RuleTag} from "./_irule";

export class LocalVariableNamesConf extends NamingRuleConfig {
  /** The pattern for local variable names */
  public expectedData: string = "^L._.+$";
  /** The pattern for local constant names */
  public expectedConstant: string = "^LC_.+$";
  /** The pattern for field symbol names */
  public expectedFS: string = "^<L._.+>$";
}

export class LocalVariableNames extends ABAPRule {

  private conf = new LocalVariableNamesConf();

  public getMetadata() {
    return {
      key: "local_variable_names",
      title: "Local variable naming conventions",
      shortDescription: `
Allows you to enforce a pattern, such as a prefix, for local variables, constants and field symbols.
Regexes are case-insensitive.`,
      tags: [RuleTag.Naming],
    };
  }

  private getDescription(expected: string, actual: string): string {
    return this.conf.patternKind === "required" ?
      "Local variable name does not match pattern " + expected + ": " + actual :
      "Local variable name must not match pattern " + expected + ": " + actual;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LocalVariableNamesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    let ret: Issue[] = [];
    if (this.conf.patternKind === undefined) {
      this.conf.patternKind = "required";
    }
    const stru = file.getStructure();

    if (stru === undefined) {
      return [];
    }

    // inside METHOD, FORM, FUNCTION MODULE
    for (const node of stru.findAllStructures(Structures.Form)) {
      ret = ret.concat(this.checkLocals(node, file));
    }
    for (const node of stru.findAllStructures(Structures.Method)) {
      ret = ret.concat(this.checkLocals(node, file));
    }
    for (const node of stru.findAllStructures(Structures.FunctionModule)) {
      ret = ret.concat(this.checkLocals(node, file));
    }

    return ret;
  }

  private checkLocals(structure: StructureNode, file: ABAPFile): Issue[] {
    let ret: Issue[] = [];

    // data, field symbols
    for (const dat of structure.findAllStatements(Statements.Data)) {
      const parent = structure.findParent(dat);
      if (parent && parent.get() instanceof Structures.Data) {
        continue; // inside DATA BEGIN OF
      }
      const found = dat.findFirstExpression(Expressions.DefinitionName);
      if (found) {
        const token = found.getFirstToken();
        ret = ret.concat(this.checkName(token, file, this.conf.expectedData));
      }
    }

    // inline data
    for (const dat of structure.findAllExpressions(Expressions.InlineData)) {
      const found = dat.findFirstExpression(Expressions.TargetField);
      if (found) {
        const token = found.getFirstToken();
        ret = ret.concat(this.checkName(token, file, this.conf.expectedData));
      }
    }

    // data structures, data begin of, first level
    const dataStructures = structure.findAllStructures(Structures.Data);
    for (const struc of dataStructures) {
      // ignore nested DATA BEGIN
      const stat = struc.findFirstStatement(Statements.DataBegin);
      const found = stat?.findFirstExpression(Expressions.DefinitionName);
      if (found) {
        const token = found.getFirstToken();
        ret = ret.concat(this.checkName(token, file, this.conf.expectedData));
      }
    }

    for (const fieldsymbol of structure.findAllStatements(Statements.FieldSymbol)) {
      const found = fieldsymbol.findFirstExpression(Expressions.FieldSymbol);
      if (found) {
        const token = found.getFirstToken();
        ret = ret.concat(this.checkName(token, file, this.conf.expectedFS));
      }
    }

    // inline field symbols
    for (const fieldsymbol of structure.findAllExpressions(Expressions.InlineFS)) {
      const found = fieldsymbol.findFirstExpression(Expressions.TargetFieldSymbol);
      if (found) {
        const token = found.getFirstToken();
        ret = ret.concat(this.checkName(token, file, this.conf.expectedFS));
      }
    }

    const constants = structure.findAllStatements(Statements.Constant);
    for (const constant of constants) {
      const parent = structure.findParent(constant);
      if (parent && parent.get() instanceof Structures.Constants) {
        continue; // inside DATA BEGIN OF
      }
      const found = constant.findFirstExpression(Expressions.DefinitionName);
      if (found) {
        const token = found.getFirstToken();
        ret = ret.concat(this.checkName(token, file, this.conf.expectedConstant));
      }
    }

    return ret;
  }

  private checkName(token: Token, file: ABAPFile, expected: string): Issue[] {
    const ret: Issue[] = [];
    const regex = new RegExp(expected, "i");
    const name = token.getStr();
    if (NameValidator.violatesRule(name, regex, this.conf)) {
      const message = this.getDescription(expected, name);
      const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity);
      ret.push(issue);
    }
    return ret;
  }

}

