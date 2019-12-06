import {AbstractObject} from "./_abstract_object";

export class MaintenanceAndTransportObject extends AbstractObject {

  public getType(): string {
    return "TOBJ";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getArea(): string | undefined {
    if (this.getFiles().length === 0) {
      return undefined;
    }

    const xml = this.getFiles()[0].getRaw();

    const result = xml.match(/<AREA>([\w\/]+)<\/AREA>/);
    if (result) {
      return result[1];
    } else {
      return undefined;
    }
  }

}
