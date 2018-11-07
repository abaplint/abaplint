import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Structures from "../abap/structures";
import * as Statements from "../abap/statements";
import * as Expressions from "../abap/expressions";
import {StructureNode} from "../abap/nodes";
import {Token} from "../abap/tokens/_token";


export class LocalVariableNamesConf {
  public enabled: boolean = true;
  public expectedData: string = "^L._.*$";
  public expectedFS: string = "^<L._.*>$";
}

export class LocalVariableNames extends ABAPRule {

  private conf = new LocalVariableNamesConf();

  public getKey(): string {
    return "local_variable_names";
  }

  public getDescription(): string {
    return "Local Variable Names";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LocalVariableNamesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    let ret: Issue[] = [];

    if (file.getStructure() == undefined) {
      return [];
    }

// inside METHOD, FORM, FUNCTION MODULE
    for (let node of file.getStructure().findAllStructures(Structures.Form)) {
      ret = ret.concat(this.checkLocals(node, file));
    }
    for (let node of file.getStructure().findAllStructures(Structures.Method)) {
      ret = ret.concat(this.checkLocals(node, file));
    }
    for (let node of file.getStructure().findAllStructures(Structures.FunctionModule)) {
      ret = ret.concat(this.checkLocals(node, file));
    }

    return ret;
  }

  private checkLocals(structure: StructureNode, file: ABAPFile): Issue[] {
    let ret: Issue[] = [];

// data, field symbols

    let data = structure.findAllStatements(Statements.Data);
    for (let dat of data) {
      if (structure.findParent(dat).get() instanceof Structures.Data) {
        continue; // inside DATA BEGIN OF
      }
      const token = dat.findFirstExpression(Expressions.NamespaceSimpleName).getFirstToken().get();
      ret = ret.concat(this.checkName(token, file, this.conf.expectedData));
    }

    let datab = structure.findAllStatements(Statements.DataBegin);
    for (let dat of datab) {
      const token = dat.findFirstExpression(Expressions.NamespaceSimpleName).getFirstToken().get();
      ret = ret.concat(this.checkName(token, file, this.conf.expectedData));
    }

    let fieldsymbols = structure.findAllStatements(Statements.FieldSymbol);
    for (let fieldsymbol of fieldsymbols) {
      const token = fieldsymbol.findFirstExpression(Expressions.FieldSymbol).getFirstToken().get();
      ret = ret.concat(this.checkName(token, file, this.conf.expectedFS));
    }

// todo: inline data, inline field symbols
// todo: DATA BEGIN OF

    return ret;
  }

  private checkName(token: Token, file: ABAPFile, expected: string): Issue[] {
    let ret: Issue[] = [];
    const regex = new RegExp(expected, "i");
    const name = token.getStr();
    if (regex.test(name) === false) {
      const message = "Bad local variable name \"" + name + "\" expected \"" + expected + "\"";
      let issue = new Issue({file, message, start: token.getPos()});
      ret.push(issue);
    }
    return ret;
  }

}

