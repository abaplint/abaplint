import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {Visibility} from "../abap/4_file_information/visibility";
import {InfoMethodDefinition} from "../abap/4_file_information/_abap_file_information";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Position} from "../position";

export class AbapdocConf extends BasicRuleConfig {
  /** Check local classes and interfaces for abapdoc. */
  public checkLocal: boolean = false;
  public classDefinition: boolean = false;
  public interfaceDefinition: boolean = false;
}

export class Abapdoc extends ABAPRule {

  private conf = new AbapdocConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "abapdoc",
      title: "Check abapdoc",
      shortDescription: `Various checks regarding abapdoc.`,
      extendedInformation: `Base rule checks for existence of abapdoc for public class methods and all interface methods.

Plus class and interface definitions.

https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#abap-doc-only-for-public-apis`,
      tags: [RuleTag.SingleFile, RuleTag.Styleguide],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AbapdocConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];
    const rows = file.getRawRows();
    const regexEmptyTags = '^\\"! .*<[^/>]*><\\/';
    const regexEmptyAbapdoc = '^\\"!.+$';
    const regexEmptyParameterName = '^\\"! @parameter .+\\|';

    let methods: InfoMethodDefinition[] = [];
    for (const classDef of file.getInfo().listClassDefinitions()) {
      if (this.conf.checkLocal === false && classDef.isLocal === true) {
        continue;
      }
      methods = methods.concat(classDef.methods.filter(m => m.visibility === Visibility.Public));
      if (this.getConfig().classDefinition === true) {
        const previousRow = classDef.identifier.getStart().getRow() - 2;
        if (rows[previousRow]?.trim().substring(0, 2) !== "\"!") {
          const message = "Missing ABAP Doc for class " + classDef.identifier.getToken().getStr();
          const issue = Issue.atIdentifier(classDef.identifier, message, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }
    }

    for (const interfaceDef of file.getInfo().listInterfaceDefinitions()) {
      if (this.conf.checkLocal === false && interfaceDef.isLocal === true) {
        continue;
      }
      methods = methods.concat(interfaceDef.methods);

      if (this.getConfig().interfaceDefinition === true) {
        const previousRow = interfaceDef.identifier.getStart().getRow() - 2;
        if (rows[previousRow]?.trim().substring(0, 2) !== "\"!") {
          const message = "Missing ABAP Doc for interface " + interfaceDef.identifier.getToken().getStr();
          const issue = Issue.atIdentifier(interfaceDef.identifier, message, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }
    }

    for (const method of methods) {
      if (method.isRedefinition === true) {
        continue;
      }
      const previousRowsTexts = this.getAbapdoc(rows, method.identifier.getStart());
      if (previousRowsTexts === undefined) {
        continue;
      }
      for (const rowText of previousRowsTexts) {
        if (rowText.trim().match(regexEmptyTags) !== null) {
          const message = "Empty tag(s) in ABAP Doc for method " + method.identifier.getToken().getStr() + " (" + rowText + ")";
          const issue = Issue.atIdentifier(method.identifier, message, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
        if (rowText.trim().match(regexEmptyAbapdoc) === null && previousRowsTexts.indexOf(rowText) === previousRowsTexts.length - 1) {
          const message = "Missing ABAP Doc for method " + method.identifier.getToken().getStr() + " (" + rowText + ")";
          const issue = Issue.atIdentifier(method.identifier, message, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
        if (rowText.trim().match(regexEmptyParameterName) !== null) {
          const message = "Missing ABAP Doc parameter name for method " + method.identifier.getToken().getStr() + " (" + rowText + ")";
          const issue = Issue.atIdentifier(method.identifier, message, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }

      }

    }
    return issues;
  }

  private getAbapdoc(rows: readonly string[], pos: Position): string[] {
    let previousRow = pos.getRow() - 2;
    let rowText = rows[previousRow].trim().toUpperCase();
    const text: string[] = [];

    if (rowText === "METHODS" || rowText === "CLASS-METHODS") {
      previousRow--;
      rowText = rows[previousRow].trim().toUpperCase();
    }
    text.push(rowText);
    //we need to push the first row despite if it is actually an abapdoc or not
    //if the first row above a method is abapdoc then try to get the rest of the abapdoc block above
    if (rowText.trim().substring(0, 2) === "\"!") {
      while (previousRow >= 0) {
        previousRow--;
        rowText = rows[previousRow].trim().toUpperCase();
        if (rowText.trim().substring(0, 2) !== "\"!") {
          break;
        }
        text.push(rowText);
      }
    }
    return text;
  }
}