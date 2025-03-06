import { render, screen } from "jest-matrix-react";
import React from "react";
import userEvent from "@testing-library/user-event";

import TchapMailSignature, {
    generateSignatureHtml,
} from "~tchap-web/src/tchap/components/views/settings/tabs/user/TchapMailSignature";

describe("TchapMailSignature", () => {
    const profileUri = "https://tchap.gouv.fr";
    const renderComponent = () => render(<TchapMailSignature userPermalink={profileUri} />);

    beforeEach(() => {
        // Mock clipboard API
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn(),
            },
        });
    });

    it("should copy html signature when clicking on the copy button", async () => {
        renderComponent();

        const copyButton = screen.getByRole("button", { name: "Copy" });

        await userEvent.click(copyButton);

        // check that the signature is copied to the clipboard
        const signatureHtml = generateSignatureHtml(profileUri);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(signatureHtml);
    });

    it("should go to user profile when clicking on contactez-moi sur tchap", async () => {
        renderComponent();

        const contactLink = screen.getByRole("link", { name: "Contactez-moi sur Tchap" });

        expect(contactLink).toHaveAttribute("href", profileUri);
    });

    it("should render correctly snapshot", () => {
        renderComponent();

        expect(screen.getByText("Contactez-moi sur Tchap")).toMatchSnapshot();
    });
});
