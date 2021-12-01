/******************************************************************************
 * This file was generated by langium-cli 0.2.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import { LangiumGeneratedServices, LangiumServices, LanguageMetaData, Module, IParserConfig } from 'langium';
import { AdvscriptAstReflection } from './ast';
import { grammar } from './grammar';

export const languageMetaData: LanguageMetaData = {
    languageId: 'advscript',
    fileExtensions: ['.avs', '.adv']
};

export const parserConfig: IParserConfig = {
    recoveryEnabled: true,
    nodeLocationTracking: 'full',
    maxLookahead: 4,
    skipValidations: true,
};

export const AdvscriptGeneratedModule: Module<LangiumServices, LangiumGeneratedServices> = {
    Grammar: () => grammar(),
    AstReflection: () => new AdvscriptAstReflection(),
    LanguageMetaData: () => languageMetaData,
    parser: {
        ParserConfig: () => parserConfig
    }
};
