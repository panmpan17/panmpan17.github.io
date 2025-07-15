const ORGANIZATION_IDS = [
    "kooapps",
];

const PROJECT_IDS = [
    "pianotiles2",
];

(function () {
    const { createApp, ref } = Vue;

    function View() {
        let self = this;

        this.pageData = {
            general: ref({}),
            projects: ref({}),
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
                        organizations.value[id] = response.jsonlizeText();
                    }
                });
            }
        }

        this.loadProjectData = function() {
            for (let id of PROJECT_IDS) {
                Get({
                    url: `/page/${self.language.value}/projects/${id}.json`,
                    success: (response) => {
                        projects.value[id] = response.jsonlizeText();
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
