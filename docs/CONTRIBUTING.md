How to Contribute to SledHEAD
=============================

Thank you for considering contributing to SledHEAD! Community involvement is crucial for making the game the best it can be. Whether you're fixing bugs, adding features, or improving documentation, your efforts are appreciated.

* * * * *

Key Resources
-------------

-   SledHEAD README -- Learn about the game's core concepts and current features.

-   SledHEAD License -- Understand the licensing terms (AGPL 3.0 for code, CC BY-NC-SA 4.0 for assets).

-   Issues & Roadmap -- Check the GitHub Issues section for current tasks and future goals.

-   Discussions -- Engage with the community, ask questions, and brainstorm ideas.

* * * * *

Getting Started
---------------

1.  Fork the Repository\
    Create your own fork of the repository and clone it locally.

1.  Install Dependencies\
    SledHEAD is a web-based game built with JavaScript and Phaser.js. You'll just need a local HTTP server to test changes (like Python's http.server or Node's http-server).

1.  Create a Branch\
    Work in a feature-specific branch:

git  checkout  -b  feature/your-feature-name

* * * * *

Testing Your Contributions
--------------------------

-   Manually playtest any gameplay changes and check for bugs.
-   Ensure that UI elements render correctly and gameplay mechanics (like tricks, upgrades, and photography) behave as expected.
-   Keep console errors to a minimum. Use `console.log` for temporary debugging but clean up before submitting.

* * * * *

Submitting Changes
------------------

1.  **Code Style**

    -   Use **two spaces for indentation, not tabs**.
    -   Write clean, readable code with comments where necessary.
    -   Follow existing naming conventions (camelCase for variables, PascalCase for classes).
    -   Avoid deeply nested logic---break it into functions for clarity.
2.  **Commit Messages**\
    Write clear commit messages. For example:

    bash

    CopyEdit

    `git commit -m "Fix: Correct collision detection on uphill phase

    The collision detection logic for obstacles during the uphill phase
    now accurately accounts for terrain height variations."`

3.  **Pull Request (PR)**

    -   Open a PR against the `main` branch.
    -   Include a clear description of what you've done and why.
    -   If your change fixes a bug or closes an issue, reference it in the PR description (e.g., `Closes #42`).
    -   Include screenshots or screen recordings if the change is visual.
    -   Be prepared for feedback---collaboration is key!

* * * * *

Coding Conventions
------------------

-   **Consistency is key!** When in doubt, follow the style of existing code.
-   Use **strict equality** (`===` and `!==`).
-   Prefer `const` and `let` over `var`.
-   Document functions with comments explaining inputs, outputs, and purpose.
-   Keep functions focused and concise---single responsibility.
-   Handle errors gracefully and avoid silent failures.
-   Clean up `console.log` or temporary debug code before submitting.

* * * * *

Licensing of Contributions
--------------------------

-   **All contributions become licensed under AGPL 3.0 (for code) and CC BY-NC-SA 4.0 (for assets)**, consistent with the project's dual-license model.
-   By submitting a PR, you agree that your contributions may be included in SledHEAD and will be publicly available under these licenses.

* * * * *

Contributor License Agreement (CLA)
--------------------------

By contributing to **SledHEAD**, you agree to the Contributor License Agreement (CLA), granting the project owner the rights to use, modify, and commercialize your contributions. You retain ownership, but your work must be licensed under the project's current terms (AGPL 3.0 for code, CC BY-NC-SA 4.0 for assets) and can be re-licensed for commercial purposes.

By submitting a pull request, you confirm that you have the right to contribute and agree to these terms. 

See https://github.com/truevox/SledHEAD/docs/CONTRIBUTOR_LICENSE_AGREEMENT.md for more details.


* * * * *

Reporting Bugs & Requesting Features
------------------------------------

-   Open a **GitHub Issue** describing the problem or request.
-   Be clear and detailed---steps to reproduce bugs, expected behavior, and screenshots help!
-   Mark issues with appropriate labels (like `bug`, `enhancement`, or `question`).

* * * * *

Need Help?
----------

-   Join discussions on the GitHub repo.
-   Open an issue for technical support or feature questions.
-   Feedback, ideas, and constructive criticism are welcome!

* * * * *

Thank you for helping SledHEAD grow!