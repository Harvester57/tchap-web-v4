
import React, { JSX } from 'react'

import "../../../../../res/css/common/_TchapLeftPanel.pcss";

import { ChevronFace, alwaysAboveRightOf, useContextMenu } from '~tchap-web/src/components/structures/ContextMenu';
import AccessibleButton from '~tchap-web/src/components/views/elements/AccessibleButton';
import classNames from 'classnames';
import { _t } from '../../../../languageHandler';
import IconizedContextMenu, { IconizedContextMenuOption, IconizedContextMenuOptionList } from '~tchap-web/src/components/views/context_menus/IconizedContextMenu';
import TchapUrls from '../../../util/TchapUrls';
import Modal from '~tchap-web/src/Modal';
import BugReportDialog from '~tchap-web/src/components/views/dialogs/BugReportDialog';

const QuickFaqButton: React.FC<{
    isPanelCollapsed: boolean;
}> = ({ isPanelCollapsed = false }) => {

    const [menuDisplayed, handle, openMenu, closeMenu] = useContextMenu<HTMLDivElement>();

    let contextMenu: JSX.Element | undefined;

    if (menuDisplayed && handle.current) {
        contextMenu = (
            <IconizedContextMenu
                {...alwaysAboveRightOf(handle.current.getBoundingClientRect(), ChevronFace.None, 16)}
                className="mx_UserMenu_contextMenu"
                onFinished={closeMenu}
                compact
            >
                <IconizedContextMenuOptionList>
                    <IconizedContextMenuOption
                        iconClassName="mx_UserMenu_iconInfo"
                        label={_t("quick_faq|faq")}
                        onClick={(e) => {
                            TchapUrls.openHelper("https://www.tchap.gouv.fr/faq")
                        }}
                    />
                    <IconizedContextMenuOption
                        iconClassName="mx_UserMenu_iconMessage"
                        label={_t("quick_faq|contact")}
                        onClick={(e) => {
                            TchapUrls.openHelper("mailto:support@tchap.beta.gouv.fr")
                        }}
                    />
                    <IconizedContextMenuOption
                        iconClassName="mx_UserMenu_iconHome"
                        label={_t("quick_faq|guides")}
                        onClick={(e) => {
                            TchapUrls.openHelper(TchapUrls.helpUserOnboarding)
                        }}
                    />
                    <IconizedContextMenuOption
                        iconClassName="mx_UserMenu_iconBug"
                        label={_t("quick_faq|bug")}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                    
                            Modal.createDialog(BugReportDialog);
                            closeMenu(e);
                        }}
                    />
                </IconizedContextMenuOptionList>
            </IconizedContextMenu>
        );
    }

    return (
        <>
            <AccessibleButton
                className={classNames(["mx_QuickSettingsButton", { expanded: !isPanelCollapsed }, "tc_sidebar_quick_faq"])}
                onClick={openMenu}
                aria-label={_t("common|help")}
                title={isPanelCollapsed ? _t("common|help") : undefined}
                ref={handle}
                aria-expanded={!isPanelCollapsed}
            >
                {!isPanelCollapsed ? _t("common|help") : null}
            </AccessibleButton>

            {contextMenu}
        </>
    );
};

export default QuickFaqButton;