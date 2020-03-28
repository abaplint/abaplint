import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";

export class View extends AbstractObject {

  public getType(): string {
    return "VIEW";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getFields(): string[] {
    const xml = this.getXML();
    if (xml === undefined) {
      return [];
    }
    return this.parse(this.parseXML());
  }

  private parse(data: any): string[] {
    const ret: string[] = [];

    const fields = data.abapGit["asx:abap"]["asx:values"].DD27P_TABLE;
    for (const field of xmlToArray(fields.DD27P)) {
      ret.push(field.VIEWFIELD._text);
    }

    return ret;
  }

}