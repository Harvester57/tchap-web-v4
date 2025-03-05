import React from 'react';
import { SettingsSubsection, SettingsSubsectionText } from '~tchap-web/src/components/views/settings/shared/SettingsSubsection';
import { _t } from "~tchap-web/src/languageHandler";
import CopyableText from '~tchap-web/src/components/views/elements/CopyableText';
import TchapUrls from '~tchap-web/src/tchap/util/TchapUrls';

interface TchapMailSignatureProps {
    userPermalink: string
}

/**
 * Generates the HTML signature for Tchap mail
 */
export const generateSignatureHtml = (userPermalink: string): string => {
    return `
        <table cellpadding="0" width="350" style="border-collapse:collapse;font-size:12.1px;color:#222222;">
            <tr>
                <td style="margin:0.1px;padding:0;">
                    <table cellpadding="0" style="border-collapse:collapse;">
                        <tr>
                            <td valign="top" style="margin:0px;padding:0 10px 0 0;">
                                <img src="https://www.tchap.gouv.fr/themes/tchap/img/logos/tchap-logo.svg" width="50" style="display:block;min-width:50px;" alt="Tchap">
                            </td>
                            <td style="margin:0px;padding:0 10px 0 0;" valign="top">
                                <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="margin:0px;padding:0;font:15px/19px Arial, Helvetica, sans-serif;color:#000091; font-weight: bold;">
                                            <a style="sans-serif;color:#000091; font-weight: bold; text-decoration: none;" href="${userPermalink}">Contactez-moi sur Tchap</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="margin:0px;padding:1px 0;font:12.1px/15.3px Arial, Helvetica, sans-serif;color:#000001;">
                                            <span>La messagerie instantan&eacute;e du secteur public.<br></span>
                                            <span>Disponible via <a style="color:#222222;" href="https://www.tchap.gouv.fr/">tchap.gouv.fr</a> et sur app mobiles.</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    `;
};

/**
 * A copyable mail signature html bloc to add in emails
 */
const TchapMailSignature: React.FC<TchapMailSignatureProps> = (props) => {
    const signatureHtml = generateSignatureHtml(props.userPermalink);

    return <SettingsSubsection
            heading={_t("settings|general|mail_signature")}
            stretchContent>
                <div className="mx_SettingsSubsection_description">
                    <span>{_t("settings|general|mail_signature_description")}</span>
                    <SettingsSubsectionText>
                        {_t("settings|general|mail_signature_detail", {}, {
                            a: (sub) => (<a 
                            href={TchapUrls.helpMailSignature}
                            target="_blank"
                            rel="noreferrer noopener"
                            aria-label='link to tchap'
                            role="link"
                            >{sub}</a>)
                        })}
                    </SettingsSubsectionText>
                </div>
                <CopyableText getTextToCopy={() => signatureHtml} aria-labelledby={"mail-signature"}>
                    <div dangerouslySetInnerHTML={{ __html: signatureHtml }} />
                </CopyableText>
            </SettingsSubsection>
}

export default TchapMailSignature;