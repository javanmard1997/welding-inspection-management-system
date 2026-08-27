// =====================================================
// WIMS - Welding Inspection Management System
// Complete JavaScript
// =====================================================


// =====================================================
// DATA
// =====================================================

let projects =
    JSON.parse(localStorage.getItem("projects")) || [];

let welds =
    JSON.parse(localStorage.getItem("welds")) || [];

let inspections =
    JSON.parse(localStorage.getItem("inspections")) || [];


const INSPECTION_METHODS = [
    "VT",
    "PT",
    "MT",
    "UT"
];

const INSPECTION_RESULTS = [
    "Accepted",
    "Rejected",
    "Pending"
];


// =====================================================
// HELPER
// =====================================================

function saveAllData() {

    localStorage.setItem(
        "projects",
        JSON.stringify(projects)
    );

    localStorage.setItem(
        "welds",
        JSON.stringify(welds)
    );

    localStorage.setItem(
        "inspections",
        JSON.stringify(inspections)
    );
}


let lastGeneratedId = 0;


function createId() {

    const now = Date.now();

    lastGeneratedId =
        now > lastGeneratedId
        ?
        now
        :
        lastGeneratedId + 1;

    return lastGeneratedId;
}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


function normalizeOption(value, allowed) {

    return allowed.find(
        option =>
            option.toLowerCase() ===
            String(value).trim().toLowerCase()
    );
}


function fillSelectOptions(select, placeholder, options) {

    if (!select) {
        return;
    }


    const previousValue = select.value;


    select.innerHTML = "";


    const placeholderOption =
        document.createElement("option");

    placeholderOption.value = "";

    placeholderOption.textContent = placeholder;

    select.appendChild(placeholderOption);


    options.forEach(item => {

        const option =
            document.createElement("option");

        option.value = item.value;

        option.textContent = item.label;

        select.appendChild(option);

    });


    select.value = previousValue;


    if (select.selectedIndex === -1) {
        select.selectedIndex = 0;
    }

}


// =====================================================
// WELD STATUS
// =====================================================

function syncWeldStatus(weldId) {

    const weld =
        welds.find(
            weld => weld.id === weldId
        );


    if (!weld) {
        return;
    }


    const weldInspections =
        inspections.filter(
            inspection =>
                inspection.jointId === weldId
        );


    if (!weldInspections.length) {

        weld.status = "Pending";

        return;
    }


    const latest =
        weldInspections.reduce(
            (latest, inspection) =>
                inspection.id > latest.id
                ?
                inspection
                :
                latest
        );


    weld.status = latest.result;

}


function syncAllWeldStatuses() {

    welds.forEach(
        weld => syncWeldStatus(weld.id)
    );

}


// =====================================================
// DASHBOARD
// =====================================================

const projectCount =
    document.getElementById("projectCount");

const weldCount =
    document.getElementById("weldCount");

const acceptedCount =
    document.getElementById("acceptedCount");

const rejectedCount =
    document.getElementById("rejectedCount");

const vtCount =
    document.getElementById("vtCount");

const ptCount =
    document.getElementById("ptCount");

const mtCount =
    document.getElementById("mtCount");

const utCount =
    document.getElementById("utCount");

const inspectionTable =
    document.getElementById("inspectionTable");


function updateDashboard() {

    if (projectCount) {
        projectCount.textContent =
            projects.length;
    }


    if (weldCount) {
        weldCount.textContent =
            welds.length;
    }


    if (acceptedCount) {

        acceptedCount.textContent =
            inspections.filter(
                item => item.result === "Accepted"
            ).length;

    }


    if (rejectedCount) {

        rejectedCount.textContent =
            inspections.filter(
                item => item.result === "Rejected"
            ).length;

    }


    if (vtCount) {

        vtCount.textContent =
            inspections.filter(
                item => item.method === "VT"
            ).length;

    }


    if (ptCount) {

        ptCount.textContent =
            inspections.filter(
                item => item.method === "PT"
            ).length;

    }


    if (mtCount) {

        mtCount.textContent =
            inspections.filter(
                item => item.method === "MT"
            ).length;

    }


    if (utCount) {

        utCount.textContent =
            inspections.filter(
                item => item.method === "UT"
            ).length;

    }


    if (!inspectionTable) {
        return;
    }


    inspectionTable.innerHTML = "";


    inspections.forEach(inspection => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(inspection.jointNumber)}
            </td>

            <td>
                ${escapeHtml(inspection.inspector)}
            </td>

            <td>
                ${escapeHtml(inspection.method)}
            </td>

            <td>
                ${escapeHtml(inspection.result)}
            </td>

        `;


        inspectionTable.appendChild(row);

    });

}


// =====================================================
// PROJECT MANAGEMENT
// =====================================================

const projectForm =
    document.getElementById("projectForm");

const projectTable =
    document.getElementById("projectTable");

const projectSearch =
    document.getElementById("projectSearch");

const projectStatusFilter =
    document.getElementById("projectStatusFilter");

const clearProjectFilters =
    document.getElementById("clearProjectFilters");

const projectResultCount =
    document.getElementById("projectResultCount");


function getFilteredProjects() {

    const search =
        projectSearch
        ?
        projectSearch.value
            .trim()
            .toLowerCase()
        :
        "";


    const status =
        projectStatusFilter
        ?
        projectStatusFilter.value
        :
        "";


    return projects.filter(project => {

        const matchesSearch =

            !search ||

            project.name
                .toLowerCase()
                .includes(search) ||

            project.client
                .toLowerCase()
                .includes(search) ||

            project.location
                .toLowerCase()
                .includes(search);


        const matchesStatus =

            !status ||

            project.status === status;


        return matchesSearch && matchesStatus;

    });

}


function renderProjects() {

    if (!projectTable) {
        return;
    }


    const filteredProjects =
        getFilteredProjects();


    projectTable.innerHTML = "";


    filteredProjects.forEach(project => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(project.name)}
            </td>

            <td>
                ${escapeHtml(project.client)}
            </td>

            <td>
                ${escapeHtml(project.location)}
            </td>

            <td>
                ${escapeHtml(project.startDate)}
            </td>

            <td>
                ${escapeHtml(project.status)}
            </td>

            <td class="action-buttons">

                <button
                    type="button"
                    class="edit-button"
                    onclick="editProject(${project.id})"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="delete-button"
                    onclick="deleteProject(${project.id})"
                >
                    Delete
                </button>

            </td>

        `;


        projectTable.appendChild(row);

    });


    if (projectResultCount) {

        projectResultCount.textContent =
            `Showing ${filteredProjects.length} of ${projects.length} projects`;

    }

}


if (projectSearch) {

    projectSearch.addEventListener(
        "input",
        renderProjects
    );

}


if (projectStatusFilter) {

    projectStatusFilter.addEventListener(
        "change",
        renderProjects
    );

}


if (clearProjectFilters) {

    clearProjectFilters.addEventListener(
        "click",
        function () {

            if (projectSearch) {
                projectSearch.value = "";
            }

            if (projectStatusFilter) {
                projectStatusFilter.value = "";
            }

            renderProjects();

        }
    );

}


if (projectForm) {

    projectForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document
                .getElementById("projectName")
                .value
                .trim();


            const client =
                document
                .getElementById("clientName")
                .value
                .trim();


            const location =
                document
                .getElementById("projectLocation")
                .value
                .trim();


            const startDate =
                document
                .getElementById("startDate")
                .value;


            if (
                !name ||
                !client ||
                !location ||
                !startDate
            ) {

                alert(
                    "Please complete all project fields."
                );

                return;
            }


            const newProject = {

                id: createId(),

                name: name,

                client: client,

                location: location,

                startDate: startDate,

                status: "Active"

            };


            projects.push(newProject);


            saveAllData();


            renderProjects();


            projectForm.reset();


            loadProjectOptions();

            loadInspectionProjects();

            loadWeldProjectFilter();

            loadInspectionProjectFilter();

            updateDashboard();

        }
    );

}


// =====================================================
// EDIT PROJECT
// =====================================================

function editProject(id) {

    const project =
        projects.find(
            project => project.id === id
        );


    if (!project) {
        return;
    }


    const newName =
        prompt(
            "Project Name:",
            project.name
        );


    if (newName === null) {
        return;
    }


    const newClient =
        prompt(
            "Client:",
            project.client
        );


    if (newClient === null) {
        return;
    }


    const newLocation =
        prompt(
            "Location:",
            project.location
        );


    if (newLocation === null) {
        return;
    }


    const newDate =
        prompt(
            "Start Date:",
            project.startDate
        );


    if (newDate === null) {
        return;
    }


    if (
        !newName.trim() ||
        !newClient.trim() ||
        !newLocation.trim() ||
        !newDate.trim()
    ) {

        alert(
            "Please complete all project fields."
        );

        return;
    }


    project.name =
        newName.trim();


    project.client =
        newClient.trim();


    project.location =
        newLocation.trim();


    project.startDate =
        newDate.trim();


    // Update related welds

    welds.forEach(weld => {

        if (
            weld.projectId === project.id
        ) {

            weld.projectName =
                project.name;

        }

    });


    // Update related inspections

    inspections.forEach(inspection => {

        if (
            inspection.projectId === project.id
        ) {

            inspection.projectName =
                project.name;

        }

    });


    saveAllData();


    renderProjects();

    renderWelds();

    renderInspections();

    loadProjectOptions();

    loadInspectionProjects();

    loadWeldProjectFilter();

    loadInspectionProjectFilter();

    updateDashboard();

}


// =====================================================
// DELETE PROJECT
// =====================================================

function deleteProject(id) {

    const project =
        projects.find(
            project => project.id === id
        );


    if (!project) {
        return;
    }


    const relatedWelds =
        welds.filter(
            weld =>
                weld.projectId === id
        );


    const relatedInspections =
        inspections.filter(
            inspection =>
                inspection.projectId === id
        );


    const confirmed =
        confirm(

            `Delete project "${project.name}"?\n\n` +

            `Weld Joints: ${relatedWelds.length}\n` +

            `Inspections: ${relatedInspections.length}\n\n` +

            `All related data will also be deleted.`

        );


    if (!confirmed) {
        return;
    }


    projects =
        projects.filter(
            project =>
                project.id !== id
        );


    welds =
        welds.filter(
            weld =>
                weld.projectId !== id
        );


    inspections =
        inspections.filter(
            inspection =>
                inspection.projectId !== id
        );


    saveAllData();


    renderProjects();

    renderWelds();

    renderInspections();

    loadProjectOptions();

    loadInspectionProjects();

    loadWeldProjectFilter();

    loadInspectionProjectFilter();

    updateDashboard();

}


// =====================================================
// WELD JOINT MANAGEMENT
// =====================================================

const weldForm =
    document.getElementById("weldForm");

const weldTable =
    document.getElementById("weldTable");

const weldProject =
    document.getElementById("weldProject");


function loadProjectOptions() {

    fillSelectOptions(
        weldProject,
        "Select Project",
        projects.map(project => ({
            value: project.id,
            label: project.name
        }))
    );

}


// =====================================================
// WELD SEARCH & FILTER
// =====================================================

const weldSearch =
    document.getElementById("weldSearch");

const weldProjectFilter =
    document.getElementById(
        "weldProjectFilter"
    );

const weldStatusFilter =
    document.getElementById(
        "weldStatusFilter"
    );

const clearWeldFilters =
    document.getElementById(
        "clearWeldFilters"
    );

const weldResultCount =
    document.getElementById(
        "weldResultCount"
    );


function loadWeldProjectFilter() {

    fillSelectOptions(
        weldProjectFilter,
        "All Projects",
        projects.map(project => ({
            value: project.id,
            label: project.name
        }))
    );

}


function getFilteredWelds() {

    const search =
        weldSearch
        ?
        weldSearch.value
            .trim()
            .toLowerCase()
        :
        "";


    const project =
        weldProjectFilter
        ?
        weldProjectFilter.value
        :
        "";


    const status =
        weldStatusFilter
        ?
        weldStatusFilter.value
        :
        "";


    return welds.filter(weld => {

        const matchesSearch =

            !search ||

            weld.jointNumber
                .toLowerCase()
                .includes(search) ||

            weld.welderId
                .toLowerCase()
                .includes(search) ||

            weld.wpsNumber
                .toLowerCase()
                .includes(search) ||

            weld.material
                .toLowerCase()
                .includes(search);


        const matchesProject =

            !project ||

            weld.projectId == project;


        const matchesStatus =

            !status ||

            weld.status === status;


        return (

            matchesSearch &&

            matchesProject &&

            matchesStatus

        );

    });

}


// =====================================================
// RENDER WELDS
// =====================================================

function renderWelds() {

    if (!weldTable) {
        return;
    }


    const filteredWelds =
        getFilteredWelds();


    weldTable.innerHTML = "";


    filteredWelds.forEach(weld => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(weld.projectName)}
            </td>

            <td>
                ${escapeHtml(weld.jointNumber)}
            </td>

            <td>
                ${escapeHtml(weld.welderId)}
            </td>

            <td>
                ${escapeHtml(weld.wpsNumber)}
            </td>

            <td>
                ${escapeHtml(weld.material)}
            </td>

            <td>
                ${escapeHtml(weld.thickness)} mm
            </td>

            <td>
                ${escapeHtml(weld.status)}
            </td>

            <td class="action-buttons">

                <button
                    type="button"
                    class="edit-button"
                    onclick="editWeld(${weld.id})"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="delete-button"
                    onclick="deleteWeld(${weld.id})"
                >
                    Delete
                </button>

            </td>

        `;


        weldTable.appendChild(row);

    });


    if (weldResultCount) {

        weldResultCount.textContent =
            `Showing ${filteredWelds.length} of ${welds.length} welds`;

    }

}


if (weldSearch) {

    weldSearch.addEventListener(
        "input",
        renderWelds
    );

}


if (weldProjectFilter) {

    weldProjectFilter.addEventListener(
        "change",
        renderWelds
    );

}


if (weldStatusFilter) {

    weldStatusFilter.addEventListener(
        "change",
        renderWelds
    );

}


if (clearWeldFilters) {

    clearWeldFilters.addEventListener(
        "click",
        function () {

            if (weldSearch) {
                weldSearch.value = "";
            }

            if (weldProjectFilter) {
                weldProjectFilter.value = "";
            }

            if (weldStatusFilter) {
                weldStatusFilter.value = "";
            }

            renderWelds();

        }
    );

}


// =====================================================
// ADD WELD
// =====================================================

if (weldForm) {

    loadProjectOptions();


    weldForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const selectedProjectId =
                weldProject.value;


            const selectedProject =
                projects.find(
                    project =>
                        project.id ==
                        selectedProjectId
                );


            if (!selectedProject) {

                alert(
                    "Please select a project."
                );

                return;
            }


            const jointNumber =
                document
                .getElementById("jointNumber")
                .value
                .trim();


            const welderId =
                document
                .getElementById("welderId")
                .value
                .trim();


            const wpsNumber =
                document
                .getElementById("wpsNumber")
                .value
                .trim();


            const material =
                document
                .getElementById("material")
                .value
                .trim();


            const thickness =
                document
                .getElementById("thickness")
                .value
                .trim();


            if (
                !jointNumber ||
                !welderId ||
                !wpsNumber ||
                !material ||
                !thickness
            ) {

                alert(
                    "Please complete all weld joint fields."
                );

                return;
            }


            const newWeld = {

                id: createId(),

                projectId:
                    selectedProject.id,

                projectName:
                    selectedProject.name,

                jointNumber: jointNumber,

                welderId: welderId,

                wpsNumber: wpsNumber,

                material: material,

                thickness: thickness,

                status:
                    "Pending"

            };


            welds.push(newWeld);


            saveAllData();


            renderWelds();


            weldForm.reset();


            updateDashboard();

        }
    );

}


// =====================================================
// EDIT WELD
// =====================================================

function editWeld(id) {

    const weld =
        welds.find(
            weld => weld.id === id
        );


    if (!weld) {
        return;
    }


    const newJoint =
        prompt(
            "Joint Number:",
            weld.jointNumber
        );


    if (newJoint === null) {
        return;
    }


    const newWelder =
        prompt(
            "Welder ID:",
            weld.welderId
        );


    if (newWelder === null) {
        return;
    }


    const newWps =
        prompt(
            "WPS Number:",
            weld.wpsNumber
        );


    if (newWps === null) {
        return;
    }


    const newMaterial =
        prompt(
            "Material:",
            weld.material
        );


    if (newMaterial === null) {
        return;
    }


    const newThickness =
        prompt(
            "Thickness (mm):",
            weld.thickness
        );


    if (newThickness === null) {
        return;
    }


    if (
        !newJoint.trim() ||
        !newWelder.trim() ||
        !newWps.trim() ||
        !newMaterial.trim() ||
        !newThickness.trim()
    ) {

        alert(
            "Please complete all weld joint fields."
        );

        return;
    }


    weld.jointNumber =
        newJoint.trim();


    weld.welderId =
        newWelder.trim();


    weld.wpsNumber =
        newWps.trim();


    weld.material =
        newMaterial.trim();


    weld.thickness =
        newThickness.trim();


    // Update joint number in inspections

    inspections.forEach(inspection => {

        if (
            inspection.jointId === weld.id
        ) {

            inspection.jointNumber =
                weld.jointNumber;

        }

    });


    saveAllData();


    renderWelds();

    renderInspections();

    loadInspectionJoints();

    updateDashboard();

}


// =====================================================
// DELETE WELD
// =====================================================

function deleteWeld(id) {

    const weld =
        welds.find(
            weld => weld.id === id
        );


    if (!weld) {
        return;
    }


    const relatedInspections =
        inspections.filter(
            inspection =>
                inspection.jointId === id
        );


    const confirmed =
        confirm(

            `Delete weld "${weld.jointNumber}"?\n\n` +

            `Related inspections: ${relatedInspections.length}\n\n` +

            `All related inspections will also be deleted.`

        );


    if (!confirmed) {
        return;
    }


    welds =
        welds.filter(
            weld =>
                weld.id !== id
        );


    inspections =
        inspections.filter(
            inspection =>
                inspection.jointId !== id
        );


    saveAllData();


    renderWelds();

    renderInspections();

    loadInspectionJoints();

    updateDashboard();

}


// =====================================================
// INSPECTION MANAGEMENT
// =====================================================

const inspectionForm =
    document.getElementById(
        "inspectionForm"
    );

const inspectionProject =
    document.getElementById(
        "inspectionProject"
    );

const inspectionJoint =
    document.getElementById(
        "inspectionJoint"
    );

const inspectionRecords =
    document.getElementById(
        "inspectionRecords"
    );

const inspectionSearch =
    document.getElementById(
        "inspectionSearch"
    );

const inspectionProjectFilter =
    document.getElementById(
        "inspectionProjectFilter"
    );

const inspectionMethodFilter =
    document.getElementById(
        "inspectionMethodFilter"
    );

const inspectionResultFilter =
    document.getElementById(
        "inspectionResultFilter"
    );

const clearInspectionFilters =
    document.getElementById(
        "clearInspectionFilters"
    );

const inspectionResultCount =
    document.getElementById(
        "inspectionResultCount"
    );


// =====================================================
// LOAD INSPECTION PROJECTS
// =====================================================

function loadInspectionProjects() {

    fillSelectOptions(
        inspectionProject,
        "Select Project",
        projects.map(project => ({
            value: project.id,
            label: project.name
        }))
    );

}


function loadInspectionProjectFilter() {

    fillSelectOptions(
        inspectionProjectFilter,
        "All Projects",
        projects.map(project => ({
            value: project.id,
            label: project.name
        }))
    );

}


// =====================================================
// LOAD INSPECTION JOINTS
// =====================================================

function loadInspectionJoints() {

    if (
        !inspectionProject ||
        !inspectionJoint
    ) {
        return;
    }


    const projectId =
        inspectionProject.value;


    const projectWelds =
        projectId
        ?
        welds.filter(
            weld =>
                weld.projectId == projectId
        )
        :
        [];


    fillSelectOptions(
        inspectionJoint,
        "Select Joint",
        projectWelds.map(weld => ({
            value: weld.id,
            label: weld.jointNumber
        }))
    );

}


// =====================================================
// RENDER INSPECTIONS
// =====================================================

function getFilteredInspections() {

    const search =
        inspectionSearch
        ?
        inspectionSearch.value
            .trim()
            .toLowerCase()
        :
        "";


    const project =
        inspectionProjectFilter
        ?
        inspectionProjectFilter.value
        :
        "";


    const method =
        inspectionMethodFilter
        ?
        inspectionMethodFilter.value
        :
        "";


    const result =
        inspectionResultFilter
        ?
        inspectionResultFilter.value
        :
        "";


    return inspections.filter(inspection => {

        const matchesSearch =

            !search ||

            inspection.jointNumber
                .toLowerCase()
                .includes(search) ||

            inspection.inspector
                .toLowerCase()
                .includes(search);


        const matchesProject =

            !project ||

            inspection.projectId == project;


        const matchesMethod =

            !method ||

            inspection.method === method;


        const matchesResult =

            !result ||

            inspection.result === result;


        return (

            matchesSearch &&

            matchesProject &&

            matchesMethod &&

            matchesResult

        );

    });

}


function renderInspections() {

    if (!inspectionRecords) {
        return;
    }


    const filteredInspections =
        getFilteredInspections();


    inspectionRecords.innerHTML = "";


    filteredInspections.forEach(inspection => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(inspection.projectName)}
            </td>

            <td>
                ${escapeHtml(inspection.jointNumber)}
            </td>

            <td>
                ${escapeHtml(inspection.method)}
            </td>

            <td>
                ${escapeHtml(inspection.inspector)}
            </td>

            <td>
                ${escapeHtml(inspection.date)}
            </td>

            <td>
                ${escapeHtml(inspection.result)}
            </td>

            <td class="action-buttons">

                <button
                    type="button"
                    class="edit-button"
                    onclick="editInspection(${inspection.id})"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="delete-button"
                    onclick="deleteInspection(${inspection.id})"
                >
                    Delete
                </button>

            </td>

        `;


        inspectionRecords.appendChild(
            row
        );

    });


    if (inspectionResultCount) {

        inspectionResultCount.textContent =
            `Showing ${filteredInspections.length} of ${inspections.length} inspections`;

    }

}


if (inspectionSearch) {

    inspectionSearch.addEventListener(
        "input",
        renderInspections
    );

}


if (inspectionProjectFilter) {

    inspectionProjectFilter.addEventListener(
        "change",
        renderInspections
    );

}


if (inspectionMethodFilter) {

    inspectionMethodFilter.addEventListener(
        "change",
        renderInspections
    );

}


if (inspectionResultFilter) {

    inspectionResultFilter.addEventListener(
        "change",
        renderInspections
    );

}


if (clearInspectionFilters) {

    clearInspectionFilters.addEventListener(
        "click",
        function () {

            if (inspectionSearch) {
                inspectionSearch.value = "";
            }

            if (inspectionProjectFilter) {
                inspectionProjectFilter.value = "";
            }

            if (inspectionMethodFilter) {
                inspectionMethodFilter.value = "";
            }

            if (inspectionResultFilter) {
                inspectionResultFilter.value = "";
            }

            renderInspections();

        }
    );

}


// =====================================================
// ADD INSPECTION
// =====================================================

if (inspectionForm) {

    loadInspectionProjects();


    if (inspectionProject) {

        inspectionProject.addEventListener(
            "change",
            loadInspectionJoints
        );

    }


    inspectionForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const selectedProject =
                projects.find(
                    project =>
                        project.id ==
                        inspectionProject.value
                );


            const selectedJoint =
                welds.find(
                    weld =>
                        weld.id ==
                        inspectionJoint.value
                );


            if (
                !selectedProject ||
                !selectedJoint
            ) {

                alert(
                    "Please select a project and joint."
                );

                return;
            }


            const newInspection = {

                id: createId(),

                projectId:
                    selectedProject.id,

                projectName:
                    selectedProject.name,

                jointId:
                    selectedJoint.id,

                jointNumber:
                    selectedJoint.jointNumber,

                method:
                    document
                    .getElementById(
                        "inspectionMethod"
                    )
                    .value,

                inspector:
                    document
                    .getElementById(
                        "inspectorName"
                    )
                    .value
                    .trim(),

                date:
                    document
                    .getElementById(
                        "inspectionDate"
                    )
                    .value,

                result:
                    document
                    .getElementById(
                        "inspectionResult"
                    )
                    .value,

                comments:
                    document
                    .getElementById(
                        "inspectionComments"
                    )
                    .value
                    .trim()

            };


            inspections.push(
                newInspection
            );


            syncWeldStatus(
                newInspection.jointId
            );


            saveAllData();


            renderInspections();

            renderWelds();

            updateDashboard();


            inspectionForm.reset();


            loadInspectionJoints();

        }
    );

}


// =====================================================
// EDIT INSPECTION
// =====================================================

function editInspection(id) {

    const inspection =
        inspections.find(
            inspection =>
                inspection.id === id
        );


    if (!inspection) {
        return;
    }


    const newMethod =
        prompt(
            "Inspection Method (VT / PT / MT / UT):",
            inspection.method
        );


    if (newMethod === null) {
        return;
    }


    const method =
        normalizeOption(
            newMethod,
            INSPECTION_METHODS
        );


    if (!method) {

        alert(
            "Method must be one of VT, PT, MT or UT."
        );

        return;
    }


    const newInspector =
        prompt(
            "Inspector:",
            inspection.inspector
        );


    if (newInspector === null) {
        return;
    }


    if (!newInspector.trim()) {

        alert(
            "Inspector name is required."
        );

        return;
    }


    const newDate =
        prompt(
            "Inspection Date:",
            inspection.date
        );


    if (newDate === null) {
        return;
    }


    const newResult =
        prompt(
            "Result (Accepted / Rejected / Pending):",
            inspection.result
        );


    if (newResult === null) {
        return;
    }


    const result =
        normalizeOption(
            newResult,
            INSPECTION_RESULTS
        );


    if (!result) {

        alert(
            "Result must be Accepted, Rejected or Pending."
        );

        return;
    }


    const newComments =
        prompt(
            "Comments:",
            inspection.comments || ""
        );


    if (newComments === null) {
        return;
    }


    inspection.method = method;


    inspection.inspector =
        newInspector.trim();


    inspection.date =
        newDate.trim();


    inspection.result = result;


    inspection.comments =
        newComments.trim();


    syncWeldStatus(inspection.jointId);


    saveAllData();


    renderInspections();

    renderWelds();

    updateDashboard();

}


// =====================================================
// DELETE INSPECTION
// =====================================================

function deleteInspection(id) {

    const inspection =
        inspections.find(
            inspection =>
                inspection.id === id
        );


    if (!inspection) {
        return;
    }


    const confirmed =
        confirm(

            `Delete inspection for ${inspection.jointNumber}?`

        );


    if (!confirmed) {
        return;
    }


    const jointId = inspection.jointId;


    inspections =
        inspections.filter(
            inspection =>
                inspection.id !== id
        );


    syncWeldStatus(jointId);


    saveAllData();


    renderInspections();

    renderWelds();

    updateDashboard();

}


// =====================================================
// INITIAL LOAD
// =====================================================

syncAllWeldStatuses();

saveAllData();

loadProjectOptions();

loadInspectionProjects();

loadWeldProjectFilter();

loadInspectionProjectFilter();

renderProjects();

renderWelds();

renderInspections();

updateDashboard();
