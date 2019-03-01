import {AbstractObject} from "./_abstract_object";
import * as xmljs from "xml-js";
import {xmlToArray} from "../xml_utils";

export enum EnhancementCategory {
  NotClassified = "0",
  CannotBeEhanced = "1",
  Character = "2",
  CharacterOrNumeric = "3",
  Deep = "4",
}

export enum TableCategory {
  Transparent = "TRANSP",
  Structure = "INTTAB",
  Cluster = "CLUSTER",
  Pooled = "POOL",
  View = "VIEW",
  Append = "APPEND",
}

export class Table extends AbstractObject {

  public getType(): string {
    return "TABL";
  }

  public getFields(): string[] {
    const parsed = this.parseXML();
    if (parsed === undefined) {
      return [];
    }

    return this.parseFields(parsed);
  }

  public getTableCategory(): TableCategory | undefined {
    const parsed = this.parseXML();
    if (parsed === undefined) {
      return undefined;
    }

    return parsed.abapGit["asx:abap"]["asx:values"].DD02V.TABCLASS._text;
  }

  public getEnhancementCategory(): EnhancementCategory | undefined {
    const parsed = this.parseXML();
    if (parsed === undefined) {
      return undefined;
    }

    return parsed.abapGit["asx:abap"]["asx:values"].DD02V.EXCLASS._text;
  }

  private parseXML(): any | undefined {
    const xml = this.getXML();
    if (xml === undefined) {
      return undefined;
    }
    return xmljs.xml2js(xml, {compact: true});
  }

  private parseFields(data: any): string[] {
    const ret: string[] = [];

    const fields = data.abapGit["asx:abap"]["asx:values"].DD03P_TABLE;
    for (const field of xmlToArray(fields.DD03P)) {
      ret.push(field.FIELDNAME._text);
    }

    return ret;
  }

  private getXML(): string | undefined {
    for (const file of this.getFiles()) {
      if (file.getFilename().match(/\.tabl\.xml$/i)) {
        return file.getRaw();
      }
    }
    return undefined;
  }

}