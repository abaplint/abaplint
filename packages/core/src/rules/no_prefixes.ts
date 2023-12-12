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
  public data: string = "^[lg]._";
  /** STATICS, STATICS BEGIN OF */
  public statics: string = "";
  /** FIELD-SYMBOLS and inline FIELD-SYMBOLS(), case insensitive regex */
  public fieldSymbols: string = "";
  /** CONSTANTS, CONSTANTS BEGIN OF, case insensitive regex */
  public constants: string = "^[lg]c_";
  public types: string = "^ty_";
  public formParameters: string = "";
  /** importing, exporting, returning and changing parameters */
  public methodParameters: string = "^[ierc]._";
  public functionModuleParameters: string = "";
  /** SELECT-OPTIONS, case insensitive regex */
  public selectOptions: string = "";
  /** PARAMETERS, case insensitive regex */
  public parameters: string = "";
  public localClass: string = "";
  public localInterface: string = "";
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

    if (config.formParameters !== undefined && config.formParameters !== "") {
      ret.push(...this.checkFormParameters(structure, new RegExp(config.formParameters, "i"), file));
    }

    if (config.methodParameters !== undefined && config.methodParameters !== "") {
      ret.push(...this.checkMethodParameters(structure, new RegExp(config.methodParameters, "i"), file));
    }

    if (config.functionModuleParameters !== undefined && config.functionModuleParameters !== "") {
      ret.push(...this.checkFunctionModuleParameters(structure, new RegExp(config.functionModuleParameters, "i"), file));
    }

    if (config.selectOptions !== undefined && config.selectOptions !== "") {
      ret.push(...this.checkSelectOptions(structure, new RegExp(config.selectOptions, "i"), file));
    }

    if (config.parameters !== undefined && config.parameters !== "") {
      ret.push(...this.checkParameters(structure, new RegExp(config.parameters, "i"), file));
    }

    if (config.localClass !== undefined && config.localClass !== "") {
      ret.push(...this.checkLocalClass(structure, new RegExp(config.localClass, "i"), file));
    }
    if (config.localInterface !== undefined && config.localInterface !== "") {
      ret.push(...this.checkLocalInterface(structure, new RegExp(config.localInterface, "i"), file));
    }

    return ret;
  }

  private checkData(topNode: StructureNode, regex: RegExp, file: IFile): Issue[] {
    const ret: Issue[] = [];

    for (const data of topNode.findAllStatements(Statements.Data).concat(
      topNode.findAllStatements(Statements.DataBegin)).concat(
      topNode.findAllStatements(Statements.ClassDataBegin)).concat(
      topNode.findAllStatements(Statements.ClassData))) {

      let name = data.findFirstExpression(Expressions.DefinitionName)?.concatTokens() || "";
      if (name === "") {
        name = data.findFirstExpression(Expressions.NamespaceSimpleName)?.concatTokens() || "";
      }

      if (name !== "" && name.match(regex)) {
        const issue = Issue.atToken(file, data.getFirstToken(), MESSAGE, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    for (const data of topNode.findAllExpressions(Expressions.InlineData)) {
      const name = data.findFirstExpression(Expressions.TargetField)?.concatTokens() || "";
      if (name !== "" && name.match(regex)) {
        const issue = Issue.atToken(file, data.getFirstToken(), MESSAGE, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    return ret;
  }

  private checkStatics(topNode: StructureNode, regex: RegExp, file: IFile): Issue[] {
    const ret: Issue[] = [];

    for (const data of topNode.findAllStatements(Statements.Static).concat(
      topNode.findAllStatements(Statements.StaticBegin))) {

      const name = data.findFirstExpression(Expressions.DefinitionName)?.concatTokens() || "";
      if (name !== "" && name.match(regex)) {
        const issue = Issue.atToken(file, data.getFirstToken(), MESSAGE, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    return ret;
  }

  private checkFieldSymbols(_topNode: StructureNode, _regex: RegExp, _file: IFile): Issue[] {
    const ret: Issue[] = [];
// todo
    return ret;
  }

  private checkConstants(_topNode: StructureNode, _regex: RegExp, _file: IFile): Issue[] {
    const ret: Issue[] = [];
// todo
    return ret;
  }

  private checkTypes(_topNode: StructureNode, _regex: RegExp, _file: IFile): Issue[] {
    const ret: Issue[] = [];
// todo
// including ENUM and MESH?
    return ret;
  }

  private checkFormParameters(_topNode: StructureNode, _regex: RegExp, _file: IFile): Issue[] {
    const ret: Issue[] = [];
// todo
    return ret;
  }

  private checkMethodParameters(_topNode: StructureNode, _regex: RegExp, _file: IFile): Issue[] {
    const ret: Issue[] = [];
// todo
    return ret;
  }

  private checkFunctionModuleParameters(_topNode: StructureNode, _regex: RegExp, _file: IFile): Issue[] {
    const ret: Issue[] = [];
// todo
    return ret;
  }

  private checkSelectOptions(_topNode: StructureNode, _regex: RegExp, _file: IFile): Issue[] {
    const ret: Issue[] = [];
// todo
    return ret;
  }

  private checkParameters(_topNode: StructureNode, _regex: RegExp, _file: IFile): Issue[] {
    const ret: Issue[] = [];
// todo
    return ret;
  }

  private checkLocalClass(_topNode: StructureNode, _regex: RegExp, _file: IFile): Issue[] {
    const ret: Issue[] = [];
// todo
    return ret;
  }

  private checkLocalInterface(_topNode: StructureNode, _regex: RegExp, _file: IFile): Issue[] {
    const ret: Issue[] = [];
// todo
    return ret;
  }

}