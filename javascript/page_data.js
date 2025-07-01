const ORGANIZATION_IDS = [
    "kooapps",
];

let organizations = {};

const PROJECT_IDS = [
    "pianotiles2",
]

let projects = {};


function LoadPageData() {
    for (let i = 0; i < ORGANIZATION_IDS.length; i++) {
        let id = ORGANIZATION_IDS[i];
        Get({
            url: `/page/organizations/${id}.json`,
            success: (response) => {
                organizations[id] = response.jsonlizeText();
                console.log(`Loaded organization data for ${id}:`, organizations[id]);
            },
            error: (response) => {
                console.error(`Failed to load organization data for ${id}:`, response);
            }
        });
    }
}

function LoadProjectData() {
    for (let i = 0; i < PROJECT_IDS.length; i++) {
        let id = PROJECT_IDS[i];
        Get({
            url: `/page/projects/${id}.json`,
            success: (response) => {
                projects[id] = response.jsonlizeText();
                console.log(`Loaded project data for ${id}:`, projects[id]);
            },
            error: (response) => {
                console.error(`Failed to load project data for ${id}:`, response);
            }
        });
    }
}

(function () {
    LoadPageData();
    LoadProjectData();
})();
