import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Structures from "../abap/structures";
import * as Statements from "../abap/statements";
import * as Expressions from "../abap/expressions";
import {StructureNode} from "../abap/nodes";
import {Token} from "../abap/tokens/_token";
import {NamingRuleConfig} from "./_naming_rule_config";
import {NameValidator} from "../utils/name_validator";

/** Allows you to enforce a pattern, such as a prefix, for local variables, constants and field symbols. */
export class LocalVariableNamesConf extends NamingRuleConfig {
  /** The pattern for local variable names */
  public expectedData: string = "^L._.*$";
  /** The pattern for local constant names */
  public expectedConstant: string = "^LC_.*$";
  /** The pattern for field symbol names */
  public expectedFS: string = "^<L._.*>$";
}

export class LocalVariableNames extends ABAPRule {

  private conf = new LocalVariableNamesConf();

  public getKey(): string {
    return "local_variable_names";
  }

  public getDescription(expected: string, actual: string): string {
    return this.conf.patternKind === "required" ?
     "Local variable name does not match pattern " + expected + ": " + actual :
     "Local variable name must not match pattern " + expected + ": " + actual ;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LocalVariableNamesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    let ret: Issue[] = [];
    const stru = file.getStructure();

    if (stru == undefined) {
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

    const data = structure.findAllStatements(Statements.Data);
    for (const dat of data) {
      const parent = structure.findParent(dat);
      if (parent && parent.get() instanceof Structures.Data) {
        continue; // inside DATA BEGIN OF
      }
      const found = dat.findFirstExpression(Expressions.NamespaceSimpleName);
      if (found) {
        const token = found.getFirstToken();
        ret = ret.concat(this.checkName(token, file, this.conf.expectedData));
      }
    }

    const datab = structure.findAllStatements(Statements.DataBegin);
    for (const dat of datab) {
      const found = dat.findFirstExpression(Expressions.NamespaceSimpleName);
      if (found) {
        const token = found.getFirstToken();
        ret = ret.concat(this.checkName(token, file, this.conf.expectedData));
      }
    }

    const fieldsymbols = structure.findAllStatements(Statements.FieldSymbol);
    for (const fieldsymbol of fieldsymbols) {
      const found = fieldsymbol.findFirstExpression(Expressions.FieldSymbol);
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
      const found = constant.findFirstExpression(Expressions.NamespaceSimpleName);
      if (found) {
        const token = found.getFirstToken();
        ret = ret.concat(this.checkName(token, file, this.conf.expectedConstant));
      }
    }

// todo: inline data, inline field symbols
// todo: DATA BEGIN OF

    return ret;
  }

  private checkName(token: Token, file: ABAPFile, expected: string): Issue[] {
    const ret: Issue[] = [];
    const regex = new RegExp(expected, "i");
    const name = token.getStr();
    if (NameValidator.violatesRule(name, regex, this.conf)) {
      const message = this.getDescription(expected, name);
      const issue = new Issue({file, message, key: this.getKey(), start: token.getStart()});
      ret.push(issue);
    }
    return ret;
  }

}

