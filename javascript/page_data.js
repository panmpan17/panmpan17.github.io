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

        this.loadOrganizationData = function() {
            for (let i = 0; i < ORGANIZATION_IDS.length; i++) {
                let id = ORGANIZATION_IDS[i];
                Get({
                    url: `/page/organizations/${id}.json`,
                    success: (response) => {
                        // organizations[id] = response.jsonlizeText();
                    }
                });
            }
        }

        this.loadProjectData = function() {
            for (let i = 0; i < PROJECT_IDS.length; i++) {
                let id = PROJECT_IDS[i];
                Get({
                    url: `/page/projects/${id}.json`,
                    success: (response) => {
                        // projects[id] = response.jsonlizeText();
                    }
                });
            }
        }

        this.loadGeneralData = function() {
            let generalJsonUrl = "/page/general.json";
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
