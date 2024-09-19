document.getElementById("numPoints").addEventListener("input", generateInputs);

function generateInputs() {
    const numPoints = parseInt(document.getElementById("numPoints").value);
    const angleInputs = document.getElementById("angleInputs");
    const distanceInputs = document.getElementById("distanceInputs");

    angleInputs.innerHTML = "";
    distanceInputs.innerHTML = "";

    // Generate angle input fields
    for (let i = 1; i <= numPoints; i++) {
        angleInputs.innerHTML += `<label for="angle${i}"> </label>
                                  <input type="number" id="angle${i}" placeholder="Angle ${i}"required><br>`;
    }

    // Generate distance input fields
    for (let i = 1; i < numPoints; i++) {
        distanceInputs.innerHTML += `<label for="distance${i}"></label>
                                     <input type="number" id="distance${i}" placeholder="Distance from ${i} to ${i+1}" required><br>`;
    }
}

function calculateTraverse() {
    const numPoints = parseInt(document.getElementById("numPoints").value);
    const easting1 = parseFloat(document.getElementById("easting1").value);
    const northing1 = parseFloat(document.getElementById("northing1").value);
    const easting2 = parseFloat(document.getElementById("easting2").value);
    const northing2 = parseFloat(document.getElementById("northing2").value);

    // Collect observed angles and distances
    let angles = [];
    let distances = [];

    for (let i = 1; i <= numPoints; i++) {
        angles.push(parseFloat(document.getElementById(`angle${i}`).value));
    }
    for (let i = 1; i < numPoints; i++) {
        distances.push(parseFloat(document.getElementById(`distance${i}`).value));
    }

    // Step 4: Calculate the theoretical sum of angles and angular misclosure
    const theoreticalSum = (2 * numPoints - 4) * 90;
    const observedSum = angles.reduce((a, b) => a + b, 0);
    const angularMisclosure = observedSum - theoreticalSum;

    // Step 5: Distribute the angular misclosure equally among all angles
    const adjustmentPerAngle = angularMisclosure / numPoints;
    const adjustedAngles = angles.map(angle => angle - adjustmentPerAngle);

    // Step 6: Compute bearing from adjusted angles
    let bearings = [];
    let currentBearing = Math.atan2(northing2 - northing1, easting2 - easting1) * (180 / Math.PI); // Bearing from first two points

    bearings.push(currentBearing);  // First bearing

    for (let i = 1; i < numPoints - 1; i++) {
        currentBearing = (currentBearing + adjustedAngles[i]) % 360;  // Adjust bearing
        bearings.push(currentBearing);
    }

    // Step 8: Compute Easting and Northing using distance, sine, and cosine of bearing
    let eastings = [easting1];
    let northings = [northing1];

    for (let i = 0; i < distances.length; i++) {
        let bearingRad = bearings[i] * (Math.PI / 180);  // Convert bearing to radians
        let easting = eastings[i] + distances[i] * Math.cos(bearingRad);
        let northing = northings[i] + distances[i] * Math.sin(bearingRad);

        eastings.push(easting);
        northings.push(northing);
    }

    // Step 9: Apply Bowditch correction
    const eastingMisclosure = eastings[eastings.length - 1] - easting2;
    const northingMisclosure = northings[northings.length - 1] - northing2;

    for (let i = 1; i < eastings.length; i++) {
        eastings[i] -= eastingMisclosure * (distances[i - 1] / distances.reduce((a, b) => a + b, 0));
        northings[i] -= northingMisclosure * (distances[i - 1] / distances.reduce((a, b) => a + b, 0));
    }

    // Display Results
    document.getElementById("misclosureResult").textContent = `Angular Misclosure: ${angularMisclosure.toFixed(2)}°`;
    document.getElementById("adjustedAnglesResult").textContent = `Adjusted Angles: ${adjustedAngles.map(a => a.toFixed(2)).join(', ')}`;
    document.getElementById("bearingsResult").textContent = `Bearings: ${bearings.map(b => b.toFixed(2)).join(', ')}`;
    document.getElementById("coordinatesResult").textContent = `Coordinates (Eastings, Northings): ${eastings.map((e, i) => `(${e.toFixed(2)}, ${northings[i].toFixed(2)})`).join(', ')}`;
}
