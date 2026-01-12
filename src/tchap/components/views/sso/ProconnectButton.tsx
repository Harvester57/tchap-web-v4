import { MatrixClient, SSOAction } from "matrix-js-sdk/src/matrix";
import React, { JSX } from "react";

import { _t } from "~tchap-web/src/languageHandler";
import PlatformPeg from "~tchap-web/src/PlatformPeg";

interface ProconnectButtonProps {
    directSSO: string | null;
    client: MatrixClient;
}
export default function ProconnectButton(props: ProconnectButtonProps ): JSX.Element {

    if (props.directSSO === "true") {
        return <div className="tc_pronnect">
            <button 
                className="tc_ButtonParent tc_ButtonProconnect tc_Button_iconPC"
                key="register"
                onClick={() => {
                    PlatformPeg.get()?.startSingleSignOn(props.client, "sso", "/home", "", SSOAction.LOGIN);
                }}>
                <div>{_t("auth|proconnect|button_title", 
                    {},
                    {
                        b: (sub) => (
                            <span style={{fontWeight: "bold"}}>
                                {sub}
                            </span>
                        ),
                        br: () => (<></>)
                    })}
                </div>
            </button>
        </div>
    }
    return (
        <div className="tc_pronnect">
            <a href="#/email-precheck-sso" className="tc_ButtonParent tc_ButtonProconnect tc_Button_iconPC">
                <div>{_t("auth|proconnect|button_title", 
                    {},
                    {
                        b: (sub) => (
                            <span style={{fontWeight: "bold"}}>
                                {sub}
                            </span>
                        ),
                        br: () => (<></>)
                    })}
                </div>
            </a>
        </div>
    );
}