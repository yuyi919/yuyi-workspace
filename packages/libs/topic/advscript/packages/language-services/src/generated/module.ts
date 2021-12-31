/******************************************************************************
 * This file was generated by langium-cli 0.2.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import { LangiumGeneratedServices, LangiumGeneratedSharedServices, LangiumSharedServices, LangiumServices, LanguageMetaData, Module, IParserConfig } from 'langium';
import { AdvScriptAstReflection } from './ast';
import { AdvscriptGrammar, ExpressionGrammar } from './grammar';

export const AdvscriptLanguageMetaData: LanguageMetaData = {
    languageId: 'advscript',
    fileExtensions: ['.avs', '.adv'],
    caseInsensitive: false
};

export const ExpressionLanguageMetaData: LanguageMetaData = {
    languageId: 'expression',
    fileExtensions: ['.avs', '.adv'],
    caseInsensitive: false
};

export const parserConfig: IParserConfig = {
    recoveryEnabled: true,
    nodeLocationTracking: 'full',
    maxLookahead: 4,
    skipValidations: true,
};

export const AdvScriptGeneratedSharedModule: Module<LangiumSharedServices, LangiumGeneratedSharedServices> = {
    AstReflection: () => new AdvScriptAstReflection()
};

export const AdvscriptGeneratedModule: Module<LangiumServices, LangiumGeneratedServices> = {
    Grammar: () => AdvscriptGrammar(),
    LanguageMetaData: () => AdvscriptLanguageMetaData,
    parser: {
        ParserConfig: () => parserConfig
    }
};

export const ExpressionGeneratedModule: Module<LangiumServices, LangiumGeneratedServices> = {
    Grammar: () => ExpressionGrammar(),
    LanguageMetaData: () => ExpressionLanguageMetaData,
    parser: {
        ParserConfig: () => parserConfig
    }
};
