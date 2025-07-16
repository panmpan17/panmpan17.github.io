const ORGANIZATION_IDS = [
    "kooapps",
    "darkhotpot"
];

const PROJECT_IDS = [
    "pianotiles2",
    "spaceodyssey",
    "schoolvr",
];

(function () {
    const { createApp, ref, computed } = Vue;

    function View() {
        let self = this;

        this.pageData = {
            general: ref({}),
            projects: ref({}),
            organizations: ref({}),

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
        }

        this.data = function () {
            return self.pageData;
        };

        this.language = ref("zh");

        this.loadOrganizationData = function() {
            for (let id of ORGANIZATION_IDS) {
                Get({
                    url: `/page/${self.language.value}/organizations/${id}.json`,
                    success: (response) => {
                        self.pageData.organizations.value[id] = response.jsonlizeText();
                    }
                });
            }
        }

        this.loadProjectData = function() {
            for (let id of PROJECT_IDS) {
                Get({
                    url: `/page/${self.language.value}/projects/${id}.json`,
                    success: (response) => {
                        self.pageData.projects.value[id] = response.jsonlizeText();
                    }
                });
            }
        }

        this.loadGeneralData = function() {
            let generalJsonUrl = `/page/${self.language.value}/general.json`;
            Get({
                url: generalJsonUrl,
                success: (response) => { self.pageData.general.value = response.jsonlizeText(); },
            });
        }

        this.loadGeneralData();
        this.loadOrganizationData();
        this.loadProjectData();
    }

    let app = createApp(new View());
    app.mount("body");
})();
