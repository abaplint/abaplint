import {AbstractObject} from "./_abstract_object";

export class MaintenanceAndTransportObject extends AbstractObject {
  private area: string | undefined = undefined;

  public setDirty() {
    super.setDirty();
    this.area = undefined;
  }

  public getType(): string {
    return "TOBJ";
  }

  public getAllowedNaming() {
    return {
      maxLength: 31,
      allowNamespace: true,
    };
  }

  public getArea(): string | undefined {
    if (this.area === undefined) {
      this.parseXML();
    }
    return this.area;
  }

////////////

  private parseXML(): string | undefined {
    if (this.getFiles().length === 0) {
      return undefined;
    }

    const xml = this.getFiles()[0].getRaw();

    const result = xml.match(/<AREA>([\w/]+)<\/AREA>/);
    if (result) {
      return result[1];
    } else {
      return undefined;
    }
  }

}
