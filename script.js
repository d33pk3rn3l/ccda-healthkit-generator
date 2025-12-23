// Constants
const DEFAULT_LOINC_CODE = '2345-7'; // Laboratory studies (set) - default LOINC code for lab panels

// Lab results counter
let labResultCounter = 0;

// Initialize the form
document.addEventListener('DOMContentLoaded', function() {
    // Set default dates
    document.getElementById('documentDate').valueAsDate = new Date();
    
    // Add initial lab result
    addLabResult();
    
    // Add event listeners
    document.getElementById('addLabResultBtn').addEventListener('click', addLabResult);
    document.getElementById('ccdaForm').addEventListener('submit', handleFormSubmit);
});

// Add a new lab result form
function addLabResult() {
    labResultCounter++;
    const container = document.getElementById('labResultsContainer');
    
    const labResultDiv = document.createElement('div');
    labResultDiv.className = 'lab-result-item';
    labResultDiv.id = `labResult${labResultCounter}`;
    
    labResultDiv.innerHTML = `
        <h3>Lab Result #${labResultCounter}</h3>
        ${labResultCounter > 1 ? '<button type="button" class="btn btn-danger" data-lab-id="' + labResultCounter + '">Remove</button>' : ''}
        <div class="form-row">
            <div class="form-group">
                <label for="labName${labResultCounter}">Test Name *</label>
                <input type="text" id="labName${labResultCounter}" name="labName${labResultCounter}" 
                       placeholder="e.g., Hemoglobin A1c" required>
            </div>
            <div class="form-group">
                <label for="labCode${labResultCounter}">LOINC Code</label>
                <input type="text" id="labCode${labResultCounter}" name="labCode${labResultCounter}" 
                       placeholder="e.g., 4548-4">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="labValue${labResultCounter}">Value *</label>
                <input type="text" id="labValue${labResultCounter}" name="labValue${labResultCounter}" 
                       placeholder="e.g., 5.7" required>
            </div>
            <div class="form-group">
                <label for="labUnit${labResultCounter}">Unit</label>
                <input type="text" id="labUnit${labResultCounter}" name="labUnit${labResultCounter}" 
                       placeholder="e.g., %, mg/dL">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="labRangeLow${labResultCounter}">Reference Range Low</label>
                <input type="text" id="labRangeLow${labResultCounter}" name="labRangeLow${labResultCounter}" 
                       placeholder="e.g., 4.0">
            </div>
            <div class="form-group">
                <label for="labRangeHigh${labResultCounter}">Reference Range High</label>
                <input type="text" id="labRangeHigh${labResultCounter}" name="labRangeHigh${labResultCounter}" 
                       placeholder="e.g., 5.6">
            </div>
        </div>
        <div class="form-group">
            <label for="labDate${labResultCounter}">Test Date *</label>
            <input type="date" id="labDate${labResultCounter}" name="labDate${labResultCounter}" required>
        </div>
    `;
    
    // Set default test date to today
    container.appendChild(labResultDiv);
    document.getElementById(`labDate${labResultCounter}`).valueAsDate = new Date();
    
    // Add event listener for remove button if it exists
    if (labResultCounter > 1) {
        const removeBtn = labResultDiv.querySelector('.btn-danger');
        removeBtn.addEventListener('click', function() {
            removeLabResult(labResultCounter);
        });
    }
}

// Remove a lab result
function removeLabResult(id) {
    const element = document.getElementById(`labResult${id}`);
    if (element) {
        element.remove();
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = collectFormData();
    
    // Generate C-CDA XML
    const xml = generateCCDAXML(formData);
    
    // Download the file
    downloadXML(xml, `lab-results-${formData.documentDate}.xml`);
}

// Collect all form data
function collectFormData() {
    const data = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        documentDate: document.getElementById('documentDate').value,
        performingOrg: document.getElementById('performingOrg').value || 'Laboratory',
        labResults: []
    };
    
    // Collect all lab results
    const labResultElements = document.querySelectorAll('.lab-result-item');
    labResultElements.forEach((element) => {
        const id = element.id.replace('labResult', '');
        const labResult = {
            name: document.getElementById(`labName${id}`).value,
            code: document.getElementById(`labCode${id}`).value || DEFAULT_LOINC_CODE,
            value: document.getElementById(`labValue${id}`).value,
            unit: document.getElementById(`labUnit${id}`).value || '',
            rangeLow: document.getElementById(`labRangeLow${id}`).value,
            rangeHigh: document.getElementById(`labRangeHigh${id}`).value,
            date: document.getElementById(`labDate${id}`).value
        };
        data.labResults.push(labResult);
    });
    
    return data;
}

// Generate C-CDA XML
function generateCCDAXML(data) {
    const now = new Date();
    const timestamp = formatDateTime(now);
    const docId = generateUUID();
    const patientId = generateUUID();
    
    let labResultsSection = '';
    data.labResults.forEach((lab, index) => {
        const labId = generateUUID();
        const effectiveTime = formatDate(lab.date);
        const interpretation = getInterpretation(lab.value, lab.rangeLow, lab.rangeHigh);
        
        let referenceRangeXML = '';
        if (lab.rangeLow && lab.rangeHigh) {
            referenceRangeXML = `
                                <referenceRange>
                                    <observationRange>
                                        <value xsi:type="IVL_PQ">
                                            <low value="${lab.rangeLow}" unit="${escapeXml(lab.unit)}"/>
                                            <high value="${lab.rangeHigh}" unit="${escapeXml(lab.unit)}"/>
                                        </value>
                                    </observationRange>
                                </referenceRange>`;
        }
        
        labResultsSection += `
                        <entry typeCode="DRIV">
                            <organizer classCode="BATTERY" moodCode="EVN">
                                <templateId root="2.16.840.1.113883.10.20.22.4.1" extension="2015-08-01"/>
                                <id root="${labId}"/>
                                <code code="${DEFAULT_LOINC_CODE}" codeSystem="2.16.840.1.113883.6.1" 
                                      codeSystemName="LOINC" displayName="Laboratory studies (set)"/>
                                <statusCode code="completed"/>
                                <effectiveTime value="${effectiveTime}"/>
                                <component>
                                    <observation classCode="OBS" moodCode="EVN">
                                        <templateId root="2.16.840.1.113883.10.20.22.4.2" extension="2015-08-01"/>
                                        <id root="${generateUUID()}"/>
                                        <code code="${lab.code}" codeSystem="2.16.840.1.113883.6.1" 
                                              codeSystemName="LOINC" displayName="${escapeXml(lab.name)}"/>
                                        <statusCode code="completed"/>
                                        <effectiveTime value="${effectiveTime}"/>
                                        <value xsi:type="PQ" value="${escapeXml(lab.value)}" unit="${escapeXml(lab.unit)}"/>
                                        <interpretationCode code="${interpretation}" 
                                                           codeSystem="2.16.840.1.113883.5.83"/>
                                        ${referenceRangeXML}
                                    </observation>
                                </component>
                            </organizer>
                        </entry>`;
    });
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="CDA.xsl"?>
<ClinicalDocument xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                  xmlns:sdtc="urn:hl7-org:sdtc" xsi:schemaLocation="urn:hl7-org:v3 CDA.xsd">
    <realmCode code="US"/>
    <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
    <templateId root="2.16.840.1.113883.10.20.22.1.1" extension="2015-08-01"/>
    <templateId root="2.16.840.1.113883.10.20.22.1.2" extension="2015-08-01"/>
    <id root="${docId}"/>
    <code code="34133-9" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" 
          displayName="Summarization of Episode Note"/>
    <title>Lab Results Summary</title>
    <effectiveTime value="${timestamp}"/>
    <confidentialityCode code="N" codeSystem="2.16.840.1.113883.5.25"/>
    <languageCode code="en-US"/>
    <recordTarget>
        <patientRole>
            <id root="${patientId}"/>
            <patient>
                <name>
                    <given>${escapeXml(data.firstName)}</given>
                    <family>${escapeXml(data.lastName)}</family>
                </name>
                <administrativeGenderCode code="${data.gender}" codeSystem="2.16.840.1.113883.5.1"/>
                <birthTime value="${formatDate(data.dateOfBirth)}"/>
            </patient>
        </patientRole>
    </recordTarget>
    <author>
        <time value="${timestamp}"/>
        <assignedAuthor>
            <id root="${generateUUID()}"/>
            <representedOrganization>
                <name>${escapeXml(data.performingOrg)}</name>
            </representedOrganization>
        </assignedAuthor>
    </author>
    <custodian>
        <assignedCustodian>
            <representedCustodianOrganization>
                <id root="${generateUUID()}"/>
                <name>${escapeXml(data.performingOrg)}</name>
            </representedCustodianOrganization>
        </assignedCustodian>
    </custodian>
    <component>
        <structuredBody>
            <component>
                <section>
                    <templateId root="2.16.840.1.113883.10.20.22.2.3.1" extension="2015-08-01"/>
                    <code code="30954-2" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" 
                          displayName="Relevant diagnostic tests/laboratory data Narrative"/>
                    <title>Laboratory Results</title>
                    <text>
                        <table border="1" width="100%">
                            <thead>
                                <tr>
                                    <th>Test</th>
                                    <th>Value</th>
                                    <th>Unit</th>
                                    <th>Reference Range</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
${data.labResults.map(lab => `                                <tr>
                                    <td>${escapeXml(lab.name)}</td>
                                    <td>${escapeXml(lab.value)}</td>
                                    <td>${escapeXml(lab.unit)}</td>
                                    <td>${lab.rangeLow && lab.rangeHigh ? `${escapeXml(lab.rangeLow)} - ${escapeXml(lab.rangeHigh)}` : 'N/A'}</td>
                                    <td>${escapeXml(lab.date)}</td>
                                </tr>`).join('\n')}
                            </tbody>
                        </table>
                    </text>
${labResultsSection}
                </section>
            </component>
        </structuredBody>
    </component>
</ClinicalDocument>`;
    
    return xml;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        // Return today's date if invalid
        return formatDateComponents(new Date());
    }
    return formatDateComponents(date);
}

function formatDateComponents(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function formatDateTime(date) {
    if (isNaN(date.getTime())) {
        date = new Date();
    }
    const dateStr = formatDateComponents(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${dateStr}${hours}${minutes}${seconds}`;
}

function generateUUID() {
    // Use crypto.randomUUID() if available (modern browsers), otherwise fallback to Math.random()
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function getInterpretation(value, rangeLow, rangeHigh) {
    if (!rangeLow || !rangeHigh) return 'N';
    
    const numValue = parseFloat(value);
    const numLow = parseFloat(rangeLow);
    const numHigh = parseFloat(rangeHigh);
    
    if (isNaN(numValue) || isNaN(numLow) || isNaN(numHigh)) return 'N';
    
    if (numValue < numLow) return 'L';
    if (numValue > numHigh) return 'H';
    return 'N';
}

function downloadXML(xml, filename) {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
