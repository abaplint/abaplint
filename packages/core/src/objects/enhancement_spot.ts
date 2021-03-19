import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";

export interface IBadiDefinition {
  name: string,
  interface: string,
}

export class EnhancementSpot extends AbstractObject {
  private badis: IBadiDefinition[] | undefined;

  public getType(): string {
    return "ENHS";
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.badis = undefined;
    super.setDirty();
  }

  public listBadiDefinitions(): IBadiDefinition[] {
    if (this.badis === undefined) {
      this.badis = this.parseXML();
    }
    return this.badis;
  }

/////////////////

  private parseXML(): IBadiDefinition[] {
    const parsed = super.parseRaw();
    if (parsed === undefined) {
      return [];
    }

    const ret: IBadiDefinition[] = [];
    for (const b of xmlToArray(parsed.abapGit["asx:abap"]["asx:values"]?.BADI_DATA?.ENH_BADI_DATA)) {
      ret.push({
        name: b.BADI_NAME?._text,
        interface: b.INTERFACE_NAME?._text,
      });
    }

    return ret;
  }
}
