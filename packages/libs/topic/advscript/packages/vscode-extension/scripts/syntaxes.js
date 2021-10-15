const fs = require("fs-extra");
const path = require("path");
const jym = require("js-yaml");
const plist2 = require("plist2");

function transformGrammarRule(rule, propertyNames, transformProperty) {
  if (!rule) return 
  for (const propertyName of propertyNames) {
      const value = rule[propertyName];
      if (typeof value === 'string') {
          rule[propertyName] = transformProperty(value);
      }
  }

  for (var propertyName in rule) {
      const value = rule[propertyName];
      if (typeof value === 'object') {
          transformGrammarRule(value, propertyNames, transformProperty);
      }
  }
}

function transformGrammarRepository(grammar, propertyNames, transformProperty) {
  const repository = grammar.repository;
  for (let key in repository) {
      transformGrammarRule(repository[key], propertyNames, transformProperty);
  }
}
function replacePatternVariables(pattern, variableReplacers) {
  let result = pattern;
  for (const [variableName, value] of variableReplacers) {
      result = result.replace(variableName, value);
  }
  return result;
}

function updateGrammarVariables(grammar, variables = grammar.variables) {
  delete grammar.variables;
  const variableReplacers = [];
  for (const variableName in variables) {
      // Replace the pattern with earlier variables
      const pattern = replacePatternVariables(variables[variableName], variableReplacers);
      variableReplacers.push([new RegExp(`{{${variableName}}}`, "gim"), pattern]);
  }
  transformGrammarRepository(
      grammar,
      ["begin", "end", "match"],
      pattern => replacePatternVariables(pattern, variableReplacers)
  );
  return grammar;
}
function convertYaml2Json(name) {
  const ymlText = fs
    .readFileSync(require.resolve("../syntaxes/" + name + ".YAML-tmLanguage"))
    .toString();
  // 为了语法高亮，修正
  const js = plist2.yaml2js(ymlText)
  fs.writeJSONSync(
    path.join(__dirname, "../syntaxes/" + name + ".tmLanguage.json"),
    updateGrammarVariables(js),
    {
      spaces: 2,
    }
  );
}

function convertFountainSource() {
  const plistText = fs.readFileSync(require.resolve("../syntaxes/fountain.tmlanguage")).toString();
  fs.writeFileSync(
    path.join(__dirname, "../syntaxes/fountain.YAML-tmLanguage"),
    plist2.plist2yaml(plistText)
  );
}

// convertFountainSource();
convertYaml2Json("advscript");
convertYaml2Json("injection-inline-expression")
convertYaml2Json("fountain");
