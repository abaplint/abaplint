import {IDependency} from "@abaplint/core";
import {xml2js} from "xml-js";

export class ApackDependencyProvider {

  public static fromManifest(manifestContents: string): IDependency[] {
    if (!manifestContents || !manifestContents.length) {
      return [];
    }

    const result: IDependency[] = [];
    let manifest: any;
    try {
      manifest = xml2js(manifestContents, {compact: true}) as any;
    } catch {
      return [];
    }
    let apackDependencies = manifest?.["asx:abap"]?.["asx:values"]?.["DATA"]?.["DEPENDENCIES"]?.item;
    if (!apackDependencies) {
      return [];
    } else if (!apackDependencies.length) {
      apackDependencies = [apackDependencies];
    }

    for (const dependency of apackDependencies) {
      const url = dependency?.["GIT_URL"]?.["_text"];
      if (typeof url !== "string") {
        continue;
      }
      result.push({
        files: "/src/**/*.*",
        url,
      });
    }

    return result;
  }
}
