import {AbstractObject} from "./_abstract_object";
import * as xmljs from "xml-js";
import {xmlToArray} from "../xml_utils";

export class Table extends AbstractObject {

  public getType(): string {
    return "TABL";
  }

  public getFields(): string[] {
    const xml = this.getXML();
    if (xml === undefined) {
      return [];
    }
    const parsed: any = xmljs.xml2js(xml, {compact: true});

    return this.parse(parsed);
  }

  private parse(data: any): string[] {
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