const ORGANIZATION_IDS = [
    "kooapps",
    "darkhotpot"
];

const PROJECT_IDS = [
    "pianotiles2",
    "spaceodyssey",
    // "schoolvr",
];

const userLanguage = (navigator.language || navigator.userLanguage).toLowerCase();

(function () {
    const { createApp, ref, computed } = Vue;

    function View(defaultLanguage) {
        let self = this;

        this.pageData = {
            general: ref({}),
            projects: ref({}),
            organizations: ref({}),

            getPlatformIcon: function (platform) {
                switch (platform) {
                    case "Steam":
                        return "fab fa-steam";
                    case "Google Play":
                        return "fab fa-google-play";
                    case "App Store":
                        return "fab fa-apple";
                    case "itch.io":
                        return "fab fa-itch-io";
                    default:
                        return "fas fa-link";
                }
            },

            sortedProjects: computed (() => {
                // TODO: add tag filtering
                return Object.values(self.pageData.projects.value).sort((a, b) => {
                    return b.order - a.order; // Descending order
                });
            }),
            sortedOrganizations: computed (() => {
                return Object.values(self.pageData.organizations.value).sort((a, b) => {
                    return b.order - a.order; // Descending order
                }).filter(org => {
                    return org.display;
                });
            }),

            changeLanguage: function () {
                if (self.language.value === "zh") {
                    self.language.value = "en";
                }
                else {
                    self.language.value = "zh";
                }
                self.loadGeneralData();
                self.loadOrganizationData();
                self.loadProjectData();
            }
        };

        this.langaugesData = {};

        this.data = function () {
            return self.pageData;
        };

        this.language = ref(defaultLanguage);

        this.loadOrganizationData = function() {
            let language = self.language.value;
            if (self.langaugesData[language] == undefined) {
                self.langaugesData[language] = { organizations: {} };
            }
            else if (self.langaugesData[language].organizations == undefined) {
                self.langaugesData[language].organizations = {};
            }

            for (let id of ORGANIZATION_IDS) {
                if (self.langaugesData[language].organizations[id]) {
                    self.pageData.organizations.value[id] = self.langaugesData[language].organizations[id];
                    continue;
                }

                Get({
                    url: `/page/${self.language.value}/organizations/${id}.json`,
                    success: (response) => {
                        self.langaugesData[language].organizations[id] = response.jsonlizeText();
                        self.pageData.organizations.value[id] = self.langaugesData[language].organizations[id];
                    }
                });
            }
        }

        this.loadProjectData = function() {
            let language = self.language.value;
            if (self.langaugesData[language] == undefined) {
                self.langaugesData[language] = { projects: {} };
            }
            else if (self.langaugesData[language].projects == undefined) {
                self.langaugesData[language].projects = {};
            }

            for (let id of PROJECT_IDS) {
                if (self.langaugesData[language].projects[id]) {
                    self.pageData.projects.value[id] = self.langaugesData[language].projects[id];
                    continue;
                }

                Get({
                    url: `/page/${language}/projects/${id}.json`,
                    success: (response) => {
                        self.langaugesData[language].projects[id] = response.jsonlizeText();
                        self.pageData.projects.value[id] = self.langaugesData[language].projects[id];
                    }
                });
            }
        }

        this.loadGeneralData = function() {
            let language = self.language.value;
            if (self.langaugesData[language] == undefined) {
                self.langaugesData[language] = {};
            }
            else if (self.langaugesData[language].general) {
                self.pageData.general.value = self.langaugesData[language].general;
                return;
            }

            let generalJsonUrl = `/page/${language}/general.json`;
            Get({
                url: generalJsonUrl,
                success: (response) => {
                    self.langaugesData[language].general = response.jsonlizeText();
                    self.pageData.general.value = self.langaugesData[language].general;
                },
            });
        }

        this.loadGeneralData();
        this.loadOrganizationData();
        this.loadProjectData();
    }

    let defaultLanguage;
    if (userLanguage.startsWith("zh")) {
        defaultLanguage = "zh";
    }
    else {
        defaultLanguage = "en";
    }
    let app = createApp(new View(defaultLanguage));
    app.mount("body");
})();
