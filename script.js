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
                ${inspection.jointNumber}
            </td>

            <td>
                ${inspection.inspector}
            </td>

            <td>
                ${inspection.method}
            </td>

            <td>
                ${inspection.result}
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


function renderProjects() {

    if (!projectTable) {
        return;
    }


    projectTable.innerHTML = "";


    projects.forEach(project => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${project.name}
            </td>

            <td>
                ${project.client}
            </td>

            <td>
                ${project.location}
            </td>

            <td>
                ${project.startDate}
            </td>

            <td>
                ${project.status}
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

                id: Date.now(),

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

    if (!weldProject) {
        return;
    }


    weldProject.innerHTML = `

        <option value="">
            Select Project
        </option>

    `;


    projects.forEach(project => {

        const option =
            document.createElement("option");


        option.value =
            project.id;


        option.textContent =
            project.name;


        weldProject.appendChild(option);

    });

}


// =====================================================
// RENDER WELDS
// =====================================================

function renderWelds() {

    if (!weldTable) {
        return;
    }


    weldTable.innerHTML = "";


    welds.forEach(weld => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${weld.projectName}
            </td>

            <td>
                ${weld.jointNumber}
            </td>

            <td>
                ${weld.welderId}
            </td>

            <td>
                ${weld.wpsNumber}
            </td>

            <td>
                ${weld.material}
            </td>

            <td>
                ${weld.thickness} mm
            </td>

            <td>
                ${weld.status}
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


            const newWeld = {

                id: Date.now(),

                projectId:
                    selectedProject.id,

                projectName:
                    selectedProject.name,

                jointNumber:
                    document
                    .getElementById("jointNumber")
                    .value
                    .trim(),

                welderId:
                    document
                    .getElementById("welderId")
                    .value
                    .trim(),

                wpsNumber:
                    document
                    .getElementById("wpsNumber")
                    .value
                    .trim(),

                material:
                    document
                    .getElementById("material")
                    .value
                    .trim(),

                thickness:
                    document
                    .getElementById("thickness")
                    .value,

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

    updateDashboard();

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

    if (!weldProjectFilter) {
        return;
    }


    weldProjectFilter.innerHTML = `

        <option value="">
            All Projects
        </option>

    `;


    projects.forEach(project => {

        const option =
            document.createElement("option");


        option.value =
            project.id;


        option.textContent =
            project.name;


        weldProjectFilter.appendChild(
            option
        );

    });

}


function filterWelds() {

    if (!weldTable) {
        return;
    }


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


    const filteredWelds =
        welds.filter(weld => {

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


    weldTable.innerHTML = "";


    filteredWelds.forEach(weld => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${weld.projectName}
            </td>

            <td>
                ${weld.jointNumber}
            </td>

            <td>
                ${weld.welderId}
            </td>

            <td>
                ${weld.wpsNumber}
            </td>

            <td>
                ${weld.material}
            </td>

            <td>
                ${weld.thickness} mm
            </td>

            <td>
                ${weld.status}
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
        filterWelds
    );

}


if (weldProjectFilter) {

    weldProjectFilter.addEventListener(
        "change",
        filterWelds
    );

}


if (weldStatusFilter) {

    weldStatusFilter.addEventListener(
        "change",
        filterWelds
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

            filterWelds();

        }
    );

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


// =====================================================
// LOAD INSPECTION PROJECTS
// =====================================================

function loadInspectionProjects() {

    if (!inspectionProject) {
        return;
    }


    inspectionProject.innerHTML = `

        <option value="">
            Select Project
        </option>

    `;


    projects.forEach(project => {

        const option =
            document.createElement("option");


        option.value =
            project.id;


        option.textContent =
            project.name;


        inspectionProject.appendChild(
            option
        );

    });

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


    inspectionJoint.innerHTML = `

        <option value="">
            Select Joint
        </option>

    `;


    if (!projectId) {
        return;
    }


    const projectWelds =
        welds.filter(
            weld =>
                weld.projectId == projectId
        );


    projectWelds.forEach(weld => {

        const option =
            document.createElement("option");


        option.value =
            weld.id;


        option.textContent =
            weld.jointNumber;


        inspectionJoint.appendChild(
            option
        );

    });

}


// =====================================================
// RENDER INSPECTIONS
// =====================================================

function renderInspections() {

    if (!inspectionRecords) {
        return;
    }


    inspectionRecords.innerHTML = "";


    inspections.forEach(inspection => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${inspection.projectName}
            </td>

            <td>
                ${inspection.jointNumber}
            </td>

            <td>
                ${inspection.method}
            </td>

            <td>
                ${inspection.inspector}
            </td>

            <td>
                ${inspection.date}
            </td>

            <td>
                ${inspection.result}
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

                id: Date.now(),

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


            saveAllData();


            renderInspections();

            updateDashboard();


            inspectionForm.reset();


            if (inspectionJoint) {

                inspectionJoint.innerHTML = `

                    <option value="">
                        Select Joint
                    </option>

                `;

            }

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


    const newInspector =
        prompt(
            "Inspector:",
            inspection.inspector
        );


    if (newInspector === null) {
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


    const newComments =
        prompt(
            "Comments:",
            inspection.comments || ""
        );


    if (newComments === null) {
        return;
    }


    inspection.method =
        newMethod.trim();


    inspection.inspector =
        newInspector.trim();


    inspection.date =
        newDate.trim();


    inspection.result =
        newResult.trim();


    inspection.comments =
        newComments.trim();


    saveAllData();


    renderInspections();

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


    inspections =
        inspections.filter(
            inspection =>
                inspection.id !== id
        );


    saveAllData();


    renderInspections();

    updateDashboard();

}


// =====================================================
// INITIAL LOAD
// =====================================================

renderProjects();

renderWelds();

renderInspections();

loadProjectOptions();

loadInspectionProjects();

loadWeldProjectFilter();

filterWelds();

updateDashboard();