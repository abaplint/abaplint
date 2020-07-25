import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";

export class View extends AbstractObject {
  private parsedData: {
    fields: {
      VIEWFIELD: string}[]} | undefined;

  public getType(): string {
    return "VIEW";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.parsedData = undefined;
    super.setDirty();
  }

  public getFields(): string[] {
    if (this.parsedData === undefined) {
      this.parseXML();
    }
    if (this.parsedData?.fields === undefined) {
      return [];
    }

    const ret: string[] = [];
    for (const f of this.parsedData.fields) {
      ret.push(f.VIEWFIELD);
    }
    return ret;
  }

///////////////

  protected parseXML() {
    const parsed = super.parseXML();
    if (parsed === undefined) {
      return;
    }

    this.parsedData = {fields: []};

    const fields = parsed.abapGit["asx:abap"]["asx:values"]?.DD27P_TABLE;
    for (const field of xmlToArray(fields?.DD27P)) {
      this.parsedData.fields.push({
        VIEWFIELD: field.VIEWFIELD?._text});
    }
  }

}
