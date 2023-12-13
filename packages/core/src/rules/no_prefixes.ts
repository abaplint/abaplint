import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {StructureNode} from "../abap/nodes";
import {IFile} from "../files/_ifile";

export class NoPrefixesConf extends BasicRuleConfig {
  /** DATA, CLASS-DATA, DATA BEGIN OF, CLASS-DATA BEGIN OF, FINAL(), DATA(), case insensitive regex */
  public data: string = "^[lg].?_";
  /** STATICS, STATICS BEGIN OF, case insensitive regex */
  public statics: string = "";
  /** FIELD-SYMBOLS and inline FIELD-SYMBOLS(), case insensitive regex */
  public fieldSymbols: string = "^<l.?_";
  /** CONSTANTS, CONSTANTS BEGIN OF, case insensitive regex */
  public constants: string = "^[lg]c_";
  /** TYPES, ENUM, MESH, case insensitive regex */
  public types: string = "^ty_";
  /** importing, exporting, returning and changing parameters, case insensitive regex */
  public methodParameters: string = "^[ierc].?_";

  // todo, public localClass: string = "";
  // todo, public localInterface: string = "";
  // todo, public functionModuleParameters: string = "";
  // todo, public parameters: string = "";
  // todo, public selectOptions: string = "";
  // todo, public formParameters: string = "";
}

const MESSAGE = "Avoid hungarian notation";

export class NoPrefixes extends ABAPRule {

  private conf = new NoPrefixesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_prefixes",
      title: "No Prefixes",
      shortDescription: `Dont use hungarian notation`,
      extendedInformation: `
https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#avoid-encodings-esp-hungarian-notation-and-prefixes

https://github.com/SAP/styleguides/blob/main/clean-abap/sub-sections/AvoidEncodings.md`,
      tags: [RuleTag.SingleFile, RuleTag.Styleguide],
      badExample: `DATA lv_foo TYPE i.`,
      goodExample: `DATA foo TYPE i.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoPrefixesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const ret: Issue[] = [];

    const config = this.getConfig();

    const structure = file.getStructure();
    if (structure === undefined) {
      // syntax error, skip
      return [];
    }

    if (config.data !== undefined && config.data !== "") {
      ret.push(...this.checkData(structure, new RegExp(config.data, "i"), file));
    }

    if (config.statics !== undefined && config.statics !== "") {
      ret.push(...this.checkStatics(structure, new RegExp(config.statics, "i"), file));
    }

    if (config.fieldSymbols !== undefined && config.fieldSymbols !== "") {
      ret.push(...this.checkFieldSymbols(structure, new RegExp(config.fieldSymbols, "i"), file));
    }

    if (config.constants !== undefined && config.constants !== "") {
      ret.push(...this.checkConstants(structure, new RegExp(config.constants, "i"), file));
    }

    if (config.types !== undefined && config.types !== "") {
      ret.push(...this.checkTypes(structure, new RegExp(config.types, "i"), file));
    }

    if (config.methodParameters !== undefined && config.methodParameters !== "") {
      ret.push(...this.checkMethodParameters(structure, new RegExp(config.methodParameters, "i"), file));
    }

    return ret;
  }

  private checkData(topNode: StructureNode, regex: RegExp, file: IFile): Issue[] {
    const ret: Issue[] = [];

    for (const data of topNode.findAllStatements(Statements.Data).concat(
      topNode.findAllStatements(Statements.DataBegin)).concat(
      topNode.findAllStatements(Statements.ClassDataBegin)).concat(
      topNode.findAllStatements(Statements.ClassData))) {

      const nameExpression = data.findFirstExpression(Expressions.DefinitionName)
        || data.findFirstExpression(Expressions.NamespaceSimpleName);
      const name = nameExpression?.concatTokens() || "";

      if (name !== "" && nameExpression && name.match(regex)) {
        const issue = Issue.atToken(file, nameExpression.getFirstToken(), MESSAGE, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    for (const data of topNode.findAllExpressions(Expressions.InlineData)) {
      const nameExpression = data.findFirstExpression(Expressions.TargetField);
      const name = nameExpression?.concatTokens() || "";
      if (name !== "" && nameExpression && name.match(regex)) {
        const issue = Issue.atToken(file, nameExpression.getFirstToken(), MESSAGE, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    return ret;
  }

  private checkStatics(topNode: StructureNode, regex: RegExp, file: IFile): Issue[] {
    const ret: Issue[] = [];

    for (const data of topNode.findAllStatements(Statements.Static).concat(
      topNode.findAllStatements(Statements.StaticBegin))) {

      const nameExpression = data.findFirstExpression(Expressions.DefinitionName);
      const name = nameExpression?.concatTokens() || "";
      if (name !== "" && nameExpression && name.match(regex)) {
        const issue = Issue.atToken(file, nameExpression.getFirstToken(), MESSAGE, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    return ret;
  }

  private checkFieldSymbols(topNode: StructureNode, regex: RegExp, file: IFile): Issue[] {
    const ret: Issue[] = [];

    for (const data of topNode.findAllStatements(Statements.FieldSymbol)) {
      const nameExpression = data.findFirstExpression(Expressions.FieldSymbol);
      const name = nameExpression?.concatTokens() || "";
      if (name !== "" && nameExpression && name.match(regex)) {
        const issue = Issue.atToken(file, nameExpression.getFirstToken(), MESSAGE, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    for (const data of topNode.findAllExpressions(Expressions.InlineFS)) {
      const nameExpression = data.findFirstExpression(Expressions.FieldSymbol);
      const name = nameExpression?.concatTokens() || "";
      if (name !== "" && nameExpression && name.match(regex)) {
        const issue = Issue.atToken(file, nameExpression.getFirstToken(), MESSAGE, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    return ret;
  }

  private checkConstants(topNode: StructureNode, regex: RegExp, file: IFile): Issue[] {
    const ret: Issue[] = [];

    for (const data of topNode.findAllStatements(Statements.Constant).concat(
      topNode.findAllStatements(Statements.ConstantBegin))) {

      const nameExpression = data.findFirstExpression(Expressions.DefinitionName);
      const name = nameExpression?.concatTokens() || "";
      if (name !== "" && nameExpression && name.match(regex)) {
        const issue = Issue.atToken(file, nameExpression.getFirstToken(), MESSAGE, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    return ret;
  }

  private checkTypes(topNode: StructureNode, regex: RegExp, file: IFile): Issue[] {
    const ret: Issue[] = [];

    for (const data of topNode.findAllStatements(Statements.Type).concat(
      topNode.findAllStatements(Statements.TypeEnum)).concat(
      topNode.findAllStatements(Statements.TypeEnumBegin)).concat(
      topNode.findAllStatements(Statements.TypeMesh)).concat(
      topNode.findAllStatements(Statements.TypeMeshBegin)).concat(
      topNode.findAllStatements(Statements.TypeBegin))) {

      const nameExpression = data.findFirstExpression(Expressions.NamespaceSimpleName);
      const name = nameExpression?.concatTokens() || "";
      if (name !== "" && nameExpression && name.match(regex)) {
        const issue = Issue.atToken(file, nameExpression.getFirstToken(), MESSAGE, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    return ret;
  }

  private checkMethodParameters(topNode: StructureNode, regex: RegExp, file: IFile): Issue[] {
    const ret: Issue[] = [];

    for (const method of topNode.findAllStatements(Statements.MethodDef)) {
      for (const def of method.findAllExpressions(Expressions.MethodParamName)) {
        const name = def.concatTokens();
        if (name !== "" && name.match(regex)) {
          const issue = Issue.atToken(file, def.getFirstToken(), MESSAGE, this.getMetadata().key, this.conf.severity);
          ret.push(issue);
        }
      }
    }

    return ret;
  }

}