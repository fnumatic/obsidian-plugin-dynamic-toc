import stringifyPackage from "stringify-package";
import detectIndent from "detect-indent";
import detectNewline from "detect-newline";

export function readVersion (contents) {
  const data = JSON.parse(contents);
  const keys = Object.keys(data);
  return keys[keys.length - 1];
}

export function writeVersion (contents, version) {
  const json = JSON.parse(contents);
  let indent = detectIndent(contents).indent;
  let newline = detectNewline(contents);
  const values = Object.values(json);
  json[version] = values[values.length - 1];

  const result = stringifyPackage(json, indent, newline);

  return result;
}
